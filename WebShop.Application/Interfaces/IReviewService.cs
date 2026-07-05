using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Review;

namespace WebShop.Application.Interfaces;

public interface IReviewService
{
    Task<IEnumerable<ReviewDto>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<ReviewDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ReviewDto> CreateAsync(CreateReviewDto dto, int userId, CancellationToken cancellationToken = default);
    Task UpdateAsync(int id, UpdateReviewDto dto, int userId, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, int userId, bool isAdmin, CancellationToken cancellationToken = default);
}
