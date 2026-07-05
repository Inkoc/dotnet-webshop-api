using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Application.DTOs.Cart;
using WebShop.Application.Interfaces;

namespace WebShop.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetMyCart(CancellationToken cancellationToken)
    {
        return Ok(await _cartService.GetMyCartAsync(GetCurrentUserId(), cancellationToken));
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem(AddCartItemDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _cartService.AddItemAsync(GetCurrentUserId(), dto, cancellationToken));
    }

    [HttpPut("items/{productId}")]
    public async Task<ActionResult<CartDto>> UpdateItem(int productId, UpdateCartItemDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _cartService.UpdateItemAsync(GetCurrentUserId(), productId, dto, cancellationToken));
    }

    [HttpDelete("items/{productId}")]
    public async Task<ActionResult<CartDto>> RemoveItem(int productId, CancellationToken cancellationToken)
    {
        return Ok(await _cartService.RemoveItemAsync(GetCurrentUserId(), productId, cancellationToken));
    }

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken cancellationToken)
    {
        await _cartService.ClearAsync(GetCurrentUserId(), cancellationToken);
        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return int.Parse(value!);
    }
}