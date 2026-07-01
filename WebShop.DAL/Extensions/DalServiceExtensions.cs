using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;
using WebShop.DAL.Data;

namespace WebShop.DAL.Extensions
{
    public static class DalServiceExtensions
    {
        public static IServiceCollection AddDalServices(this IServiceCollection services, string connectionString)
        {
            services.AddDbContext<WebShopDbContext>(options => options.UseNpgsql(connectionString));

            return services;
        }
    }
}
