using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class AddCompanyWatchList : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_WatchLists_WatchListId",
                table: "Companies");

            migrationBuilder.DropIndex(
                name: "IX_Companies_WatchListId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "WatchListId",
                table: "Companies");

            migrationBuilder.CreateTable(
                name: "CompanyWatchList",
                columns: table => new
                {
                    CompanyId = table.Column<int>(nullable: false),
                    WatchListId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyWatchList", x => new { x.CompanyId, x.WatchListId });
                    table.ForeignKey(
                        name: "FK_CompanyWatchList_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompanyWatchList_WatchLists_WatchListId",
                        column: x => x.WatchListId,
                        principalTable: "WatchLists",
                        principalColumn: "WatchListId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyWatchList_WatchListId",
                table: "CompanyWatchList",
                column: "WatchListId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyWatchList");

            migrationBuilder.AddColumn<int>(
                name: "WatchListId",
                table: "Companies",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_WatchListId",
                table: "Companies",
                column: "WatchListId");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_WatchLists_WatchListId",
                table: "Companies",
                column: "WatchListId",
                principalTable: "WatchLists",
                principalColumn: "WatchListId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
