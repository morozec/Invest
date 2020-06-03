using System.Collections.Generic;

namespace Model
{
    public class WatchList
    {
        public int WatchListId { get; set; }

        public string PersonId { get; set; }
        public InvestUser Person { get; set; }
        public List<CompanyWatchList> CompanyWatchLists { get; set; }

        public WatchList()
        {
            CompanyWatchLists = new List<CompanyWatchList>();
        }
    }
}