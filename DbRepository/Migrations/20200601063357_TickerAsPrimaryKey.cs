using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class TickerAsPrimaryKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CompanyWatchList_Companies_CompanyId",
                table: "CompanyWatchList");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CompanyWatchList",
                table: "CompanyWatchList");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Companies",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "CompanyWatchList");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Companies");

            migrationBuilder.AddColumn<string>(
                name: "CompanyTicker",
                table: "CompanyWatchList",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Ticker",
                table: "Companies",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CompanyWatchList",
                table: "CompanyWatchList",
                columns: new[] { "CompanyTicker", "WatchListId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Companies",
                table: "Companies",
                column: "Ticker");

            migrationBuilder.AddForeignKey(
                name: "FK_CompanyWatchList_Companies_CompanyTicker",
                table: "CompanyWatchList",
                column: "CompanyTicker",
                principalTable: "Companies",
                principalColumn: "Ticker",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CompanyWatchList_Companies_CompanyTicker",
                table: "CompanyWatchList");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CompanyWatchList",
                table: "CompanyWatchList");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Companies",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "CompanyTicker",
                table: "CompanyWatchList");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "CompanyWatchList",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Ticker",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Companies",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CompanyWatchList",
                table: "CompanyWatchList",
                columns: new[] { "CompanyId", "WatchListId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Companies",
                table: "Companies",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CompanyWatchList_Companies_CompanyId",
                table: "CompanyWatchList",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
