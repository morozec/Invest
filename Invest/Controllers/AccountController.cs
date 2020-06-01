﻿using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using DbRepository;
using Invest.Helpers;
using Invest.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        private readonly CompanyContext _companyContext;
        public AccountController(CompanyContext context)
        {
            _companyContext = context;
        }

        [HttpPost("token")]
        public IActionResult Token(Person person)
        {
            var identity = GetIdentity(person.Login, person.Password);
            if (identity == null)
            {
                return BadRequest(new { errorText = "Invalid username or password." });
            }

            var now = DateTime.UtcNow;
            // создаем JWT-токен
            var jwt = new JwtSecurityToken(
                    issuer: AuthOptions.ISSUER,
                    audience: AuthOptions.AUDIENCE,
                    notBefore: now,
                    claims: identity.Claims,
                    expires: now.Add(TimeSpan.FromMinutes(AuthOptions.LIFETIME)),
                    signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));
            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            var obj = new JObject {["access_token"] = encodedJwt, ["username"] = identity.Name};

            return Content(obj.ToString(), "application/json");
        }

        private ClaimsIdentity GetIdentity(string username, string password)
        {
            Person person = _companyContext.Persons.FirstOrDefault(x => x.Login == username && x.Password == password);
            if (person != null)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, person.PersonId.ToString()),
                    new Claim(ClaimsIdentity.DefaultNameClaimType, person.Login),
                    new Claim(ClaimsIdentity.DefaultRoleClaimType, person.Role)
                };
                ClaimsIdentity claimsIdentity =
                    new ClaimsIdentity(claims, "Token", ClaimsIdentity.DefaultNameClaimType,
                        ClaimsIdentity.DefaultRoleClaimType);
                return claimsIdentity;
            }

            // если пользователя не найдено
            return null;
        }

        [Authorize]
        [HttpGet("watchList")]
        public IEnumerable<Company> GetWatchList()
        {
            var personId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var watchList = _companyContext.WatchLists
                .Include(wl => wl.CompanyWatchLists)
                .ThenInclude(cwl => cwl.Company)
                .SingleOrDefault(wl => wl.PersonId == personId);
            if (watchList != null)
            {
                var companies = watchList.CompanyWatchLists.Select(cwl => cwl.Company).ToList();
                return companies;
            }

            throw new Exception("Watch list not found");
        }

        [Authorize]
        [HttpPost("addToWatchList")]
        public IActionResult AddToWatchList(AddingCompanyViewModel addingCompanyViewModel)
        {
            var personId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var watchList = _companyContext.WatchLists.SingleOrDefault(wl => wl.PersonId == personId);
            var company = _companyContext.Companies.SingleOrDefault(c => c.Ticker == addingCompanyViewModel.Ticker);
            if (watchList != null && company != null)
            {
                watchList.CompanyWatchLists.Add(new CompanyWatchList()
                    {WatchListId = watchList.WatchListId, CompanyId = company.Id});
                _companyContext.SaveChanges();
                return Ok("Company added to watch list");
            }

            return BadRequest("Adding company to watch list error");
        }

        [Authorize]
        [HttpGet("isInWatchList/{companySymbol}")]
        public bool IsInWatchList(string companySymbol)
        {
            var personId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var watchList = _companyContext.WatchLists.Include(wl => wl.CompanyWatchLists)
                .SingleOrDefault(wl => wl.PersonId == personId);
            var company = _companyContext.Companies.SingleOrDefault(c => c.Ticker == companySymbol);
            if (watchList == null) 
                throw new Exception("Watch list not found");
            if (company == null)
                throw new Exception("Company not found");

            return watchList.CompanyWatchLists.Any(cwl => cwl.CompanyId == company.Id);
        }

        [Authorize]
        [HttpPost("deleteFromWatchList")]
        public IActionResult DeleteFromWatchList(AddingCompanyViewModel addingCompanyViewModel)
        {
            var personId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var watchList = _companyContext.WatchLists.Include(wl => wl.CompanyWatchLists)
                .SingleOrDefault(wl => wl.PersonId == personId);
            var company = _companyContext.Companies.SingleOrDefault(c => c.Ticker == addingCompanyViewModel.Ticker);
            if (watchList == null)
                throw new Exception("Watch list not found");
            if (company == null)
                throw new Exception("Company not found");
            watchList.CompanyWatchLists.RemoveAll(c => c.CompanyId == company.Id);
            _companyContext.SaveChanges();

            return Ok("Company deleted from watch list");
        }

    }
}