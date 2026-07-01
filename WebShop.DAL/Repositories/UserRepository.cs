using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using WebShop.DAL.Data;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.DAL.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(WebShopDbContext context) : base(context) { }

        public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .AnyAsync(u => u.Email == email.ToLower(), cancellationToken);
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == email.ToLower(), cancellationToken);
        }

        public override async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        }

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken, cancellationToken);
        }
    }
}
