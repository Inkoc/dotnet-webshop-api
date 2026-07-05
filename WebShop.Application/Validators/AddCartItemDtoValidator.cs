using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Cart;

namespace WebShop.Application.Validators;

public class AddCartItemDtoValidator : AbstractValidator<AddCartItemDto>
{
    public AddCartItemDtoValidator()
    {
        RuleFor(x => x.ProductId).GreaterThan(0);
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}