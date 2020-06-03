using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Model
{
    public class Person
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }

        public int Year { get; set; }
        public WatchList WatchList { get; set; }

        public List<Portfolio> Portfolios { get; set; }
    }
}