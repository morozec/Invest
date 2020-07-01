namespace Model
{
    public class CashTransaction
    {
        public int Id { get; set; }
        public Portfolio Portfolio { get; set; }
        public Currency Currency { get; set; }
        public double Amount { get; set; }
    }
}