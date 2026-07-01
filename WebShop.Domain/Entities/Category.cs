using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Domain.Entities
{
    public class Category : BaseEntity
    {
        public String Name { get; set; } = string.Empty;
        public String? Description { get; set; }
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
