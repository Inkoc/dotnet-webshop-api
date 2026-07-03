using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Auth;
using WebShop.Domain.Entities;

namespace WebShop.Application.Mapping
{
    public static class MappingExtensions
    {
        public static UserDto ToUserDto(this User user)
        {
            var roles = user.UserRoles?
                .Select(ur => ur.Role.Name) ?? Enumerable.Empty<string>();

            return new UserDto(user.Id, user.Email, user.CreatedAt, roles);
        }
    }
}
