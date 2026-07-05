using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Product;

public record UpdateProductDto(string Name, string? Description, decimal Price, int StockQuantity, int CategoryId);
