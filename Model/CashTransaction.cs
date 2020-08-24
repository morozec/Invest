using System;

namespace Model
{
    public class CashTransaction
    {
        public int Id { get; set; }
        public Portfolio Portfolio { get; set; }
        public int PortfolioId { get; set; }
        public Currency Currency { get; set; }
        public double Amount { get; set; }
        public DateTime Date { get; set; }

        public Currency CurrencyFrom { get; set; }
        public double? AmountFrom { get; set; }
    }
}