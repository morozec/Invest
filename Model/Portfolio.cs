namespace Model
{
    public class Portfolio
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Person User { get; set; }
    }
}