using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Carniceria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPrecioVentaProducto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PrecioVentaKg",
                table: "Productos",
                type: "decimal(12,2)",
                precision: 12,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrecioVentaKg",
                table: "Productos");
        }
    }
}
