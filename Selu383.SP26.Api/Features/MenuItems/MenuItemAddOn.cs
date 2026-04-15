namespace Selu383.SP26.Api.Features.MenuItems;

public class MenuItemAddOn
{
    public int Id { get; set; }
    public int MenuItemId { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Price { get; set; }

    public virtual MenuItem MenuItem { get; set; } = null!;
}
