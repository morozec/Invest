﻿// <auto-generated />
using DbRepository;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DbRepository.Migrations
{
    [DbContext(typeof(CompanyContext))]
    [Migration("20200601063357_TickerAsPrimaryKey")]
    partial class TickerAsPrimaryKey
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Model.Company", b =>
                {
                    b.Property<string>("Ticker")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Exchange")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LongName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ShortName")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Ticker");

                    b.ToTable("Companies");
                });

            modelBuilder.Entity("Model.CompanyWatchList", b =>
                {
                    b.Property<string>("CompanyTicker")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("WatchListId")
                        .HasColumnType("int");

                    b.HasKey("CompanyTicker", "WatchListId");

                    b.HasIndex("WatchListId");

                    b.ToTable("CompanyWatchList");
                });

            modelBuilder.Entity("Model.Person", b =>
                {
                    b.Property<int>("PersonId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Login")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Password")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Role")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("PersonId");

                    b.ToTable("Persons");
                });

            modelBuilder.Entity("Model.WatchList", b =>
                {
                    b.Property<int>("WatchListId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("PersonId")
                        .HasColumnType("int");

                    b.HasKey("WatchListId");

                    b.HasIndex("PersonId")
                        .IsUnique();

                    b.ToTable("WatchLists");
                });

            modelBuilder.Entity("Model.CompanyWatchList", b =>
                {
                    b.HasOne("Model.Company", "Company")
                        .WithMany("CompanyWatchLists")
                        .HasForeignKey("CompanyTicker")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Model.WatchList", "WatchList")
                        .WithMany("CompanyWatchLists")
                        .HasForeignKey("WatchListId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Model.WatchList", b =>
                {
                    b.HasOne("Model.Person", "Person")
                        .WithOne("WatchList")
                        .HasForeignKey("Model.WatchList", "PersonId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
