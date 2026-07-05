using WebShop.Application.DTOs.Auth;
using WebShop.Application.DTOs.User;
using WebShop.Application.Exceptions;
using WebShop.Application.Interfaces;
using WebShop.Application.Mapping;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = await _unitOfWork.Users.GetAllAsync(cancellationToken);
        return users.Select(u => u.ToUserDto());
    }

    public async Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
        return user?.ToUserDto();
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return false;
        }

        _unitOfWork.Users.Delete(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<UserDto> UpdateRolesAsync(int id, UpdateUserRolesDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            throw new NotFoundException($"User {id} not found.");
        }

        var allRoles = await _unitOfWork.Repository<Role>().GetAllAsync(cancellationToken);

        var invalid = dto.Roles
            .Where(name => !allRoles.Any(r => string.Equals(r.Name, name, StringComparison.OrdinalIgnoreCase)))
            .ToList();
        if (invalid.Count > 0)
        {
            throw new NotFoundException($"Unknown role(s): {string.Join(", ", invalid)}.");
        }

        var targetRoles = allRoles
            .Where(r => dto.Roles.Any(name => string.Equals(r.Name, name, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        user.UserRoles.Clear();
        foreach (var role in targetRoles)
        {
            user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        }

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _unitOfWork.Users.GetByIdAsync(user.Id, cancellationToken);
        return updated!.ToUserDto();
    }
}
