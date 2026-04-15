namespace Selu383.SP26.Api.Features.MenuItems;

public class MenuItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool HasSizes { get; set; }
    public List<MenuItemAddOnDto> AddOns { get; set; } = new();
    public List<MenuItemToggleDto> Toggles { get; set; } = new();
}

public class MenuItemAddOnDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public class MenuItemToggleDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public bool DefaultOn { get; set; }
}
