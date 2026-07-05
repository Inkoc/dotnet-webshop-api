using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Auth;
using WebShop.Application.DTOs.User;

namespace WebShop.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<UserDto> UpdateRolesAsync(int id, UpdateUserRolesDto dto, CancellationToken cancellationToken = default);
}