using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using WebShop.Application.DTOs.Auth;
using WebShop.Application.Interfaces;

namespace WebShop.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterUserDto dto, CancellationToken cancellationToken)
        {
            var user = await _authService.RegisterAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(Register), user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto, CancellationToken cancellationToken)
        {
            var authResponse = await _authService.LoginAsync(dto, cancellationToken);
            return Ok(authResponse);
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponseDto>> Refresh(RefreshTokenDto dto, CancellationToken cancellationToken)
        {
            var authResponse = await _authService.RefreshTokenAsync(dto, cancellationToken);
            return Ok(authResponse);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout(RefreshTokenDto dto, CancellationToken cancellationToken)
        {
            await _authService.RevokeRefreshTokenAsync(dto.RefreshToken, cancellationToken);
            return NoContent();
        }
    }
}
