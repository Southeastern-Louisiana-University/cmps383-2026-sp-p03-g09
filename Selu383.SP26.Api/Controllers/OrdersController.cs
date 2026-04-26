using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.MenuItems;
using Selu383.SP26.Api.Features.Orders;
using System.Text.Json;

namespace Selu383.SP26.Api.Controllers;

[Route("api/orders")]
[ApiController]
public class OrdersController(DataContext dataContext, UserManager<User> userManager) : ControllerBase
{
    private static decimal GetBaseForSize(MenuItem item, string? size) => size switch
    {
        "small"  => item.SmallPrice  ?? item.BasePrice,
        "medium" => item.MediumPrice ?? item.BasePrice + 0.75m,
        "large"  => item.LargePrice  ?? item.BasePrice + 1.50m,
        _        => item.BasePrice,
    };

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<OrderDto>>> GetMyOrders()
    {
        var userId = User.GetCurrentUserId();

        var orders = await dataContext.Set<Order>()
            .Include(x => x.Items)
            .Include(x => x.Location)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(ToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById(int id)
    {
        var order = await dataContext.Set<Order>()
            .Include(x => x.Items)
            .Include(x => x.Location)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null)
        {
            return NotFound();
        }

        var userId = User.GetCurrentUserId();
        if (order.UserId != null && order.UserId != userId && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        return Ok(ToDto(order));
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderDto dto)
    {
        if (!dto.Items.Any())
        {
            return BadRequest("Order must contain at least one item.");
        }

        var location = await dataContext.Set<Location>().FindAsync(dto.LocationId);
        if (location == null)
        {
            return BadRequest("Invalid location.");
        }

        if (dto.PickupTime <= DateTime.UtcNow)
        {
            return BadRequest("Pickup time must be in the future.");
        }

        if (dto.OrderType == "dine_in" && dto.TableNumber.HasValue)
        {
            if (dto.TableNumber < 1 || dto.TableNumber > location.TableCount)
            {
                return BadRequest("Invalid table number.");
            }

            if (dto.PickupTime <= DateTime.UtcNow.AddHours(2))
            {
                return BadRequest("Reservations must be made at least 2 hours in advance.");
            }

            if (location.OpenHour.HasValue && location.CloseHour.HasValue)
            {
                var localHour = dto.PickupTime.ToLocalTime().Hour;
                if (localHour < location.OpenHour.Value || localHour >= location.CloseHour.Value)
                {
                    return BadRequest("Reservation time is outside of business hours.");
                }
            }

            var windowStart = dto.PickupTime.AddMinutes(-90);
            var windowEnd   = dto.PickupTime.AddMinutes(90);
            var conflict = await dataContext.Set<Order>().AnyAsync(o =>
                o.LocationId   == dto.LocationId &&
                o.TableNumber  == dto.TableNumber &&
                o.OrderType    == "dine_in" &&
                o.PickupTime   >= windowStart &&
                o.PickupTime   <= windowEnd);

            if (conflict)
            {
                return BadRequest("That table is already reserved at that time.");
            }
        }

        var menuItemIds = dto.Items.Select(x => x.MenuItemId).Distinct().ToList();
        var menuItems = await dataContext.Set<MenuItem>()
            .Include(x => x.AddOns)
            .Where(x => menuItemIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id);

        decimal total = 0;
        var orderItems = new List<OrderItem>();

        foreach (var itemDto in dto.Items)
        {
            if (!menuItems.TryGetValue(itemDto.MenuItemId, out var menuItem))
            {
                return BadRequest($"Menu item {itemDto.MenuItemId} not found.");
            }

            var selectedAddOns = menuItem.AddOns
                .Where(a => itemDto.SelectedAddOnIds.Contains(a.Id))
                .ToList();

            var addOnsTotal = selectedAddOns.Sum(a => a.Price);
            var unitPrice = GetBaseForSize(menuItem, itemDto.Size) + addOnsTotal;

            var selectedAddOnsJson = JsonSerializer.Serialize(
                selectedAddOns.Select(a => new { id = a.Id, label = a.Label, price = a.Price }));
            var selectedTogglesJson = JsonSerializer.Serialize(itemDto.SelectedToggleLabels);

            orderItems.Add(new OrderItem
            {
                MenuItemId = itemDto.MenuItemId,
                MenuItemName = menuItem.Name,
                Size = itemDto.Size,
                Quantity = itemDto.Quantity,
                UnitPrice = unitPrice,
                SelectedAddOnsJson = selectedAddOnsJson,
                SelectedTogglesJson = selectedTogglesJson
            });

            total += unitPrice * itemDto.Quantity;
        }

        var userId = User.GetCurrentUserId();
        int pointsEarned = 0;

        if (userId != null)
        {
            pointsEarned = orderItems.Sum(x => x.Quantity) * 5;
            var user = await userManager.FindByIdAsync(userId.Value.ToString());
            if (user != null)
            {
                user.LoyaltyPoints += pointsEarned;
                await userManager.UpdateAsync(user);
            }
        }

        var order = new Order
        {
            UserId = userId,
            LocationId = dto.LocationId,
            OrderType = dto.OrderType,
            PickupTime = dto.PickupTime,
            PaymentMethod = dto.PaymentMethod,
            Status = "confirmed",
            Total = total,
            PointsEarned = pointsEarned,
            CreatedAt = DateTime.UtcNow,
            TableNumber = dto.OrderType == "dine_in" ? dto.TableNumber : null,
            Items = orderItems
        };

        dataContext.Set<Order>().Add(order);
        await dataContext.SaveChangesAsync();

        order.Location = location;

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, ToDto(order));
    }

    private static OrderDto ToDto(Order order) => new()
    {
        Id = order.Id,
        UserId = order.UserId,
        LocationId = order.LocationId,
        LocationName = order.Location?.Name ?? string.Empty,
        OrderType = order.OrderType,
        PickupTime = order.PickupTime,
        PaymentMethod = order.PaymentMethod,
        Status = order.Status,
        Total = order.Total,
        PointsEarned = order.PointsEarned,
        CreatedAt = order.CreatedAt,
        TableNumber = order.TableNumber,
        Items = order.Items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            MenuItemId = i.MenuItemId,
            MenuItemName = i.MenuItemName,
            Size = i.Size,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            SelectedAddOnsJson = i.SelectedAddOnsJson,
            SelectedTogglesJson = i.SelectedTogglesJson
        }).ToList()
    };
}
