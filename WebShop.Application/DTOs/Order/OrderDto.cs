using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Order;

public record OrderDto(int Id, int UserId, DateTime CreatedAt, string Status, decimal TotalAmount, IEnumerable<OrderItemDto> Items);