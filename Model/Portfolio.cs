﻿using System.Collections.Generic;

namespace Model
{
    public class Portfolio
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Currency Currency { get; set; }
        public InvestUser User { get; set; }
        public List<Transaction> Transactions { get; set; }
        public List<CashTransaction> CashTransactions { get; set; }
        public List<CompanyPortfolio> CompanyPortfolios { get; set; }

        public double DefaultCommissionPercent { get; set; }
        public double DefaultDividendTaxPercent { get; set; }
        public bool AddDividendsToCash { get; set; }

        public Portfolio()
        {
            CompanyPortfolios = new List<CompanyPortfolio>();
        }
    }
}