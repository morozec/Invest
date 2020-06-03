﻿using System;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Model;

namespace DbRepository
{
    public sealed class CompanyContext : IdentityDbContext<InvestUser>
    {
        public Microsoft.EntityFrameworkCore.DbSet<Company> Companies { get; set; }
        public Microsoft.EntityFrameworkCore.DbSet<InvestUser> Persons { get; set; }
        public Microsoft.EntityFrameworkCore.DbSet<WatchList> WatchLists { get; set; }

        public Microsoft.EntityFrameworkCore.DbSet<Portfolio> Portfolios { get; set; }
        public Microsoft.EntityFrameworkCore.DbSet<TransactionType> TransactionTypes { get; set; }
        public Microsoft.EntityFrameworkCore.DbSet<Transaction> Transactions { get; set; }

        public CompanyContext(DbContextOptions<CompanyContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder) 
        {
            base.OnModelCreating(builder);

            builder.Entity<InvestUser>()
                .HasOne(p => p.WatchList)
                .WithOne(wl => wl.Person)
                .HasForeignKey<WatchList>(p => p.PersonId);

            builder.Entity<CompanyWatchList>()
                .HasKey(t => new { t.CompanyTicker, t.WatchListId });
            builder.Entity<CompanyWatchList>()
                .HasOne(cwl => cwl.Company)
                .WithMany(c => c.CompanyWatchLists)
                .HasForeignKey(cwl => cwl.CompanyTicker);
            builder.Entity<CompanyWatchList>()
                .HasOne(cwl => cwl.WatchList)
                .WithMany(wl => wl.CompanyWatchLists)
                .HasForeignKey(cwl => cwl.WatchListId);
        }

    }
}
