using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Moq;
using WebShop.Api.Controllers;
using WebShop.Application.DTOs.Order;
using WebShop.Application.Interfaces;

namespace WebShop.Tests.Controllers;

public class OrdersControllerTests
{
    private readonly Mock<IOrderService> _service = new();
    private readonly OrdersController _controller;

    public OrdersControllerTests()
    {
        _controller = new OrdersController(_service.Object);
    }

    private static OrderDto SampleOrder(int id = 1)
    {
        return new OrderDto(id, 5, DateTime.UtcNow, "Pending", 10m, new List<OrderItemDto>());
    }

    [Fact]
    public async Task Checkout_UsesCurrentUser_ReturnsCreated()
    {
        _service.Setup(s => s.CheckoutAsync(5, It.IsAny<CancellationToken>())).ReturnsAsync(SampleOrder());
        _controller.WithUser(5);

        var result = await _controller.Checkout(CancellationToken.None);

        Assert.IsType<CreatedAtActionResult>(result.Result);
        _service.Verify(s => s.CheckoutAsync(5, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetMyOrders_ReturnsOk()
    {
        _service.Setup(s => s.GetMyOrdersAsync(5, It.IsAny<CancellationToken>())).ReturnsAsync(new List<OrderDto> { SampleOrder() });
        _controller.WithUser(5);

        var result = await _controller.GetMyOrders(CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        _service.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<OrderDto> { SampleOrder() });

        var result = await _controller.GetAll(CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetById_PassesUserAndAdminFlag_ReturnsOk()
    {
        _service.Setup(s => s.GetByIdAsync(1, 5, true, It.IsAny<CancellationToken>())).ReturnsAsync(SampleOrder());
        _controller.WithUser(5, isAdmin: true);

        var result = await _controller.GetById(1, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
        _service.Verify(s => s.GetByIdAsync(1, 5, true, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateStatus_ReturnsNoContent()
    {
        _service.Setup(s => s.UpdateStatusAsync(1, It.IsAny<UpdateOrderStatusDto>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        var result = await _controller.UpdateStatus(1, new UpdateOrderStatusDto("Shipped"), CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }
}