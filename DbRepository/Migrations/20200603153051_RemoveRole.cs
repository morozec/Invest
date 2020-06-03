using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class RemoveRole : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Persons");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Persons",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
