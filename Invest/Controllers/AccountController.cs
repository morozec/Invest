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

        [HttpGet("currencies")]
        public IEnumerable<Currency> GetCurrencies()
        {
            var currencies = _companyContext.Currencies.ToList();
            return currencies;
        }


        [Authorize]
        [HttpPost("addUpdatePortfolio")]
        public async Task<IActionResult> AddUpdatePortfolio(AddUpdatePortfolioDto addUpdatePortfolioDto)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            Portfolio portfolio;
            if (addUpdatePortfolioDto.Id == null) //new Portfolio
            {
                var currency = _companyContext.Currencies.Single(c => c.Name == "USD");
                portfolio = new Portfolio()
                {
                    Name = addUpdatePortfolioDto.Name,
                    Currency = currency,
                    User = user,
                    DefaultCommissionPercent = addUpdatePortfolioDto.DefaultCommissionPercent ?? 0,
                };
                _companyContext.Portfolios.Add(portfolio);
            }
            else
            {
                portfolio = _companyContext.Portfolios.Single(p => p.Id == addUpdatePortfolioDto.Id);
                if (addUpdatePortfolioDto.Name != null) portfolio.Name = addUpdatePortfolioDto.Name;
                if (addUpdatePortfolioDto.CurrencyId != null)
                {
                    var currency = _companyContext.Currencies.Single(c => c.Id == addUpdatePortfolioDto.CurrencyId);
                    portfolio.Currency = currency;
                }
                if (addUpdatePortfolioDto.DefaultCommissionPercent != null)
                    portfolio.DefaultCommissionPercent = addUpdatePortfolioDto.DefaultCommissionPercent.Value;
            }

            portfolio.AddDividendsToCash = addUpdatePortfolioDto.AddDividendsToCash;
           
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
            public int? CurrencyId { get; set; }
            public double? DefaultCommissionPercent { get; set; }
            public bool AddDividendsToCash { get; set; }
        }

        public class PortfolioIdDto
        {
            public int Id { get; set; }
        }

        [Authorize]
        [HttpPost("updateDividendTaxes")]
        public IActionResult UpdateDividendTaxes(UpdateDividendTaxesDto updateDividendTaxesDto)
        {
            var portfolio = _companyContext.Portfolios
                .Include(p => p.CompanyPortfolios)
                .Single(p => p.Id == updateDividendTaxesDto.PortfolioId);
            portfolio.DefaultDividendTaxPercent = updateDividendTaxesDto.DefaultDividendTaxPercent;

            portfolio.CompanyPortfolios.Clear();
            foreach (var item in updateDividendTaxesDto.DividendTaxDtos)
            {
                portfolio.CompanyPortfolios.Add(new CompanyPortfolio()
                {
                    CompanyTicker = item.CompanyTicker,
                    PortfolioId = portfolio.Id,
                    DividendTaxPercent = item.DividendTaxPercent
                });
            }

            _companyContext.SaveChanges();
            return Ok();
        }

        public class UpdateDividendTaxesDto
        {
            public int PortfolioId { get; set; }
            public double DefaultDividendTaxPercent { get; set; }
            public IList<DividendTaxDto> DividendTaxDtos { get; set; }
        }

        public class DividendTaxDto
        {
            public string CompanyTicker { get; set; }
            public double DividendTaxPercent { get; set; }
        }


        [Authorize]
        [HttpPost("addUpdateTransaction")]
        public IActionResult AddUpdateTransaction(AddUpdateTransactionDto addUpdateTransactionDto)
        {
            var transaction = addUpdateTransactionDto.Id != null
                ? _companyContext.Transactions.Single(t => t.Id == addUpdateTransactionDto.Id)
                : new Transaction();

           
            var portfolio = _companyContext.Portfolios
                    .Single(p => p.Id == addUpdateTransactionDto.PortfolioId);
            
           
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
            transaction.UseCash = addUpdateTransactionDto.UseCash;

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

            public bool UseCash { get; set; }
        }

        [Authorize]
        [HttpGet("portfolio")]
        public PortfolioDto GetPortfolio([FromQuery]List<int> ids)
        {
            var portfolios = _companyContext.Portfolios
                .Include(p => p.Currency)
                .Where(p => ids.Contains(p.Id));
            var commissions = new Dictionary<string, double>();

            var transactions = _companyContext
                .Transactions
                .Include(t => t.Company)
                .ThenInclude(c => c.CompanyPortfolios)
                .Include(t => t.TransactionType)
                .Include(t => t.Portfolio)
                .Where(t => ids.Contains(t.Portfolio.Id))
                .OrderBy(t => t.Date)
                .ToList();


            var holdings = transactions
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

                    double? dividendTaxPercent = null;
                    if (ids.Count == 1)
                    {
                        var cp = g.Key.CompanyPortfolios
                            .SingleOrDefault(x => x.PortfolioId == ids[0]);
                        if (cp != null)
                        {
                            dividendTaxPercent = cp.DividendTaxPercent;
                        }
                    }

                    return new PortfolioHoldingsDto
                    {
                        Ticker = g.Key.Ticker,
                        CompanyName = g.Key.ShortName,
                        Quantity = openQuantity,
                        Amount = openAmount,
                        ClosedAmount = closedAmount,
                        TotalAmount = totalAmount,
                        Sector = g.Key.Sector,
                        Industry = g.Key.Industry,
                        Currency = g.Key.Currency,
                        DividendTaxPercent = dividendTaxPercent
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

            transactions.Reverse();//от последне к первой
            return new PortfolioDto()
            {
                Portfolios = portfolios.Select(p => new SinglePortfolioDto()
                {
                    Id = p.Id,
                    Currency = p.Currency,
                    Name = p.Name,
                    DefaultCommissionPercent = p.DefaultCommissionPercent,
                    DefaultDividendTaxPercent = p.DefaultDividendTaxPercent,
                    AddDividendsToCash = p.AddDividendsToCash
                }).ToList(),
                Commissions = commissions,
                Holdings = holdings,
                Transactions = transactions
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
            public IList<Transaction> Transactions { get; set; }
        }

        public class SinglePortfolioDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public Currency Currency { get; set; }
            public double DefaultCommissionPercent { get; set; }
            public double DefaultDividendTaxPercent { get; set; }
            public bool AddDividendsToCash { get; set; }
        }

        public class PortfolioHoldingsDto
        {
            public string Ticker { get; set; }
            public string CompanyName { get; set; }
            public double AvgPrice { get; set; }
            public int Quantity { get; set; }
            public double Amount { get; set; }
            public double ClosedAmount { get; set; }
            public double TotalAmount { get; set; }

            public double? DividendTaxPercent { get; set; }

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
                .Include(t => t.Company)
                .Include(t => t.Portfolio)
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
            return dtDateTime.AddSeconds(unixDate).ToUniversalTime().Date;
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
            var unrealizedPL = new Dictionary<DateTime,Dictionary<string, double>>();
            var overallPL = new Dictionary<DateTime,Dictionary<string, double>>();
            var dividends = new Dictionary<string, IList<DividendDto>>();
            var cash = new Dictionary<DateTime, Dictionary<string, double>>();

            var allOrderedTransactions = _companyContext.Transactions
                .Include(t => t.TransactionType)
                .Include(t => t.Company)
                .Include(t => t.Portfolio)
                .ThenInclude(p => p.CompanyPortfolios)
                .Where(t => ids.Contains(t.Portfolio.Id))
                .OrderBy(t => t.Date).ToList();

            var allOrderedCashTransactions = GetCashTransactions(ids);
            var allCashTransactionsDict = new Dictionary<DateTime, List<CashTransaction>>();
            foreach (var ct in allOrderedCashTransactions)
            {
                if (!allCashTransactionsDict.ContainsKey(ct.Date))
                {
                    allCashTransactionsDict.Add(ct.Date, new List<CashTransaction>{ct});
                }
                else
                {
                    allCashTransactionsDict[ct.Date].Add(ct);
                }
            }

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



            var today = DateTime.Now.Date;
            foreach (var symbol in symbols)
            {
                
                if (!yahooResults.ContainsKey(symbol)) continue;
                
                var orderedTransactions = allOrderedTransactions.Where(
                    t => t.Company.Ticker == symbol).ToList();

                var yahooResult = yahooResults[symbol];
                var currency = yahooResult.meta.currency.ToString();
                List<double> times = JsonConvert.DeserializeObject<List<double>>(yahooResult.timestamp.ToString());
                var close = yahooResult.indicators.quote[0].close;

                var datedDividends = new Dictionary<DateTime, Tuple<double, double>>(); //common div, add cash div
                if (yahooResult.events != null)
                {
                    Dictionary<string, dynamic> curDividends =
                        JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(
                            yahooResult.events.dividends.ToString());

                    var curSymbolDividends = new List<DividendDto>();
                    foreach (var key in curDividends.Keys)
                    {
                        var divDate = UnixDateToDate((double)curDividends[key].date);
                        double divAmount = curDividends[key].amount;

                        var sumDivValue = 0d;
                        var sumAddCashDivValue = 0d;
                        foreach (var ot in orderedTransactions.Where(t => t.Date < divDate))
                        {
                            var cp = ot.Portfolio.CompanyPortfolios.SingleOrDefault(x =>
                                x.CompanyTicker == ot.Company.Ticker);
                            var divTaxPercent = cp?.DividendTaxPercent ?? ot.Portfolio.DefaultDividendTaxPercent;
                            var count = ot.TransactionType.Type == "Buy" ? ot.Quantity : -ot.Quantity;
                            var divValue = divAmount * (1 - divTaxPercent / 100.0) * count;
                            sumDivValue += divValue;
                            if (ot.Portfolio.AddDividendsToCash) sumAddCashDivValue += divValue;
                        }
                        curSymbolDividends.Add(new DividendDto(){Date = divDate, Value = sumDivValue });

                        datedDividends.Add(divDate, new Tuple<double, double>(sumDivValue, sumAddCashDivValue));
                    }
                    dividends.Add(symbol, curSymbolDividends);
                }
                else
                {
                    dividends.Add(symbol, new List<DividendDto>());
                }

                var curCount = orderedTransactions[0].TransactionType.Type == "Buy"
                    ? orderedTransactions[0].Quantity
                    : -orderedTransactions[0].Quantity;
                var curPrice = curCount * orderedTransactions[0].Price;
                var curOverallPrice = curPrice + orderedTransactions[0].Commission;
                var curDate = orderedTransactions[0].Date;

                var cashUsed = 0d;
                if (orderedTransactions[0].UseCash) cashUsed += curPrice + orderedTransactions[0].Commission;
                var addCashDividends = 0d;

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

                        if (datedDividends.ContainsKey(curDate))
                        {
                            curOverallPrice -= datedDividends[curDate].Item1;
                            addCashDividends += datedDividends[curDate].Item2;
                        }

                        mktValues[curDate][currency] += mktValue - cashUsed + addCashDividends;

                        if (!unrealizedPL.ContainsKey(curDate))
                            unrealizedPL.Add(curDate, new Dictionary<string, double>());
                        if (!unrealizedPL[curDate].ContainsKey(currency))
                            unrealizedPL[curDate].Add(currency, 0d);
                        unrealizedPL[curDate][currency] += mktValue - curPrice;
                        

                        if (!overallPL.ContainsKey(curDate))
                            overallPL.Add(curDate, new Dictionary<string, double>());
                        if (!overallPL[curDate].ContainsKey(currency))
                            overallPL[curDate].Add(currency, 0d);
                        overallPL[curDate][currency] += mktValue - curOverallPrice;

                        if (!cash.ContainsKey(curDate))
                            cash.Add(curDate, new Dictionary<string, double>());
                        if (!cash[curDate].ContainsKey(currency))
                            cash[curDate].Add(currency, 0d);
                        cash[curDate][currency] += -cashUsed + addCashDividends;

                        curDate = curDate.AddDays(1);
                    }

                    curCount += trans.TransactionType.Type == "Buy" ? trans.Quantity : -trans.Quantity;
                    var transPrice = trans.TransactionType.Type == "Buy"
                        ? trans.Quantity * trans.Price
                        : -trans.Quantity * trans.Price;
                    curPrice += transPrice;
                    curOverallPrice += transPrice + trans.Commission;
                    if (trans.UseCash) cashUsed += transPrice + trans.Commission;
                }

                
                while (curDate <= today)
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

                    if (datedDividends.ContainsKey(curDate))
                    {
                        curOverallPrice -= datedDividends[curDate].Item1;
                        addCashDividends += datedDividends[curDate].Item2;
                    }

                    mktValues[curDate][currency] += mktValue - cashUsed + addCashDividends;


                    if (!unrealizedPL.ContainsKey(curDate))
                        unrealizedPL.Add(curDate, new Dictionary<string, double>());
                    if (!unrealizedPL[curDate].ContainsKey(currency))
                        unrealizedPL[curDate].Add(currency, 0d);
                    unrealizedPL[curDate][currency] += mktValue - curPrice;

                    
                    if (!overallPL.ContainsKey(curDate))
                        overallPL.Add(curDate, new Dictionary<string, double>());
                    if (!overallPL[curDate].ContainsKey(currency))
                        overallPL[curDate].Add(currency, 0d);
                    overallPL[curDate][currency] += mktValue - curOverallPrice;

                    if (!cash.ContainsKey(curDate))
                        cash.Add(curDate, new Dictionary<string, double>());
                    if (!cash[curDate].ContainsKey(currency))
                        cash[curDate].Add(currency, 0d);
                    cash[curDate][currency] += -cashUsed + addCashDividends;

                    curDate = curDate.AddDays(1);
                }
            }

            if (allOrderedCashTransactions.Any())
            {
                var cashTransaction0 = allOrderedCashTransactions.Last();//reverse order
                var curCashDate = cashTransaction0.Date;
                var cashAmountDict = new Dictionary<string, double>();
               

                while (curCashDate <= today)
                {
                    if (allCashTransactionsDict.ContainsKey(curCashDate))
                    {
                        foreach (var trans in allCashTransactionsDict[curCashDate])
                        {
                            if (!cashAmountDict.ContainsKey(trans.Currency.Name)) 
                                cashAmountDict.Add(trans.Currency.Name, 0);
                            cashAmountDict[trans.Currency.Name] += trans.Amount;
                            if (trans.CurrencyFrom != null)
                            {
                                if (!cashAmountDict.ContainsKey(trans.CurrencyFrom.Name))
                                    cashAmountDict.Add(trans.CurrencyFrom.Name, 0);
                                cashAmountDict[trans.CurrencyFrom.Name] -= trans.AmountFrom.Value;
                            }
                        }
                    }

                    if (curCashDate.DayOfWeek == DayOfWeek.Saturday || curCashDate.DayOfWeek == DayOfWeek.Sunday)
                    {
                        curCashDate = curCashDate.AddDays(1);
                        continue;
                    }
                    
                    if (!mktValues.ContainsKey(curCashDate))
                        mktValues.Add(curCashDate, new Dictionary<string, double>());
                    if (!cash.ContainsKey(curCashDate))
                        cash.Add(curCashDate, new Dictionary<string, double>());
                    foreach (var currency in cashAmountDict.Keys)
                    {
                        if (!mktValues[curCashDate].ContainsKey(currency))
                            mktValues[curCashDate].Add(currency, 0d);
                        mktValues[curCashDate][currency] += cashAmountDict[currency];

                        if (!cash[curCashDate].ContainsKey(currency))
                            cash[curCashDate].Add(currency, 0d);
                        cash[curCashDate][currency] += cashAmountDict[currency];
                    }


                    curCashDate = curCashDate.AddDays(1);
                }
            }

            


            //foreach (var ct in allOrderedCashTransactions)
            //{
            //    if (!mktValues.ContainsKey(ct.Date)) mktValues.Add(ct.Date, new Dictionary<string, double>());
            //    if (!mktValues[ct.Date].ContainsKey(ct.Currency.Name)) mktValues[ct.Date][ct.Currency.Name] = 0;
            //    mktValues[ct.Date][ct.Currency.Name] += ct.Amount;
            //}

            var mktValuesList = mktValues
                .Select(item => new TimeValueDto() {Date = item.Key, Values = item.Value})
                .OrderBy(item => item.Date)
                .ToList();

            var unrealizedPLList = unrealizedPL
                .Select(item => new TimeValueDto() { Date = item.Key, Values = item.Value })
                .OrderBy(item => item.Date)
                .ToList();

            var overallPLList = overallPL
                .Select(item => new TimeValueDto() { Date = item.Key, Values = item.Value })
                .OrderBy(item => item.Date)
                .ToList();

            var cashList = cash
                .Select(item => new TimeValueDto() { Date = item.Key, Values = item.Value })
                .OrderBy(item => item.Date)
                .ToList();

            return new PricesDividendsDto()
            {
                MktValues = mktValuesList,
                UnrealizedPL = unrealizedPLList,
                OverallPL = overallPLList,
                Dividends = dividends,
                Cash = cashList
            };
        }

        public class PricesDividendsDto
        {
            public IList<TimeValueDto> MktValues { get; set; }
            public IList<TimeValueDto> UnrealizedPL { get; set; }
            public IList<TimeValueDto> OverallPL { get; set; }
            public Dictionary<string, IList<DividendDto>> Dividends { get; set; }
            public IList<TimeValueDto> Cash { get; set; }
        }

        public class TimeValueDto
        {
            public DateTime Date { get; set; }
            public IDictionary<string, double> Values { get; set; }
        }

        public class MarketValueDto
        {
            public DateTime Date { get; set; }
            public double MktValue { get; set; }
        }

        public class DividendDto
        {
            public DateTime Date { get; set; }
            public double Value { get; set; }
        }

        [Authorize]
        [HttpPost("addUpdateCashTransaction")]
        public IActionResult AddUpdateCashTransaction(AddUpdateCashTransactionDto addUpdateCashTransactionDto)
        {
            var portfolio = _companyContext.Portfolios.Single(p => p.Id == addUpdateCashTransactionDto.PortfolioId);
            var currency = _companyContext.Currencies.Single(c => c.Id == addUpdateCashTransactionDto.CurrencyId);
            var currencyFrom = addUpdateCashTransactionDto.CurrencyFromId == null ? null :
                _companyContext.Currencies.Single(c => c.Id == addUpdateCashTransactionDto.CurrencyFromId.Value);

            if (addUpdateCashTransactionDto.Id != null)
            {
                var t = _companyContext.CashTransactions
                    .Include(ct => ct.CurrencyFrom)
                    .Single(ct => ct.Id == addUpdateCashTransactionDto.Id);
                t.Portfolio = portfolio;
                t.Currency = currency;
                t.Amount = addUpdateCashTransactionDto.Amount;
                t.Date = addUpdateCashTransactionDto.Date;

                t.CurrencyFrom = currencyFrom;
                t.AmountFrom = addUpdateCashTransactionDto.AmountFrom;
            }
            else
            {
                _companyContext.CashTransactions.Add(new CashTransaction()
                {
                    Portfolio = portfolio,
                    Currency = currency,
                    Amount = addUpdateCashTransactionDto.Amount,
                    Date = addUpdateCashTransactionDto.Date,

                    CurrencyFrom = currencyFrom,
                    AmountFrom = addUpdateCashTransactionDto.AmountFrom
                });
            }
           
            _companyContext.SaveChanges();
            return Ok();
        }

        [Authorize]
        [HttpDelete("deleteCashTransaction")]
        public IActionResult DeleteCashTransaction(DeleteTransactionDto deleteTransactionDto)
        {
            var transaction = _companyContext.CashTransactions.Single(t => t.Id == deleteTransactionDto.Id);
            _companyContext.CashTransactions.Remove(transaction);
            _companyContext.SaveChanges();
            return Ok();
        }

        [Authorize]
        [HttpGet("cashTransactions")]
        public IList<CashTransaction> GetCashTransactions([FromQuery]List<int> ids)
        {
            return _companyContext.CashTransactions
                .Where(ct => ids.Contains(ct.Portfolio.Id))
                .OrderByDescending(ct => ct.Date)
                .Include(ct => ct.Portfolio)
                .Include(ct => ct.Currency)
                .Include(ct => ct.CurrencyFrom)
                .ToList();
        }

        //[Authorize]
        //[HttpGet("cash")]
        //public IDictionary<string, double> GetCash([FromQuery] List<int> ids)
        //{
        //    var currencies = _companyContext.Currencies.ToList();
        //    var cash = currencies.ToDictionary(c => c.Name, c => 0d);

        //    var cashTransactions = GetCashTransactions(ids);
        //    foreach (var ct in cashTransactions)
        //    {
        //        cash[ct.Currency.Name] += ct.Amount;
        //        if (ct.AmountFrom != null) cash[ct.CurrencyFrom.Name] -= ct.AmountFrom.Value;
        //    }

        //    var transactions = _companyContext.Transactions
        //        .Where(t => ids.Contains(t.Portfolio.Id) && t.UseCash)
        //        .Include(t => t.TransactionType)
        //        .Include(t => t.Company)
        //        .ToList();
        //    foreach (var t in transactions)
        //    {
        //        var currency = t.Company.Currency;
        //        if (t.TransactionType.Type == "Buy")
        //        {
        //            cash[currency] -= t.Price * t.Quantity;
        //        }
        //        else
        //        {
        //            cash[currency] += t.Price * t.Quantity;
        //        }

        //        cash[currency] -= t.Commission;
        //    }

        //    return cash;
        //}



        public class AddUpdateCashTransactionDto
        {
            public int? Id { get; set; }
            public int PortfolioId { get; set; }
            public int CurrencyId { get; set; }
            public double Amount { get; set; }
            public DateTime Date { get; set; }

            public int? CurrencyFromId { get; set; }
            public double? AmountFrom { get; set; }
        }

    }
}