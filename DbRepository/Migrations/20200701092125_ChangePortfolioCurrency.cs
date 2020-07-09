using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class ChangePortfolioCurrency : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Portfolios");

            migrationBuilder.AddColumn<int>(
                name: "CurrencyId",
                table: "Portfolios",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Portfolios_CurrencyId",
                table: "Portfolios",
                column: "CurrencyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Portfolios_Currencies_CurrencyId",
                table: "Portfolios",
                column: "CurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Portfolios_Currencies_CurrencyId",
                table: "Portfolios");

            migrationBuilder.DropIndex(
                name: "IX_Portfolios_CurrencyId",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "Portfolios");

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "Portfolios",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
