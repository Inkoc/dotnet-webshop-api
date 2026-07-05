using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WebShop.DAL.Data;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.DAL.Repositories;

public class CartRepository : Repository<Cart>, ICartRepository
{
    public CartRepository(WebShopDbContext context) : base(context)
    {
    }

    public async Task<Cart?> GetByUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
    }
}
