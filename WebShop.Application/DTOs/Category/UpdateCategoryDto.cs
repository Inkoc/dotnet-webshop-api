using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Category
{
    public record UpdateCategoryDto(string Name, string? Description);
}
