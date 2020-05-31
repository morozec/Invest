using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class AddShortLongNames : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Companies");

            migrationBuilder.AddColumn<string>(
                name: "LongName",
                table: "Companies",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortName",
                table: "Companies",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LongName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ShortName",
                table: "Companies");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
