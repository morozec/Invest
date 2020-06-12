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
        [HttpPost("addPortfolio")]
        public async Task<IActionResult> AddPortfolio(AddPortfolioDto addPortfolioDto)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var portfolio = new Portfolio() {Name = addPortfolioDto.Name, User = user};
            _companyContext.Portfolios.Add(portfolio);
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

        public class AddPortfolioDto
        {
            public string Name { get; set; }
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
        }

        [Authorize]
        [HttpGet("portfolio/{id}")]
        public PortfolioDto GetPortfolio(int id)
        {
            var portfolio = _companyContext.Portfolios.Single(p => p.Id == id);
            var holdings = _companyContext
                .Transactions
                .Include(t => t.Company)
                .Include(t => t.TransactionType)
                .Where(t => t.Portfolio.Id == id)
                .OrderBy(t => t.Date)
                .AsEnumerable()
                .GroupBy(t => t.Company)
                .Select(g =>
                {
                    var buyHoldings = new List<Holding>();
                    var sellHoldings = new List<Holding>();
                    var closedAmount = 0d;
                    var totalAmount = 0d;

                    foreach (var trans in g)
                    {
                        if (trans.TransactionType.Type == "Buy")
                        {
                            totalAmount += trans.Price * trans.Quantity;
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
                        else
                        {
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
                    double openAvgPrice = 0d;
                   
                    if (buyHoldings.Count > 0)
                    {
                        openQuantity = buyHoldings.Sum(h => h.Quantity);
                        openAmount = buyHoldings.Sum(h => h.Price * h.Quantity);
                        openAvgPrice = buyHoldings.Average(h => h.Price);
                    }
                    else if (sellHoldings.Count > 0)
                    {
                        openQuantity = sellHoldings.Sum(h => -h.Quantity);
                        openAmount = buyHoldings.Sum(h => -h.Price * h.Quantity);
                        openAvgPrice = sellHoldings.Average(h => -h.Price);
                    }

                    return new PortfolioHoldingsDto
                    {
                        Ticker = g.Key.Ticker,
                        Quantity = openQuantity,
                        Amount = openAmount,
                        AvgPrice = openAvgPrice,
                        ClosedAmount = closedAmount,
                        TotalAmount = totalAmount,
                        Sector = g.Key.Sector,
                        Industry = g.Key.Industry
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
                Name = portfolio.Name,
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
            public string Name { get; set; }
            public IList<PortfolioHoldingsDto> Holdings { get; set; }
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
        }

        [Authorize]
        [HttpGet("portfolio/{id}/{symbol}")]
        public IEnumerable<Transaction> GetPortfolioCompanyTransactions(int id, string symbol)
        {
            var transactions = _companyContext
                .Transactions
                .Include(t => t.TransactionType)
                .Where(t => t.Portfolio.Id == id && t.Company.Ticker == symbol)
                .OrderBy(t => t.Date)
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

    }
}