using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebShop.Application.Exceptions;
using WebShop.Application.DTOs.Auth;
using WebShop.Application.Interfaces;
using WebShop.Application.Mapping;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;

        private const int DefaultUserRoleId = 2; // seeded "User" role id

        public AuthService(
            IUnitOfWork unitOfWork,
            IPasswordHasher passwordHasher,
            ITokenService tokenService)
        {
            _unitOfWork = unitOfWork;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }
        public async Task<UserDto> RegisterAsync(RegisterUserDto dto, CancellationToken cancellationToken = default)
        {
            if (await _unitOfWork.Users.EmailExistsAsync(dto.Email, cancellationToken))
            {
                throw new UserAlreadyExistsException(dto.Email);
            }

            var (hash, salt) = _passwordHasher.HashPassword(dto.Password);

            var user = new User
            {
                Email = dto.Email.ToLower(),
                PasswordHash = hash,
                PasswordSalt = salt,
                CreatedAt = DateTime.UtcNow
            };

            user.UserRoles.Add(new UserRole { RoleId = DefaultUserRoleId });

            await _unitOfWork.Users.AddAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var savedUser = await _unitOfWork.Users.GetByIdAsync(user.Id, cancellationToken);
            return savedUser!.ToUserDto();
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(dto.Email, cancellationToken);
            if (user is null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt))
            {
                throw new AuthenticationException("Invalid email or password.");
            }

            return await GenerateTokensAsync(user, cancellationToken);
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto, CancellationToken cancellationToken = default)
        {
            var principal = _tokenService.GetPrincipalFromExpiredToken(dto.AccessToken);
            if (principal is null)
            {
                throw new InvalidRefreshTokenException();
            }

            var userIdClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                              ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new InvalidRefreshTokenException();
            }

            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new InvalidRefreshTokenException();
            }

            return await GenerateTokensAsync(user, cancellationToken);
        }

        public async Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByRefreshTokenAsync(refreshToken, cancellationToken);
            if (user is null) return;

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        private async Task<AuthResponseDto> GenerateTokensAsync(User user, CancellationToken cancellationToken)
        {
            var (accessToken, accessExpiry) = _tokenService.GenerateAccessToken(user);
            var (refreshToken, refreshExpiry) = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = refreshExpiry;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new AuthResponseDto(accessToken, refreshToken, accessExpiry, refreshExpiry);
        }
    }
}
