using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Moq;
using WebShop.Api.Controllers;
using WebShop.Application.DTOs.Cart;
using WebShop.Application.Interfaces;

namespace WebShop.Tests.Controllers;

public class CartControllerTests
{
    private readonly Mock<ICartService> _service = new();
    private readonly CartController _controller;

    public CartControllerTests()
    {
        _controller = new CartController(_service.Object);
    }

    private static CartDto EmptyCart()
    {
        return new CartDto(1, new List<CartItemDto>(), 0m);
    }

    [Fact]
    public async Task GetMyCart_ReturnsOk()
    {
        _service.Setup(s => s.GetMyCartAsync(5, It.IsAny<CancellationToken>())).ReturnsAsync(EmptyCart());
        _controller.WithUser(5);

        var result = await _controller.GetMyCart(CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task AddItem_UsesCurrentUser_ReturnsOk()
    {
        var dto = new AddCartItemDto(1, 2);
        _service.Setup(s => s.AddItemAsync(5, dto, It.IsAny<CancellationToken>())).ReturnsAsync(EmptyCart());
        _controller.WithUser(5);

        var result = await _controller.AddItem(dto, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
        _service.Verify(s => s.AddItemAsync(5, dto, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateItem_ReturnsOk()
    {
        _service.Setup(s => s.UpdateItemAsync(5, 1, It.IsAny<UpdateCartItemDto>(), It.IsAny<CancellationToken>())).ReturnsAsync(EmptyCart());
        _controller.WithUser(5);

        var result = await _controller.UpdateItem(1, new UpdateCartItemDto(3), CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task RemoveItem_ReturnsOk()
    {
        _service.Setup(s => s.RemoveItemAsync(5, 1, It.IsAny<CancellationToken>())).ReturnsAsync(EmptyCart());
        _controller.WithUser(5);

        var result = await _controller.RemoveItem(1, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Clear_ReturnsNoContent()
    {
        _service.Setup(s => s.ClearAsync(5, It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _controller.WithUser(5);

        var result = await _controller.Clear(CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }
}