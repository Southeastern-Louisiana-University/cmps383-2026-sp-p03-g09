namespace Selu383.SP26.Api.Features.MenuItems;

public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string Category { get; set; } = string.Empty; // "drinks", "sweet crepes", "savory crepes", "bagels"
    public bool HasSizes { get; set; }

    public decimal? SmallPrice { get; set; }
    public decimal? MediumPrice { get; set; }
    public decimal? LargePrice { get; set; }

    public virtual ICollection<MenuItemAddOn> AddOns { get; set; } = new List<MenuItemAddOn>();
    public virtual ICollection<MenuItemToggle> Toggles { get; set; } = new List<MenuItemToggle>();
}
