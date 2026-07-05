using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Review;

public record CreateReviewDto(int ProductId, int Rating, string? Comment);
