using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSizePrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "LargePrice",
                table: "MenuItems",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MediumPrice",
                table: "MenuItems",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SmallPrice",
                table: "MenuItems",
                type: "decimal(10,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LargePrice",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "MediumPrice",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "SmallPrice",
                table: "MenuItems");
        }
    }
}
