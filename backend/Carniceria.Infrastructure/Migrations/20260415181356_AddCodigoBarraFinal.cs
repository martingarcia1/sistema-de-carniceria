using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Carniceria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCodigoBarraFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CodigoBarra",
                table: "Productos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CodigoBarra",
                table: "Productos");
        }
    }
}
