using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Order;

namespace WebShop.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CheckoutAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<OrderDto>> GetMyOrdersAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<OrderDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<OrderDto> GetByIdAsync(int id, int userId, bool isAdmin, CancellationToken cancellationToken = default);
    Task UpdateStatusAsync(int id, UpdateOrderStatusDto dto, CancellationToken cancellationToken = default);
}