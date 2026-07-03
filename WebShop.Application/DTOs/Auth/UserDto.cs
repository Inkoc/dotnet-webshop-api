namespace WebShop.Application.DTOs.Auth;

public record UserDto(int Id, string Email, DateTime CreatedAt, IEnumerable<string> Roles);
