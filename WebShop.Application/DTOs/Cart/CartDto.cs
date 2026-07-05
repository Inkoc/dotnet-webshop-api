using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Cart;

public record CartDto(int Id, IEnumerable<CartItemDto> Items, decimal Total);