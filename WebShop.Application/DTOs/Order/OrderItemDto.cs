using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Order;

public record OrderItemDto(int ProductId, string ProductName, decimal UnitPrice, int Quantity, decimal LineTotal);