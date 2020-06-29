using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class AddDividendsTax : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "DefaultDividendTaxPercent",
                table: "Portfolios",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateTable(
                name: "CompanyPortfolio",
                columns: table => new
                {
                    CompanyTicker = table.Column<string>(nullable: false),
                    PortfolioId = table.Column<int>(nullable: false),
                    DividendTaxPercent = table.Column<double>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyPortfolio", x => new { x.CompanyTicker, x.PortfolioId });
                    table.ForeignKey(
                        name: "FK_CompanyPortfolio_Companies_CompanyTicker",
                        column: x => x.CompanyTicker,
                        principalTable: "Companies",
                        principalColumn: "Ticker",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompanyPortfolio_Portfolios_PortfolioId",
                        column: x => x.PortfolioId,
                        principalTable: "Portfolios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyPortfolio_PortfolioId",
                table: "CompanyPortfolio",
                column: "PortfolioId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyPortfolio");

            migrationBuilder.DropColumn(
                name: "DefaultDividendTaxPercent",
                table: "Portfolios");
        }
    }
}
