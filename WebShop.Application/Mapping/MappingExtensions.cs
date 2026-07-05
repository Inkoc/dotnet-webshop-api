using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Auth;
using WebShop.Application.DTOs.Cart;
using WebShop.Application.DTOs.Category;
using WebShop.Application.DTOs.Order;
using WebShop.Application.DTOs.Product;
using WebShop.Application.DTOs.Review;
using WebShop.Domain.Entities;

namespace WebShop.Application.Mapping
{
    public static class MappingExtensions
    {
        public static UserDto ToUserDto(this User user)
        {
            var roles = user.UserRoles?
                .Select(ur => ur.Role.Name) ?? Enumerable.Empty<string>();

            return new UserDto(user.Id, user.Email, user.CreatedAt, roles);
        }
        public static CategoryDto ToDto(this Category category)
        {
            return new CategoryDto(category.Id, category.Name, category.Description);
        }

        public static Category ToEntity(this CreateCategoryDto dto)
        {
            return new Category { Name = dto.Name, Description = dto.Description };
        }

        public static ProductDto ToDto(this Product product)
        {
            return new ProductDto(
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.StockQuantity,
                product.CategoryId,
                product.Category?.Name ?? string.Empty);
        }

        public static Product ToEntity(this CreateProductDto dto)
        {
            return new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                CategoryId = dto.CategoryId
            };
        }

        public static ReviewDto ToDto(this Review review)
        {
            return new ReviewDto(
                review.Id,
                review.ProductId,
                review.UserId,
                review.Rating,
                review.Comment,
                review.CreatedAt);
        }

        public static Review ToEntity(this CreateReviewDto dto)
        {
            return new Review
            {
                ProductId = dto.ProductId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };
        }

        public static CartDto ToDto(this Cart cart)
        {
            var items = cart.CartItems.Select(ci => new CartItemDto(
                ci.ProductId,
                ci.Product?.Name ?? string.Empty,
                ci.Product?.Price ?? 0m,
                ci.Quantity,
                (ci.Product?.Price ?? 0m) * ci.Quantity)).ToList();

            var total = items.Sum(i => i.LineTotal);
            return new CartDto(cart.Id, items, total);
        }

        public static OrderItemDto ToDto(this OrderItem item)
        {
            return new OrderItemDto(
                item.ProductId,
                item.Product?.Name ?? string.Empty,
                item.UnitPrice,
                item.Quantity,
                item.UnitPrice * item.Quantity);
        }

        public static OrderDto ToDto(this Order order)
        {
            var items = order.OrderItems.Select(oi => oi.ToDto()).ToList();
            return new OrderDto(
                order.Id,
                order.UserId,
                order.CreatedAt,
                order.Status.ToString(),
                order.TotalAmount,
                items);
        }
    }
}
