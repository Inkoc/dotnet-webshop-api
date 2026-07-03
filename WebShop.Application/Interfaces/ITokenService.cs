using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using WebShop.Domain.Entities;

namespace WebShop.Application.Interfaces
{
    public interface ITokenService
    {
        (string token, DateTime expiry) GenerateAccessToken(User user);
        (string token, DateTime expiry) GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
