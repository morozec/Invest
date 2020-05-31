using System;

namespace Model
{
    public class Company
    {
        public int Id { get; set; }
        public string Ticker { get; set; }
        public string ShortName { get; set; }
        public string LongName { get; set; }
        public string Exchange { get; set; }

        public Company(string ticker, string shortName, string longName, string exchange)
        {
            Ticker = ticker;
            ShortName = shortName;
            LongName = longName;
            Exchange = exchange;
        }
    }
}
