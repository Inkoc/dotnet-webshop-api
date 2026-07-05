using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Moq;
using WebShop.Api.Controllers;
using WebShop.Application.DTOs.Review;
using WebShop.Application.Interfaces;

namespace WebShop.Tests.Controllers;

public class ReviewsControllerTests
{
    private readonly Mock<IReviewService> _service = new();
    private readonly ReviewsController _controller;

    public ReviewsControllerTests()
    {
        _controller = new ReviewsController(_service.Object);
    }

    private static ReviewDto SampleReview(int id = 1)
    {
        return new ReviewDto(id, 1, 5, 4, "good", DateTime.UtcNow);
    }

    [Fact]
    public async Task GetByProduct_ReturnsOk()
    {
        _service.Setup(s => s.GetByProductAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(new List<ReviewDto> { SampleReview() });

        var result = await _controller.GetByProduct(1, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetById_Missing_ReturnsNotFound()
    {
        _service.Setup(s => s.GetByIdAsync(99, It.IsAny<CancellationToken>())).ReturnsAsync((ReviewDto?)null);

        var result = await _controller.GetById(99, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_UsesCurrentUser_ReturnsCreated()
    {
        var dto = new CreateReviewDto(1, 4, "good");
        _service.Setup(s => s.CreateAsync(dto, 5, It.IsAny<CancellationToken>())).ReturnsAsync(SampleReview());
        _controller.WithUser(5);

        var result = await _controller.Create(dto, CancellationToken.None);

        Assert.IsType<CreatedAtActionResult>(result.Result);
        _service.Verify(s => s.CreateAsync(dto, 5, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Update_ReturnsNoContent()
    {
        _service.Setup(s => s.UpdateAsync(1, It.IsAny<UpdateReviewDto>(), 5, It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _controller.WithUser(5);

        var result = await _controller.Update(1, new UpdateReviewDto(3, "meh"), CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_PassesUserAndAdminFlag_ReturnsNoContent()
    {
        _service.Setup(s => s.DeleteAsync(1, 5, true, It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _controller.WithUser(5, isAdmin: true);

        var result = await _controller.Delete(1, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
        _service.Verify(s => s.DeleteAsync(1, 5, true, It.IsAny<CancellationToken>()), Times.Once);
    }
}