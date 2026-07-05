using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Cart;

namespace WebShop.Application.Validators;

public class UpdateCartItemDtoValidator : AbstractValidator<UpdateCartItemDto>
{
    public UpdateCartItemDtoValidator()
    {
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}