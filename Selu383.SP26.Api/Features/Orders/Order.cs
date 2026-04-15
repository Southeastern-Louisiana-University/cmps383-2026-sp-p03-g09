using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;

namespace Selu383.SP26.Api.Features.Orders;

public class Order
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public int LocationId { get; set; }
    public string OrderType { get; set; } = string.Empty;    // "dine_in", "carry_out", "drive_thru"
    public DateTime PickupTime { get; set; }
    public string PaymentMethod { get; set; } = string.Empty; // "card", "cash", "apple_pay", "google_pay"
    public string Status { get; set; } = "pending";
    public decimal Total { get; set; }
    public int PointsEarned { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual User? User { get; set; }
    public virtual Location Location { get; set; } = null!;
    public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
