using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Order;
using WebShop.Application.Exceptions;
using WebShop.Application.Interfaces;
using WebShop.Application.Mapping;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;

    public OrderService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<OrderDto> CheckoutAsync(int userId, CancellationToken cancellationToken = default)
    {
        var cart = await _unitOfWork.Carts.GetByUserAsync(userId, cancellationToken);
        if (cart is null || cart.CartItems.Count == 0)
        {
            throw new ConflictException("Cart is empty.");
        }

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var cartItem in cart.CartItems)
        {
            var product = cartItem.Product;
            if (product.StockQuantity < cartItem.Quantity)
            {
                throw new ConflictException($"Only {product.StockQuantity} units of '{product.Name}' in stock.");
            }

            order.OrderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = cartItem.Quantity,
                UnitPrice = product.Price
            });

            product.StockQuantity -= cartItem.Quantity;
        }

        order.TotalAmount = order.OrderItems.Sum(oi => oi.UnitPrice * oi.Quantity);

        await _unitOfWork.Orders.AddAsync(order, cancellationToken);

        foreach (var cartItem in cart.CartItems.ToList())
        {
            _unitOfWork.Repository<CartItem>().Delete(cartItem);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var saved = await _unitOfWork.Orders.GetByIdAsync(order.Id, cancellationToken);
        return saved!.ToDto();
    }

    public async Task<IEnumerable<OrderDto>> GetMyOrdersAsync(int userId, CancellationToken cancellationToken = default)
    {
        var orders = await _unitOfWork.Orders.GetByUserAsync(userId, cancellationToken);
        return orders.Select(o => o.ToDto());
    }

    public async Task<IEnumerable<OrderDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var orders = await _unitOfWork.Orders.GetAllWithItemsAsync(cancellationToken);
        return orders.Select(o => o.ToDto());
    }

    public async Task<OrderDto> GetByIdAsync(int id, int userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
        if (order is null)
        {
            throw new NotFoundException($"Order {id} not found.");
        }

        if (order.UserId != userId && !isAdmin)
        {
            throw new ForbiddenException("You can only view your own orders.");
        }

        return order.ToDto();
    }

    public async Task UpdateStatusAsync(int id, UpdateOrderStatusDto dto, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
        if (order is null)
        {
            throw new NotFoundException($"Order {id} not found.");
        }

        if (!Enum.TryParse<OrderStatus>(dto.Status, true, out var status))
        {
            throw new ArgumentException($"Invalid order status '{dto.Status}'.");
        }

        order.Status = status;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}