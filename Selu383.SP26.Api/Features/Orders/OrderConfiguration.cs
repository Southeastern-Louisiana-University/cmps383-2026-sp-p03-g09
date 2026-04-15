using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Orders;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(x => x.Total).HasColumnType("decimal(10,2)");
        builder.Property(x => x.OrderType).IsRequired().HasMaxLength(20);
        builder.Property(x => x.PaymentMethod).IsRequired().HasMaxLength(20);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.Property(x => x.UnitPrice).HasColumnType("decimal(10,2)");
        builder.Property(x => x.MenuItemName).IsRequired().HasMaxLength(120);
    }
}
