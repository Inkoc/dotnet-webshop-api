using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WebShop.DAL.Data;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.DAL.Repositories;

public class ReviewRepository : Repository<Review>, IReviewRepository
{
    public ReviewRepository(WebShopDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Review>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.ProductId == productId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Review?> GetByUserAndProductAsync(int userId, int productId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == productId, cancellationToken);
    }
}
