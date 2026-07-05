using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Cart;

public record CartItemDto(int ProductId, string ProductName, decimal UnitPrice, int Quantity, decimal LineTotal);