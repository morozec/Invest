﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Model
{
    public class Company
    {
        [Key]
        public string Ticker { get; set; }
        public string ShortName { get; set; }
        public string LongName { get; set; }
        public string Exchange { get; set; }

        public string Industry { get; set; }
        public string Sector { get; set; }

        public string Currency { get; set; }
        public string Type { get; set; }

        public List<CompanyWatchList> CompanyWatchLists { get; set; }
        public List<CompanyPortfolio> CompanyPortfolios { get; set; }

        public Company(string ticker, string shortName, string longName, string exchange, string type)
        {
            Ticker = ticker;
            ShortName = shortName;
            LongName = longName;
            Exchange = exchange;
            CompanyWatchLists = new List<CompanyWatchList>();
            CompanyPortfolios = new List<CompanyPortfolio>();
            Type = type;
        }
        

        public Company()
        {
            CompanyWatchLists = new List<CompanyWatchList>();
            CompanyPortfolios = new List<CompanyPortfolio>();
        }
    }
}
