using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class RemovePortfolioParent : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Portfolios_Portfolios_ParentId",
                table: "Portfolios");

            migrationBuilder.DropIndex(
                name: "IX_Portfolios_ParentId",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "Portfolios");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "Portfolios",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Portfolios_ParentId",
                table: "Portfolios",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Portfolios_Portfolios_ParentId",
                table: "Portfolios",
                column: "ParentId",
                principalTable: "Portfolios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
