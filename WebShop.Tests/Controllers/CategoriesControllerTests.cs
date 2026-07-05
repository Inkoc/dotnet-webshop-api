using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Moq;
using WebShop.Api.Controllers;
using WebShop.Application.DTOs.Category;
using WebShop.Application.Interfaces;

namespace WebShop.Tests.Controllers;

public class CategoriesControllerTests
{
    private readonly Mock<ICategoryService> _service = new();
    private readonly CategoriesController _controller;

    public CategoriesControllerTests()
    {
        _controller = new CategoriesController(_service.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOkWithCategories()
    {
        var categories = new List<CategoryDto> { new(1, "Electronics", null) };
        _service.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(categories);

        var result = await _controller.GetAll(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Same(categories, ok.Value);
    }

    [Fact]
    public async Task GetById_ExistingId_ReturnsOk()
    {
        _service.Setup(s => s.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(new CategoryDto(1, "Books", null));

        var result = await _controller.GetById(1, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetById_MissingId_ReturnsNotFound()
    {
        _service.Setup(s => s.GetByIdAsync(99, It.IsAny<CancellationToken>())).ReturnsAsync((CategoryDto?)null);

        var result = await _controller.GetById(99, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsCreatedAtAction()
    {
        var dto = new CreateCategoryDto("New", null);
        _service.Setup(s => s.CreateAsync(dto, It.IsAny<CancellationToken>())).ReturnsAsync(new CategoryDto(5, "New", null));

        var result = await _controller.Create(dto, CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var value = Assert.IsType<CategoryDto>(created.Value);
        Assert.Equal(5, value.Id);
    }

    [Fact]
    public async Task Update_Existing_ReturnsNoContent()
    {
        _service.Setup(s => s.UpdateAsync(1, It.IsAny<UpdateCategoryDto>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var result = await _controller.Update(1, new UpdateCategoryDto("x", null), CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Update_Missing_ReturnsNotFound()
    {
        _service.Setup(s => s.UpdateAsync(1, It.IsAny<UpdateCategoryDto>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var result = await _controller.Update(1, new UpdateCategoryDto("x", null), CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_Existing_ReturnsNoContent()
    {
        _service.Setup(s => s.DeleteAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var result = await _controller.Delete(1, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_Missing_ReturnsNotFound()
    {
        _service.Setup(s => s.DeleteAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var result = await _controller.Delete(1, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }
}