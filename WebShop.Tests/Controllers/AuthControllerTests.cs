using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Moq;
using WebShop.Api.Controllers;
using WebShop.Application.DTOs.Auth;
using WebShop.Application.Interfaces;

namespace WebShop.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _service = new();
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _controller = new AuthController(_service.Object);
    }

    [Fact]
    public async Task Register_ReturnsCreatedWithUser()
    {
        var dto = new RegisterUserDto("a@b.com", "Passw0rd!", "Passw0rd!");
        var user = new UserDto(1, "a@b.com", DateTime.UtcNow, new[] { "User" });
        _service.Setup(s => s.RegisterAsync(dto, It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var result = await _controller.Register(dto, CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Same(user, created.Value);
    }

    [Fact]
    public async Task Login_ReturnsOkWithTokens()
    {
        var dto = new LoginDto("a@b.com", "Passw0rd!");
        var response = new AuthResponseDto("access", "refresh", DateTime.UtcNow, DateTime.UtcNow);
        _service.Setup(s => s.LoginAsync(dto, It.IsAny<CancellationToken>())).ReturnsAsync(response);

        var result = await _controller.Login(dto, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Same(response, ok.Value);
    }

    [Fact]
    public async Task Refresh_ReturnsOkWithTokens()
    {
        var dto = new RefreshTokenDto("access", "refresh");
        var response = new AuthResponseDto("new", "new", DateTime.UtcNow, DateTime.UtcNow);
        _service.Setup(s => s.RefreshTokenAsync(dto, It.IsAny<CancellationToken>())).ReturnsAsync(response);

        var result = await _controller.Refresh(dto, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Logout_ReturnsNoContent()
    {
        var dto = new RefreshTokenDto("access", "refresh");
        _service.Setup(s => s.RevokeRefreshTokenAsync(dto.RefreshToken, It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        var result = await _controller.Logout(dto, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }
}