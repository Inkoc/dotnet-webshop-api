using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Moq;
using WebShop.Api.Controllers;
using WebShop.Application.DTOs.Auth;
using WebShop.Application.DTOs.User;
using WebShop.Application.Interfaces;

namespace WebShop.Tests.Controllers;

public class UsersControllerTests
{
    private readonly Mock<IUserService> _service = new();
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _controller = new UsersController(_service.Object);
    }

    private static UserDto SampleUser(int id = 1)
    {
        return new UserDto(id, "a@b.com", DateTime.UtcNow, new[] { "User" });
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        _service.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<UserDto> { SampleUser() });

        var result = await _controller.GetAll(CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetById_Existing_ReturnsOk()
    {
        _service.Setup(s => s.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(SampleUser());

        var result = await _controller.GetById(1, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetById_Missing_ReturnsNotFound()
    {
        _service.Setup(s => s.GetByIdAsync(99, It.IsAny<CancellationToken>())).ReturnsAsync((UserDto?)null);

        var result = await _controller.GetById(99, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task UpdateRoles_ReturnsOk()
    {
        var dto = new UpdateUserRolesDto(new List<string> { "Admin", "User" });
        _service.Setup(s => s.UpdateRolesAsync(1, dto, It.IsAny<CancellationToken>())).ReturnsAsync(SampleUser());

        var result = await _controller.UpdateRoles(1, dto, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
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