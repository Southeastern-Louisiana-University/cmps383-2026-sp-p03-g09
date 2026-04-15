using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.MenuItems;

namespace Selu383.SP26.Api.Controllers;

[Route("api/menu-items")]
[ApiController]
public class MenuItemsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<MenuItemDto>>> GetAll()
    {
        var items = await dataContext.Set<MenuItem>()
            .Include(x => x.AddOns)
            .Include(x => x.Toggles)
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Name)
            .ToListAsync();

        return Ok(items.Select(ToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MenuItemDto>> GetById(int id)
    {
        var item = await dataContext.Set<MenuItem>()
            .Include(x => x.AddOns)
            .Include(x => x.Toggles)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        return Ok(ToDto(item));
    }

    private static MenuItemDto ToDto(MenuItem item) => new()
    {
        Id = item.Id,
        Name = item.Name,
        Description = item.Description,
        BasePrice = item.BasePrice,
        Category = item.Category,
        HasSizes = item.HasSizes,
        AddOns = item.AddOns.Select(a => new MenuItemAddOnDto
        {
            Id = a.Id,
            Label = a.Label,
            Price = a.Price
        }).ToList(),
        Toggles = item.Toggles.Select(t => new MenuItemToggleDto
        {
            Id = t.Id,
            Label = t.Label,
            DefaultOn = t.DefaultOn
        }).ToList()
    };
}
