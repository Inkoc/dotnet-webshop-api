using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Auth;
using WebShop.Application.DTOs.Category;
using WebShop.Application.DTOs.Product;
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
    }
}
