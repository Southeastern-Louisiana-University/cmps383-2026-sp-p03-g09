namespace Selu383.SP26.Api.Features.Orders;

public class CreateOrderDto
{
    public int LocationId { get; set; }
    public string OrderType { get; set; } = string.Empty;
    public DateTime PickupTime { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    public int MenuItemId { get; set; }
    public string? Size { get; set; }
    public int Quantity { get; set; }
    public List<int> SelectedAddOnIds { get; set; } = new();
    public List<string> SelectedToggleLabels { get; set; } = new();
}
