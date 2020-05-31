namespace Model
{
    public class Person
    {
        public int PersonId { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }

        public WatchList WatchList { get; set; }
    }
}