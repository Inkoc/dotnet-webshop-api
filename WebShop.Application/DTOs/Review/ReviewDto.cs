using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Review;

public record ReviewDto(int Id, int ProductId, int UserId, int Rating, string? Comment, DateTime CreatedAt);
