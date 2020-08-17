using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace Model
{
    public class InvestUser : IdentityUser
    {
        public WatchList WatchList { get; set; }

        public List<Portfolio> Portfolios { get; set; }

        public string RefreshToken { get; set; }

        public InvestUser()
        {
            Portfolios = new List<Portfolio>();
        }
    }
}