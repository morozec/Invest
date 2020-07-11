using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class AddCashFromCurrency : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AmountFrom",
                table: "CashTransactions",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrencyFromId",
                table: "CashTransactions",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CashTransactions_CurrencyFromId",
                table: "CashTransactions",
                column: "CurrencyFromId");

            migrationBuilder.AddForeignKey(
                name: "FK_CashTransactions_Currencies_CurrencyFromId",
                table: "CashTransactions",
                column: "CurrencyFromId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CashTransactions_Currencies_CurrencyFromId",
                table: "CashTransactions");

            migrationBuilder.DropIndex(
                name: "IX_CashTransactions_CurrencyFromId",
                table: "CashTransactions");

            migrationBuilder.DropColumn(
                name: "AmountFrom",
                table: "CashTransactions");

            migrationBuilder.DropColumn(
                name: "CurrencyFromId",
                table: "CashTransactions");
        }
    }
}
