using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Domain.Entities;

namespace WebShop.Domain.Interfaces;

public interface IReviewRepository : IRepository<Review>
{
    Task<IEnumerable<Review>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<Review?> GetByUserAndProductAsync(int userId, int productId, CancellationToken cancellationToken = default);
}
