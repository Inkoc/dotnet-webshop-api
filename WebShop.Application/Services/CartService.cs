using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Cart;
using WebShop.Application.Exceptions;
using WebShop.Application.Interfaces;
using WebShop.Application.Mapping;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.Application.Services;

public class CartService : ICartService
{
    private readonly IUnitOfWork _unitOfWork;

    public CartService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CartDto> GetMyCartAsync(int userId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);
        return cart.ToDto();
    }

    public async Task<CartDto> AddItemAsync(int userId, AddCartItemDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(dto.ProductId, cancellationToken);
        if (product is null)
        {
            throw new NotFoundException($"Product {dto.ProductId} not found.");
        }

        var cart = await GetOrCreateCartAsync(userId, cancellationToken);
        var item = cart.CartItems.FirstOrDefault(ci => ci.ProductId == dto.ProductId);
        var requestedQuantity = (item?.Quantity ?? 0) + dto.Quantity;

        if (requestedQuantity > product.StockQuantity)
        {
            throw new ConflictException($"Only {product.StockQuantity} units of '{product.Name}' in stock.");
        }

        if (item is null)
        {
            cart.CartItems.Add(new CartItem { ProductId = dto.ProductId, Quantity = dto.Quantity });
        }
        else
        {
            item.Quantity = requestedQuantity;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetMyCartAsync(userId, cancellationToken);
    }

    public async Task<CartDto> UpdateItemAsync(int userId, int productId, UpdateCartItemDto dto, CancellationToken cancellationToken = default)
    {
        var cart = await _unitOfWork.Carts.GetByUserAsync(userId, cancellationToken);
        var item = cart?.CartItems.FirstOrDefault(ci => ci.ProductId == productId);
        if (item is null)
        {
            throw new NotFoundException($"Product {productId} is not in the cart.");
        }

        if (dto.Quantity > item.Product.StockQuantity)
        {
            throw new ConflictException($"Only {item.Product.StockQuantity} units of '{item.Product.Name}' in stock.");
        }

        item.Quantity = dto.Quantity;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetMyCartAsync(userId, cancellationToken);
    }

    public async Task<CartDto> RemoveItemAsync(int userId, int productId, CancellationToken cancellationToken = default)
    {
        var cart = await _unitOfWork.Carts.GetByUserAsync(userId, cancellationToken);
        var item = cart?.CartItems.FirstOrDefault(ci => ci.ProductId == productId);
        if (item is null)
        {
            throw new NotFoundException($"Product {productId} is not in the cart.");
        }

        _unitOfWork.Repository<CartItem>().Delete(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetMyCartAsync(userId, cancellationToken);
    }

    public async Task ClearAsync(int userId, CancellationToken cancellationToken = default)
    {
        var cart = await _unitOfWork.Carts.GetByUserAsync(userId, cancellationToken);
        if (cart is null || cart.CartItems.Count == 0)
        {
            return;
        }

        foreach (var item in cart.CartItems.ToList())
        {
            _unitOfWork.Repository<CartItem>().Delete(item);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<Cart> GetOrCreateCartAsync(int userId, CancellationToken cancellationToken)
    {
        var cart = await _unitOfWork.Carts.GetByUserAsync(userId, cancellationToken);
        if (cart is not null)
        {
            return cart;
        }

        cart = new Cart { UserId = userId };
        await _unitOfWork.Carts.AddAsync(cart, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return cart;
    }
}
