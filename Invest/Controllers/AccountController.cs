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
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Model;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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
        [HttpPost("addTransaction")]
        public IActionResult AddTransaction(AddTransactionDto addTransactionDto)
        {
            var portfolio = _companyContext.Portfolios.Single(p => p.Id == addTransactionDto.PortfolioId);
            var company = _companyContext.Companies
                .Single(c => c.Ticker.ToLower() == addTransactionDto.CompanyTicker.ToLower());
            var type = _companyContext.TransactionTypes.Single(t => t.Type == addTransactionDto.Type);
            var transaction = new Transaction()
            {
                Portfolio = portfolio,
                Company = company,
                Quantity = addTransactionDto.Quantity,
                Price = addTransactionDto.Price,
                Commission = addTransactionDto.Commission,
                Date = addTransactionDto.Date,
                TransactionType = type
            };
            _companyContext.Transactions.Add(transaction);
            _companyContext.SaveChanges();
            return Ok();
        }

        public class AddTransactionDto
        {
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
        public IList<PortfolioTickerDto> GetPortfolio(int id)
        {
            var grouped = _companyContext
                .Transactions
                .Where(t => t.Portfolio.Id == id)
                .GroupBy(t => t.Company.Ticker)
                .Select(g => new PortfolioTickerDto()
                {
                    Ticker = g.Key,
                    AvgPrice = g.Average(t => t.Price),
                    Quantity = g.Sum(t => t.Quantity),
                    Amount = g.Sum(t => t.Price * t.Quantity)
                })
                .ToList();
            return grouped;
        }

        public class PortfolioTickerDto
        {
            public string Ticker { get; set; }
            public double AvgPrice { get; set; }
            public int Quantity { get; set; }
            public double Amount { get; set; }
        }

        public class GetTransactionDto
        {
            public int Id { get; set; }
            public int Quantity { get; set; }
            public double Price { get; set; }
            public double Commission { get; set; }
            public DateTime Date { get; set; }
            public string Type { get; set; }
        }
    }
}