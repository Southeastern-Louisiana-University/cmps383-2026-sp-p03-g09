using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.MenuItems;

public class MenuItemConfiguration : IEntityTypeConfiguration<MenuItem>
{
    public void Configure(EntityTypeBuilder<MenuItem> builder)
    {
        builder.Property(x => x.Name).IsRequired().HasMaxLength(120);
        builder.Property(x => x.Category).IsRequired().HasMaxLength(60);
        builder.Property(x => x.ImageUrl).HasMaxLength(500);
        builder.Property(x => x.BasePrice).HasColumnType("decimal(10,2)");
        builder.Property(x => x.SmallPrice).HasColumnType("decimal(10,2)");
        builder.Property(x => x.MediumPrice).HasColumnType("decimal(10,2)");
        builder.Property(x => x.LargePrice).HasColumnType("decimal(10,2)");
    }
}

public class MenuItemAddOnConfiguration : IEntityTypeConfiguration<MenuItemAddOn>
{
    public void Configure(EntityTypeBuilder<MenuItemAddOn> builder)
    {
        builder.Property(x => x.Label).IsRequired().HasMaxLength(80);
        builder.Property(x => x.Price).HasColumnType("decimal(10,2)");
    }
}

public class MenuItemToggleConfiguration : IEntityTypeConfiguration<MenuItemToggle>
{
    public void Configure(EntityTypeBuilder<MenuItemToggle> builder)
    {
        builder.Property(x => x.Label).IsRequired().HasMaxLength(80);
    }
}
