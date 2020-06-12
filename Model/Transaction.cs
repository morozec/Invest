using System;

namespace Model
{
    public class Transaction
    {
        public int Id { get; set; }
        public Portfolio Portfolio { get; set; }
        public TransactionType TransactionType { get; set; }
        public Company Company { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; }
        public double Commission { get; set; }
        public DateTime Date { get; set; }
        public string Comment { get; set; }
    }
}