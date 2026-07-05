using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.User;

public record UpdateUserRolesDto(List<string> Roles);