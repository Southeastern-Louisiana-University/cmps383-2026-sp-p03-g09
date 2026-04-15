using Selu383.SP26.Api.Features.MenuItems;

namespace Selu383.SP26.Api.Features.Orders;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int MenuItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty; // denormalized for history
    public string? Size { get; set; }                         // "small", "medium", "large", or null
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string SelectedAddOnsJson { get; set; } = "[]";   // [{id,label,price}]
    public string SelectedTogglesJson { get; set; } = "[]";  // ["Toasted"]

    public virtual Order Order { get; set; } = null!;
    public virtual MenuItem MenuItem { get; set; } = null!;
}
