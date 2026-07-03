namespace WebShop.Application.DTOs.Auth;

public record RegisterUserDto(string Email, string Password, string ConfirmPassword);
