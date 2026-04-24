using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.MenuItems;

namespace Selu383.SP26.Api.Controllers;

[Route("api/menu-items")]
[ApiController]
public class MenuItemsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<MenuItemDto>>> GetAll([FromQuery] bool? featured = null)
    {
        var query = dataContext.Set<MenuItem>()
            .Include(x => x.AddOns)
            .Include(x => x.Toggles)
            .AsQueryable();

        if (featured.HasValue)
            query = query.Where(x => x.IsFeatured == featured.Value);

        var items = await query
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

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<MenuItemDto>> Create(SaveMenuItemDto dto)
    {
        var item = new MenuItem
        {
            Name = dto.Name,
            Description = dto.Description,
            BasePrice = dto.HasSizes ? (dto.SmallPrice ?? 0) : dto.BasePrice,
            Category = dto.Category,
            HasSizes = dto.HasSizes,
            SmallPrice = dto.HasSizes ? dto.SmallPrice : null,
            MediumPrice = dto.HasSizes ? dto.MediumPrice : null,
            LargePrice = dto.HasSizes ? dto.LargePrice : null,
        };
        dataContext.Add(item);
        await dataContext.SaveChangesAsync();
        return Ok(ToDto(item));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<MenuItemDto>> Update(int id, SaveMenuItemDto dto)
    {
        var item = await dataContext.Set<MenuItem>()
            .Include(x => x.AddOns)
            .Include(x => x.Toggles)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (item == null) return NotFound();

        item.Name = dto.Name;
        item.Description = dto.Description;
        item.BasePrice = dto.HasSizes ? (dto.SmallPrice ?? 0) : dto.BasePrice;
        item.Category = dto.Category;
        item.HasSizes = dto.HasSizes;
        item.SmallPrice = dto.HasSizes ? dto.SmallPrice : null;
        item.MediumPrice = dto.HasSizes ? dto.MediumPrice : null;
        item.LargePrice = dto.HasSizes ? dto.LargePrice : null;

        await dataContext.SaveChangesAsync();
        return Ok(ToDto(item));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult> Delete(int id)
    {
        var item = await dataContext.Set<MenuItem>().FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();

        dataContext.Remove(item);
        await dataContext.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id}/featured")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<MenuItemDto>> SetFeatured(int id, SetFeaturedDto dto)
    {
        var item = await dataContext.Set<MenuItem>()
            .Include(x => x.AddOns)
            .Include(x => x.Toggles)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (item == null) return NotFound();

        item.IsFeatured = dto.IsFeatured;
        await dataContext.SaveChangesAsync();
        return Ok(ToDto(item));
    }

    [HttpPost("{id}/image")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<MenuItemDto>> UploadImage(int id, IFormFile file)
    {
        var item = await dataContext.Set<MenuItem>()
            .Include(x => x.AddOns)
            .Include(x => x.Toggles)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (item == null) return NotFound();
        if (file == null || file.Length == 0) return BadRequest("A file is required.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowed.Contains(ext)) return BadRequest("Only jpg, png, or webp images are allowed.");

        var imagesDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "menu");
        Directory.CreateDirectory(imagesDir);

        var filename = $"{id}{ext}";
        var filePath = Path.Combine(imagesDir, filename);
        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        item.ImageUrl = $"/images/menu/{filename}";
        await dataContext.SaveChangesAsync();
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
        SmallPrice = item.SmallPrice,
        MediumPrice = item.MediumPrice,
        LargePrice = item.LargePrice,
        ImageUrl = item.ImageUrl,
        IsFeatured = item.IsFeatured,
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

public class SetFeaturedDto
{
    public bool IsFeatured { get; set; }
}

public class SaveMenuItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool HasSizes { get; set; }
    public decimal? SmallPrice { get; set; }
    public decimal? MediumPrice { get; set; }
    public decimal? LargePrice { get; set; }
}
