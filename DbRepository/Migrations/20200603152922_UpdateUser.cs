using Microsoft.EntityFrameworkCore.Migrations;

namespace DbRepository.Migrations
{
    public partial class UpdateUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Portfolios_Persons_UserPersonId",
                table: "Portfolios");

            migrationBuilder.DropForeignKey(
                name: "FK_WatchLists_Persons_PersonId",
                table: "WatchLists");

            migrationBuilder.DropIndex(
                name: "IX_WatchLists_PersonId",
                table: "WatchLists");

            migrationBuilder.DropIndex(
                name: "IX_Portfolios_UserPersonId",
                table: "Portfolios");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Persons",
                table: "Persons");

            migrationBuilder.DropColumn(
                name: "UserPersonId",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "PersonId",
                table: "Persons");

            migrationBuilder.DropColumn(
                name: "Login",
                table: "Persons");

            migrationBuilder.DropColumn(
                name: "Password",
                table: "Persons");

            migrationBuilder.AlterColumn<string>(
                name: "PersonId",
                table: "WatchLists",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Portfolios",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "Persons",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Persons",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Persons",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "Persons",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Persons",
                table: "Persons",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_WatchLists_PersonId",
                table: "WatchLists",
                column: "PersonId",
                unique: true,
                filter: "[PersonId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Portfolios_UserId",
                table: "Portfolios",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Portfolios_Persons_UserId",
                table: "Portfolios",
                column: "UserId",
                principalTable: "Persons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WatchLists_Persons_PersonId",
                table: "WatchLists",
                column: "PersonId",
                principalTable: "Persons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Portfolios_Persons_UserId",
                table: "Portfolios");

            migrationBuilder.DropForeignKey(
                name: "FK_WatchLists_Persons_PersonId",
                table: "WatchLists");

            migrationBuilder.DropIndex(
                name: "IX_WatchLists_PersonId",
                table: "WatchLists");

            migrationBuilder.DropIndex(
                name: "IX_Portfolios_UserId",
                table: "Portfolios");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Persons",
                table: "Persons");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Persons");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Persons");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Persons");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Persons");

            migrationBuilder.AlterColumn<int>(
                name: "PersonId",
                table: "WatchLists",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserPersonId",
                table: "Portfolios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PersonId",
                table: "Persons",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<string>(
                name: "Login",
                table: "Persons",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "Persons",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Persons",
                table: "Persons",
                column: "PersonId");

            migrationBuilder.CreateIndex(
                name: "IX_WatchLists_PersonId",
                table: "WatchLists",
                column: "PersonId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Portfolios_UserPersonId",
                table: "Portfolios",
                column: "UserPersonId");

            migrationBuilder.AddForeignKey(
                name: "FK_Portfolios_Persons_UserPersonId",
                table: "Portfolios",
                column: "UserPersonId",
                principalTable: "Persons",
                principalColumn: "PersonId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WatchLists_Persons_PersonId",
                table: "WatchLists",
                column: "PersonId",
                principalTable: "Persons",
                principalColumn: "PersonId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
