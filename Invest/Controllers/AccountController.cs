using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using DbRepository;
using Invest.Helpers;
using Invest.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Model;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;

namespace Invest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly SignInManager<InvestUser> _signInManager;
        private readonly UserManager<InvestUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly CompanyContext _companyContext;

        public AccountController(
            UserManager<InvestUser> userManager,
            SignInManager<InvestUser> signInManager,
            IConfiguration configuration,
            CompanyContext companyContext
        )
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _companyContext = companyContext;
        }

        [HttpPost("login")]
        public async Task<object> Login([FromBody] LoginDto model)
        {
            var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, false, false);

            if (result.Succeeded)
            {
                var appUser = _userManager.Users.SingleOrDefault(r => r.Email == model.Email);
                return await GenerateJwtToken(model.Email, appUser);
            }

            throw new ApplicationException("INVALID_LOGIN_ATTEMPT");
        }

        [HttpPost("register")]
        public async Task<object> Register([FromBody] RegisterDto model)
        {
            var user = new InvestUser()
            {
                UserName = model.Email,
                Email = model.Email
            };
            var watchList = new WatchList() { Person = user };
            user.WatchList = watchList;

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                
                //_companyContext.WatchLists.Add(new WatchList() { Person = user });
                //_companyContext.SaveChanges();
                await _signInManager.SignInAsync(user, false);
                return await GenerateJwtToken(model.Email, user);
            }

            throw new ApplicationException("UNKNOWN_ERROR");
        }

        private async Task<object> GenerateJwtToken(string email, IdentityUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(Convert.ToDouble(_configuration["JwtExpireDays"]));

            var token = new JwtSecurityToken(
                _configuration["JwtIssuer"],
                _configuration["JwtIssuer"],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public class LoginDto
        {
            [Required]
            public string Email { get; set; }

            [Required]
            public string Password { get; set; }

        }

        public class RegisterDto
        {
            [Required]
            public string Email { get; set; }

            [Required]
            [StringLength(100, ErrorMessage = "PASSWORD_MIN_LENGTH", MinimumLength = 6)]
            public string Password { get; set; }
        }




        [Authorize]
        [HttpGet("watchList")]
        public async Task<IEnumerable<Company>> GetWatchList()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var watchList = _companyContext.WatchLists.Include(wl => wl.CompanyWatchLists)
                .ThenInclude(cwl => cwl.Company).Single(wl => wl.PersonId == userId);
            if (watchList != null)
            {
                var companies = watchList.CompanyWatchLists.Select(cwl => cwl.Company).ToList();
                return companies;
            }

            throw new Exception("Watch list not found");
        }

        [Authorize]
        [HttpPost("addToWatchList")]
        public async Task<IActionResult> AddToWatchList(AddingCompanyViewModel addingCompanyViewModel)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var watchList = _companyContext.WatchLists.Single(wl => wl.PersonId == userId);
            watchList.CompanyWatchLists.Add(new CompanyWatchList()
                {WatchListId = watchList.WatchListId, CompanyTicker = addingCompanyViewModel.Ticker});
            _companyContext.SaveChanges();
            return Ok("Company added to watch list");
        }

        [Authorize]
        [HttpGet("isInWatchList/{companySymbol}")]
        public async Task<bool> IsInWatchList(string companySymbol)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var watchList = _companyContext.WatchLists.Include(wl => wl.CompanyWatchLists)
                .Single(wl => wl.PersonId == userId);
            if (watchList == null) 
                throw new Exception("Watch list not found");

            return watchList.CompanyWatchLists.Any(cwl => cwl.CompanyTicker == companySymbol);
        }

        [Authorize]
        [HttpPost("deleteFromWatchList")]
        public IActionResult DeleteFromWatchList(AddingCompanyViewModel addingCompanyViewModel)
        {
            var personId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var watchList = _companyContext.WatchLists.Include(wl => wl.CompanyWatchLists)
                .SingleOrDefault(wl => wl.PersonId == personId);
            if (watchList == null)
                throw new Exception("Watch list not found");
            watchList.CompanyWatchLists.RemoveAll(c => c.CompanyTicker == addingCompanyViewModel.Ticker);
            _companyContext.SaveChanges();

            return Ok("Company deleted from watch list");
        }

        [Authorize]
        [HttpGet("portfolios")]
        public async Task<IEnumerable<Portfolio>> GetPortfolios()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            //var personId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var portfolios = _companyContext.Portfolios.Where(p => p.User == user);
            return portfolios;
        }


        [Authorize]
        [HttpPost("addUpdatePortfolio")]
        public async Task<IActionResult> AddPortfolio(AddUpdatePortfolioDto addUpdatePortfolioDto)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            Portfolio portfolio;
            if (addUpdatePortfolioDto.Id == null) //new Portfolio
            {
                portfolio = new Portfolio()
                    {Name = addUpdatePortfolioDto.Name, Currency = addUpdatePortfolioDto.Currency, User = user};
                _companyContext.Portfolios.Add(portfolio);
            }
            else
            {
                portfolio = _companyContext.Portfolios.Single(p => p.Id == addUpdatePortfolioDto.Id);
                if (addUpdatePortfolioDto.Name != null) portfolio.Name = addUpdatePortfolioDto.Name;
                if (addUpdatePortfolioDto.Currency != null) portfolio.Currency = addUpdatePortfolioDto.Currency;
            }
           
            _companyContext.SaveChanges();
            return Ok();
        }

        [Authorize]
        [HttpDelete("deletePortfolio")]
        public IActionResult DeletePortfolio(PortfolioIdDto portfolioIdDto)
        {
            var portfolio = _companyContext.Portfolios.Single(p => p.Id == portfolioIdDto.Id);
            _companyContext.Portfolios.Remove(portfolio);
            _companyContext.SaveChanges();
            return Ok();
        }

        public class AddUpdatePortfolioDto
        {
            public int? Id { get; set; }
            public string Name { get; set; }
            public string Currency { get; set; }
        }

        public class PortfolioIdDto
        {
            public int Id { get; set; }
        }


        [Authorize]
        [HttpPost("addUpdateTransaction")]
        public IActionResult AddUpdateTransaction(AddUpdateTransactionDto addUpdateTransactionDto)
        {
            var transaction = addUpdateTransactionDto.Id != null
                ? _companyContext.Transactions.Single(t => t.Id == addUpdateTransactionDto.Id)
                : new Transaction();

            var portfolio = _companyContext.Portfolios.Single(p => p.Id == addUpdateTransactionDto.PortfolioId);
            var company = _companyContext.Companies
                .Single(c => c.Ticker.ToLower() == addUpdateTransactionDto.CompanyTicker.ToLower());
            var type = _companyContext.TransactionTypes.Single(t => t.Type == addUpdateTransactionDto.Type);

            transaction.Portfolio = portfolio;
            transaction.Company = company;
            transaction.Quantity = addUpdateTransactionDto.Quantity;
            transaction.Price = addUpdateTransactionDto.Price;
            transaction.Commission = addUpdateTransactionDto.Commission;
            transaction.Date = addUpdateTransactionDto.Date;
            transaction.TransactionType = type;
            transaction.Comment = addUpdateTransactionDto.Comment;

            if (addUpdateTransactionDto.Id != null) _companyContext.Update(transaction);
            else _companyContext.Transactions.Add(transaction);

            _companyContext.SaveChanges();
            return Ok();
        }

        [Authorize]
        [HttpDelete("deleteTransaction")]
        public IActionResult DeleteTransaction(DeleteTransactionDto deleteTransactionDto)
        {
            var transaction = _companyContext.Transactions.Single(t => t.Id == deleteTransactionDto.Id);
            _companyContext.Transactions.Remove(transaction);
            _companyContext.SaveChanges();
            return Ok();
        }

        public class DeleteTransactionDto
        {
            public int Id { get; set; }
        }

        public class AddUpdateTransactionDto
        {
            public int? Id { get; set; }
            public int PortfolioId { get; set; }
            public string CompanyTicker { get; set; }
            public int Quantity { get; set; }
            public double Price { get; set; }
            public double Commission { get; set; }
            public DateTime Date { get; set; }
            public string Type { get; set; }
            public string Comment { get; set; }
        }

        [Authorize]
        [HttpGet("portfolio")]
        public PortfolioDto GetPortfolio([FromQuery]List<int> ids)
        {
            var portfolios = _companyContext.Portfolios.Where(p => ids.Contains(p.Id));
            var commissions = new Dictionary<string, double>();
            var holdings = _companyContext
                .Transactions
                .Include(t => t.Company)
                .Include(t => t.TransactionType)
                .Where(t => ids.Contains(t.Portfolio.Id))
                .OrderBy(t => t.Date)
                .AsEnumerable()
                .GroupBy(t => t.Company)
                .Select(g =>
                {
                    var buyHoldings = new List<Holding>();
                    var sellHoldings = new List<Holding>();
                    var closedAmount = 0d;
                    var totalBuyAmount = 0d;
                    var totalSellAmount = 0d;
                    if (!commissions.ContainsKey(g.Key.Currency)) commissions.Add(g.Key.Currency, 0d);

                    foreach (var trans in g)
                    {
                        commissions[g.Key.Currency] += trans.Commission;
                        if (trans.TransactionType.Type == "Buy")
                        {
                            totalBuyAmount += trans.Price * trans.Quantity;
                            if (sellHoldings.Count == 0)
                            {
                                buyHoldings.Add(new Holding()
                                {
                                    Quantity = trans.Quantity,
                                    Price = trans.Price,
                                });
                            }
                            else
                            {
                                var buyQuantity = trans.Quantity;
                                var removeCount = 0;
                                foreach (var sell in sellHoldings)
                                {
                                    if (buyQuantity == 0) break;
                                    if (sell.Quantity <= buyQuantity)
                                    {
                                        closedAmount += (sell.Price * sell.Quantity - trans.Price * sell.Quantity);
                                        removeCount++;
                                        buyQuantity -= sell.Quantity;
                                    }
                                    else
                                    {
                                        closedAmount += (sell.Price * buyQuantity - trans.Price * buyQuantity);
                                        sell.Quantity -= buyQuantity;
                                        buyQuantity = 0;
                                    }
                                }
                                sellHoldings.RemoveRange(0, removeCount);
                            }
                        }
                        else //Sell
                        {
                            totalSellAmount += trans.Price * trans.Quantity;
                            if (buyHoldings.Count > 0)
                            {
                                var sellQuantity = trans.Quantity;
                                var removingCount = 0;
                                foreach (var buy in buyHoldings)
                                {
                                    if (sellQuantity == 0) break;
                                    if (buy.Quantity <= sellQuantity) //open полностью продается
                                    {
                                        closedAmount += (trans.Price * buy.Quantity - buy.Price * buy.Quantity);
                                        removingCount++;
                                        sellQuantity -= buy.Quantity;
                                    }
                                    else //open продается частично
                                    {
                                        closedAmount += (trans.Price * sellQuantity - buy.Price * sellQuantity);
                                        buy.Quantity -= sellQuantity;
                                        sellQuantity = 0;
                                    }
                                }
                                buyHoldings.RemoveRange(0, removingCount);
                            }
                            else
                            {
                                sellHoldings.Add(new Holding()
                                {
                                    Price = trans.Price,
                                    Quantity = trans.Quantity,
                                });
                            }
                        }
                        
                    }

                    closedAmount -= g.Sum(t => t.Commission);

                    int openQuantity = 0;
                    double openAmount = 0d;
                    double totalAmount = 0d;
                   
                    if (buyHoldings.Count > 0)
                    {
                        openQuantity = buyHoldings.Sum(h => h.Quantity);
                        openAmount = buyHoldings.Sum(h => h.Price * h.Quantity);
                        totalAmount = totalBuyAmount;
                    }
                    else if (sellHoldings.Count > 0)
                    {
                        openQuantity = sellHoldings.Sum(h => -h.Quantity);
                        openAmount = sellHoldings.Sum(h => -h.Price * h.Quantity);
                        totalAmount = totalSellAmount;
                    }

                    return new PortfolioHoldingsDto
                    {
                        Ticker = g.Key.Ticker,
                        Quantity = openQuantity,
                        Amount = openAmount,
                        ClosedAmount = closedAmount,
                        TotalAmount = totalAmount,
                        Sector = g.Key.Sector,
                        Industry = g.Key.Industry,
                        Currency = g.Key.Currency
                    };

                }).ToList();
            //        return new PortfolioHoldingsDto()
            //        {
            //            Ticker = g.Key,
            //            AvgPrice = g.Average(t => t.Price),
            //            //Quantity = g.Sum(t => t.TransactionType.Type == "Buy" ? t.Quantity : -t.Quantity),
            //            //Amount = g.Sum(t => t.Price * t.Quantity + t.Commission)
            //        };
            //    })
            //    .ToList();


            return new PortfolioDto()
            {
                Portfolios = portfolios.Select(p => new SinglePortfolioDto()
                {
                    Id = p.Id,
                    Currency = p.Currency,
                    Name = p.Name
                }).ToList(),
                Commissions = commissions,
                Holdings = holdings
            };
        }

        private class Holding
        {
            public int Quantity { get; set; }
            public double Price { get; set; }
        }

        public class PortfolioDto
        {
            public List<SinglePortfolioDto> Portfolios { get; set; }
            public IDictionary<string, double> Commissions { get; set; }
            public IList<PortfolioHoldingsDto> Holdings { get; set; }
        }

        public class SinglePortfolioDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Currency { get; set; }
        }

        public class PortfolioHoldingsDto
        {
            public string Ticker { get; set; }
            public double AvgPrice { get; set; }
            public int Quantity { get; set; }
            public double Amount { get; set; }
            public double ClosedAmount { get; set; }
            public double TotalAmount { get; set; }


            public string Sector { get; set; }
            public string Industry { get; set; }
            public string Currency { get; set; }
        }

        [Authorize]
        [HttpGet("portfolio/{symbol}")]
        public IEnumerable<Transaction> GetPortfolioCompanyTransactions(string symbol, [FromQuery]List<int> ids)
        {
            var transactions = _companyContext
                .Transactions
                .Include(t => t.TransactionType)
                .Where(t => ids.Contains(t.Portfolio.Id) && t.Company.Ticker == symbol)
                .OrderByDescending(t => t.Date)
                .ToList();
            return transactions;
        }

        [HttpGet("loadIndustries")]
        public IActionResult LoadIndustries()
        {

            RestClient client = null;
            var request = new RestRequest(Method.GET);

            var badCompanies = new List<Company>();

            var companies = _companyContext.Companies;
            foreach (var c in companies)
            {
                var url =
                    $"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{c.Ticker}?modules=" +
                    "assetProfile";
                if (client == null)
                {
                    client = new RestClient(url);
                }
                else
                {
                    client.BaseUrl = new Uri(url);
                }
                
                var response = client.Execute(request);

                dynamic obj = JsonConvert.DeserializeObject<dynamic>(response.Content);
                var result = obj.quoteSummary.result;
                if (result == null)
                {
                    badCompanies.Add(c);
                    continue;
                }

                var industry = result[0].assetProfile.industry;
                var sector = result[0].assetProfile.sector;
                c.Industry = industry;
                c.Sector = sector;
            }

            _companyContext.SaveChanges();
            return Ok();
        }

        [HttpGet("loadCompanies")]
        public IEnumerable<Company> LoadCompanies()
        {
            return _companyContext.Companies.ToList();
        }

        private readonly DateTime dtDateTime = new DateTime(
            1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
        private DateTime UnixDateToDate(double unixDate)
        {
            return dtDateTime.AddSeconds(unixDate).ToLocalTime().Date;
        }

        //[Authorize]
        //[HttpGet("getDividends/{portfolioId}/{companySymbol}")]
        //public PricesDividendsDto GetDividends(int portfolioId, string companySymbol)
        //{
        //    var mktValues = new List<MarketValueDto>();
        //    var dividends = 0d;

        //    var orderedTransactions = _companyContext.Transactions
        //        .Include(t => t.TransactionType)
        //        .Where(t => t.Portfolio.Id == portfolioId && t.Company.Ticker == companySymbol)
        //        .OrderBy(t => t.Date).ToList();

        //    var startDate = orderedTransactions[0].Date;
        //    long unixTimeStartDate = ((DateTimeOffset)startDate.ToLocalTime()).ToUnixTimeSeconds();

        //    var url = $"https://query1.finance.yahoo.com/v8/finance/chart/{companySymbol}?period1={unixTimeStartDate}&period2=9999999999&interval=1d&events=div";

        //    var client = new RestClient(url);
        //    var request = new RestRequest(Method.GET);
        //    var response = client.Execute(request);

        //    dynamic obj = JsonConvert.DeserializeObject<dynamic>(response.Content);

        //    if (obj.chart.result == null)
        //        return new PricesDividendsDto() {MktValues = mktValues, Dividends = dividends};

        //    var times = obj.chart.result[0].timestamp;
        //    var close = obj.chart.result[0].indicators.quote[0].close;
            

        //    var count = orderedTransactions[0].Quantity;
        //    var index = 0;
        //    double? lastValue = null;
        //    for (var i = 1; i < orderedTransactions.Count; ++i)
        //    {
        //        var trans = orderedTransactions[i];
        //        DateTime date;
        //        while ((date = UnixDateToDate((double)times[index])) < trans.Date)
        //        {
        //            double mktValue;
        //            if (close[index] == null)
        //            {
        //                if (lastValue != null) mktValue = count * lastValue.Value;
        //                else mktValue = 0d;
        //            }
        //            else
        //            {
        //                lastValue = (double)close[index];
        //                mktValue = count * lastValue.Value;
        //            }

        //            mktValues.Add(new MarketValueDto()
        //            {
        //                Date = date,
        //                MktValue = mktValue
        //            });
        //            index++;
        //        }

        //        count += trans.TransactionType.Type == "Buy" ? trans.Quantity : -trans.Quantity;
        //    }

            
        //    while (index < times.Count)
        //    {
        //        var date = UnixDateToDate((double)times[index]);
        //        double mktValue;

        //        if (close[index] == null)
        //        {
        //            if (lastValue != null) mktValue = count * lastValue.Value;
        //            else mktValue = 0d;
        //        }
        //        else
        //        {
        //            lastValue = (double)close[index];
        //            mktValue = count * lastValue.Value;
        //        }
                
        //        mktValues.Add(new MarketValueDto()
        //        {
        //            Date = date,
        //            MktValue = mktValue
        //        });
        //        ++index;
        //    }


        //    return new PricesDividendsDto()
        //    {
        //        MktValues = mktValues,
        //        Dividends = dividends
        //    };
        //}


        [Authorize]
        [HttpGet("getDividends")]
        public PricesDividendsDto GetDividends(
            [FromQuery(Name = "ids")] List<int> ids, [FromQuery(Name = "symbols")] List<string> symbols)
        {
            var mktValues = new Dictionary<DateTime,Dictionary<string, double>>();
            var dividends = new Dictionary<string, double>();

            var allOrderedTransactions = _companyContext.Transactions
                .Include(t => t.TransactionType)
                .Include(t => t.Company)
                .Where(t => ids.Contains(t.Portfolio.Id))
                .OrderBy(t => t.Date).ToList();

            var yahooResults = new Dictionary<string, dynamic>();
            

            Parallel.ForEach(symbols, (symbol) =>
            {
                var startDate = allOrderedTransactions.First(t => t.Company.Ticker == symbol).Date;
                long unixTimeStartDate = ((DateTimeOffset) startDate.ToLocalTime()).ToUnixTimeSeconds();

                var url =
                    $"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?period1={unixTimeStartDate}&period2=9999999999&interval=1d&events=div";

                var client = new RestClient(url);
                var request = new RestRequest(Method.GET);
                var response = client.Execute(request);

                dynamic obj = JsonConvert.DeserializeObject<dynamic>(response.Content);
                if (obj == null || obj.chart.result == null) return;
                yahooResults.Add(symbol, obj.chart.result[0]);
            });


            foreach (var symbol in symbols)
            {
                
                if (!yahooResults.ContainsKey(symbol)) continue;
               
                var orderedTransactions = allOrderedTransactions.Where(
                    t => t.Company.Ticker == symbol).ToList();

                var yahooResult = yahooResults[symbol];
                var currency = yahooResult.meta.currency.ToString();
                List<double> times = JsonConvert.DeserializeObject<List<double>>(yahooResult.timestamp.ToString());
                var close = yahooResult.indicators.quote[0].close;

                if (yahooResult.events != null)
                {
                    Dictionary<string, dynamic> curDividends =
                        JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(
                            yahooResult.events.dividends.ToString());

                    var curDividendsSum = 0d;
                    foreach (var key in curDividends.Keys)
                    {
                        var divDate = UnixDateToDate((double)curDividends[key].date);
                        double divAmount = curDividends[key].amount;
                        var count = orderedTransactions
                            .Where(t => t.Date < divDate)
                            .Sum(t => t.TransactionType.Type == "Buy" ? t.Quantity : -t.Quantity);
                        curDividendsSum += divAmount * count;
                    }
                    dividends.Add(symbol, curDividendsSum);
                }
                else
                {
                    dividends.Add(symbol, 0d);
                }


                var curCount = orderedTransactions[0].Quantity;
                var curDate = orderedTransactions[0].Date;
                double? lastValue = null;
                for (var i = 1; i < orderedTransactions.Count; ++i)
                {
                    var trans = orderedTransactions[i];
                    while (curDate < trans.Date)
                    {
                        if (curDate.DayOfWeek == DayOfWeek.Saturday || curDate.DayOfWeek == DayOfWeek.Sunday)
                        {
                            curDate = curDate.AddDays(1);
                            continue;
                        }
                        double mktValue;
                        var index = times.FindIndex(t => UnixDateToDate(t) == curDate);
                        if (index == -1 || close[index] == null)
                        {
                            if (lastValue != null) mktValue = curCount * lastValue.Value;
                            else
                            {
                                curDate = curDate.AddDays(1);
                                continue;
                            }
                        }
                        else
                        {
                            lastValue = (double)close[index];
                            mktValue = curCount * lastValue.Value;
                        }

                        if (!mktValues.ContainsKey(curDate))
                            mktValues.Add(curDate, new Dictionary<string, double>());
                        if (!mktValues[curDate].ContainsKey(currency))
                            mktValues[curDate].Add(currency, 0d);
                        mktValues[curDate][currency] += mktValue;
                        curDate = curDate.AddDays(1);
                    }

                    curCount += trans.TransactionType.Type == "Buy" ? trans.Quantity : -trans.Quantity;
                }

                var today = DateTime.Now.Date;
                while (curDate < today)
                {
                    if (curDate.DayOfWeek == DayOfWeek.Saturday || curDate.DayOfWeek == DayOfWeek.Sunday)
                    {
                        curDate = curDate.AddDays(1);
                        continue;
                    }

                    double mktValue;
                    var index = times.FindIndex(t => UnixDateToDate(t) == curDate);
                    if (index == -1 || close[index] == null)
                    {
                        if (lastValue != null) mktValue = curCount * lastValue.Value;
                        else
                        {
                            curDate = curDate.AddDays(1);
                            continue;
                        }
                    }
                    else
                    {
                        lastValue = (double)close[index];
                        mktValue = curCount * lastValue.Value;
                    }

                    if (!mktValues.ContainsKey(curDate)) 
                        mktValues.Add(curDate, new Dictionary<string, double>());
                    if (!mktValues[curDate].ContainsKey(currency))
                        mktValues[curDate].Add(currency, 0d);
                    mktValues[curDate][currency] += mktValue;
                    curDate = curDate.AddDays(1);
                }
            }


            return new PricesDividendsDto()
            {
                MktValues = mktValues,
                Dividends = dividends
            };
        }

        public class PricesDividendsDto
        {
            public IDictionary<DateTime, Dictionary<string, double>> MktValues { get; set; }
            public Dictionary<string, double> Dividends { get; set; }
        }

        public class MarketValueDto
        {
            public DateTime Date { get; set; }
            public double MktValue { get; set; }
        }

    }
}