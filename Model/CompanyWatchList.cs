namespace Model
{
    public class CompanyWatchList
    {
        public string CompanyTicker { get; set; }
        public Company Company { get; set; }

        public int WatchListId { get; set; }
        public WatchList WatchList { get; set; }
    }
}