using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Review;
using WebShop.Application.Exceptions;
using WebShop.Application.Interfaces;
using WebShop.Application.Mapping;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReviewService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ReviewDto>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        var reviews = await _unitOfWork.Reviews.GetByProductAsync(productId, cancellationToken);
        return reviews.Select(r => r.ToDto());
    }

    public async Task<ReviewDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(id, cancellationToken);
        return review?.ToDto();
    }

    public async Task<ReviewDto> CreateAsync(CreateReviewDto dto, int userId, CancellationToken cancellationToken = default)
    {
        var productExists = await _unitOfWork.Repository<Product>().ExistsAsync(dto.ProductId, cancellationToken);
        if (!productExists)
        {
            throw new NotFoundException($"Product {dto.ProductId} not found.");
        }

        var existing = await _unitOfWork.Reviews.GetByUserAndProductAsync(userId, dto.ProductId, cancellationToken);
        if (existing is not null)
        {
            throw new ConflictException("You have already reviewed this product.");
        }

        var review = dto.ToEntity();
        review.UserId = userId;

        await _unitOfWork.Reviews.AddAsync(review, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return review.ToDto();
    }

    public async Task UpdateAsync(int id, UpdateReviewDto dto, int userId, CancellationToken cancellationToken = default)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(id, cancellationToken);
        if (review is null)
        {
            throw new NotFoundException($"Review {id} not found.");
        }

        if (review.UserId != userId)
        {
            throw new ForbiddenException("You can only edit your own reviews.");
        }

        review.Rating = dto.Rating;
        review.Comment = dto.Comment;

        _unitOfWork.Reviews.Update(review);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(int id, int userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(id, cancellationToken);
        if (review is null)
        {
            throw new NotFoundException($"Review {id} not found.");
        }

        if (review.UserId != userId && !isAdmin)
        {
            throw new ForbiddenException("You can only delete your own reviews.");
        }

        _unitOfWork.Reviews.Delete(review);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
