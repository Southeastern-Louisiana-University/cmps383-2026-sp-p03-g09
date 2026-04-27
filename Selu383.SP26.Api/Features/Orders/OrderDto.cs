namespace Selu383.SP26.Api.Features.Orders;

public class OrderDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public int LocationId { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string OrderType { get; set; } = string.Empty;
    public DateTime PickupTime { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int PointsEarned { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? TableNumber { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int MenuItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty;
    public string? Size { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string SelectedAddOnsJson { get; set; } = "[]";
    public string SelectedTogglesJson { get; set; } = "[]";
}
