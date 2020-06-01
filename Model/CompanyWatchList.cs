namespace Model
{
    public class CompanyWatchList
    {
        public int CompanyId { get; set; }
        public Company Company { get; set; }

        public int WatchListId { get; set; }
        public WatchList WatchList { get; set; }
    }
}