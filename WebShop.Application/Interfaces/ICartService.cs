using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Cart;

namespace WebShop.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetMyCartAsync(int userId, CancellationToken cancellationToken = default);
    Task<CartDto> AddItemAsync(int userId, AddCartItemDto dto, CancellationToken cancellationToken = default);
    Task<CartDto> UpdateItemAsync(int userId, int productId, UpdateCartItemDto dto, CancellationToken cancellationToken = default);
    Task<CartDto> RemoveItemAsync(int userId, int productId, CancellationToken cancellationToken = default);
    Task ClearAsync(int userId, CancellationToken cancellationToken = default);
}