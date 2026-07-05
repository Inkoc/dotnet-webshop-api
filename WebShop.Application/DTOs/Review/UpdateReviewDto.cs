using System;
using System.Collections.Generic;
using System.Text;

namespace WebShop.Application.DTOs.Review;

public record UpdateReviewDto(int Rating, string? Comment);
