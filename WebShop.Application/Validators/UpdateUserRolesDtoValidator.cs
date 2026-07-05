using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.User;

namespace WebShop.Application.Validators;

public class UpdateUserRolesDtoValidator : AbstractValidator<UpdateUserRolesDto>
{
    public UpdateUserRolesDtoValidator()
    {
        RuleFor(x => x.Roles).NotEmpty();
        RuleForEach(x => x.Roles).NotEmpty();
    }
}