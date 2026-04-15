namespace Selu383.SP26.Api.Features.MenuItems;

public class MenuItemToggle
{
    public int Id { get; set; }
    public int MenuItemId { get; set; }
    public string Label { get; set; } = string.Empty;
    public bool DefaultOn { get; set; } = true;

    public virtual MenuItem MenuItem { get; set; } = null!;
}
