using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class AddCompanyType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Companies",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Companies");
        }
    }
}
