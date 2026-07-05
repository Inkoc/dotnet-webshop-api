using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.Interfaces;
using WebShop.Application.Options;
using WebShop.Application.Services;

namespace WebShop.Application.Extensions
{
    public static class ApplicationServiceExtensions
    { 
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services, 
            IConfiguration configuration)
        {
            services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();
            services.AddScoped<ITokenService, TokenService>();

            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IProductService, ProductService>();

            services.AddValidatorsFromAssembly(typeof(ApplicationServiceExtensions).Assembly);

            return services;
        }
    }
}
