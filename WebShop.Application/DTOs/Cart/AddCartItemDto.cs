using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Cart;

public record AddCartItemDto(int ProductId, int Quantity);