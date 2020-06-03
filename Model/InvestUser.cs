using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Model
{
    public class InvestUser : IdentityUser
    {
        public WatchList WatchList { get; set; }

        public List<Portfolio> Portfolios { get; set; }

        public InvestUser()
        {
            Portfolios = new List<Portfolio>();
        }
    }
}