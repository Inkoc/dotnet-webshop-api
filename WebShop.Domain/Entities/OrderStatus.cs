using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Domain.Entities
{
    public enum OrderStatus
    {
        Pending,
        Paid,
        Shipped,
        Delivered,
        Cancelled
    }
}
