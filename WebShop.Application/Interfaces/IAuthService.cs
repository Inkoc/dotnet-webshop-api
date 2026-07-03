using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Auth;

namespace WebShop.Application.Interfaces
{
    public interface IAuthService
    {
        Task<UserDto> RegisterAsync(RegisterUserDto dto, CancellationToken cancellationToken = default);
        Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
        Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto, CancellationToken cancellationToken = default);
        Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    }
}
