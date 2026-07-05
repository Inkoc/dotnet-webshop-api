using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Product;

public record ProductDto(int Id, string Name, string? Description, decimal Price, int StockQuantity, int CategoryId, string CategoryName);
