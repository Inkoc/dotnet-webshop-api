using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Product;

public record CreateProductDto(string Name, string? Description, decimal Price, int StockQuantity, int CategoryId);
