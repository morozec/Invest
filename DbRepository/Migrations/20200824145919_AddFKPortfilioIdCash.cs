using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class AddFKPortfilioIdCash : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_Portfolios_PortfolioId",
                table: "CashTransactions");

            migrationBuilder.AlterColumn<int>(
                name: "PortfolioId",
                table: "CashTransactions",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CashTransactions_Portfolios_PortfolioId",
                table: "CashTransactions",
                column: "PortfolioId",
                principalTable: "Portfolios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_Portfolios_PortfolioId",
                table: "CashTransactions");

            migrationBuilder.AlterColumn<int>(
                name: "PortfolioId",
                table: "CashTransactions",
                type: "int",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_CashTransactions_Portfolios_PortfolioId",
                table: "CashTransactions",
                column: "PortfolioId",
                principalTable: "Portfolios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
