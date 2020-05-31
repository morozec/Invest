using System.Collections.Generic;

namespace Model
{
    public class WatchList
    {
        public int WatchListId { get; set; }

        public int PersonId { get; set; }
        public Person Person { get; set; }
        public List<Company> Companies { get; set; }
    }
}