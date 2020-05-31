namespace Model
{
    public class Portfolio
    {
        public string Name { get; set; }
        public Portfolio Parent { get; set; }
        public Person User { get; set; }
    }
}