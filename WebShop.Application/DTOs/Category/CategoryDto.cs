using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Category
{
    public record CategoryDto(int Id, string Name, string? Description);
}
