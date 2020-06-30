namespace Model
{
    public class CompanyPortfolio
    {
        public string CompanyTicker { get; set; }
        public Company Company { get; set; }

        public int PortfolioId { get; set; }
        public Portfolio Portfolio { get; set; }

        public double DividendTaxPercent { get; set; }
         
    }
}