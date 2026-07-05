using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Options;
using WebShop.Application.Interfaces;
using WebShop.Application.Options;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.Application.Services;

public class DbSeeder : IDbSeeder
{
    private const int AdminRoleId = 1;
    private const int UserRoleId = 2;
    private const string AdminRoleName = "Admin";

    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly AdminSeedOptions _options;

    public DbSeeder(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IOptions<AdminSeedOptions> options)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _options = options.Value;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await _unitOfWork.Users.AnyInRoleAsync(AdminRoleName, cancellationToken))
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(_options.Email) || string.IsNullOrWhiteSpace(_options.Password))
        {
            return;
        }

        var email = _options.Email.ToLower();
        var (hash, salt) = _passwordHasher.HashPassword(_options.Password);

        var admin = new User
        {
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt,
            CreatedAt = DateTime.UtcNow
        };
        admin.UserRoles.Add(new UserRole { RoleId = AdminRoleId });
        admin.UserRoles.Add(new UserRole { RoleId = UserRoleId });

        await _unitOfWork.Users.AddAsync(admin, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}