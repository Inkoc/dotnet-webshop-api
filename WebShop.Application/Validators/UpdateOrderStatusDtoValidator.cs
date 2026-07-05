using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Order;
using WebShop.Domain.Entities;

namespace WebShop.Application.Validators;

public class UpdateOrderStatusDtoValidator : AbstractValidator<UpdateOrderStatusDto>
{
    public UpdateOrderStatusDtoValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(status => Enum.TryParse<OrderStatus>(status, true, out _))
            .WithMessage("Status must be one of: Pending, Paid, Shipped, Cancelled.");
    }
}