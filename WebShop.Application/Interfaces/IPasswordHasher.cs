using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.Interfaces
{
    public interface IPasswordHasher
    {
        (string hash, string salt) HashPassword(string password);
        bool VerifyPassword(string password, string hash, string salt);
    }
}
