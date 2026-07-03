namespace WebShop.Application.DTOs.Auth;

public record AuthResponseDto(string AccessToken, string RefreshToken, DateTime AccessTokenExpiry, DateTime RefreshTokenExpiry);
