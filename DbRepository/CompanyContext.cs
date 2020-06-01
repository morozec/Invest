using System;
using Microsoft.EntityFrameworkCore;
using Model;

namespace DbRepository
{
    public sealed class CompanyContext : DbContext
    {
        public DbSet<Company> Companies { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<WatchList> WatchLists { get; set; }
        public CompanyContext(DbContextOptions<CompanyContext> options) : base(options)
        {
            //Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Person>()
                .HasOne(p => p.WatchList)
                .WithOne(wl => wl.Person)
                .HasForeignKey<WatchList>(p => p.PersonId);

            modelBuilder.Entity<CompanyWatchList>()
                .HasKey(t => new {t.CompanyTicker, t.WatchListId});
            modelBuilder.Entity<CompanyWatchList>()
                .HasOne(cwl => cwl.Company)
                .WithMany(c => c.CompanyWatchLists)
                .HasForeignKey(cwl => cwl.CompanyTicker);
            modelBuilder.Entity<CompanyWatchList>()
                .HasOne(cwl => cwl.WatchList)
                .WithMany(wl => wl.CompanyWatchLists)
                .HasForeignKey(cwl => cwl.WatchListId);
        }
    }
}
