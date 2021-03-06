﻿using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using RestSharp;
using RestSharp.Deserializers;

namespace Invest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class YahooFinanceController : ControllerBase
    {
        [HttpGet("info/{companySymbol}")]
        public IActionResult GetInfo(string companySymbol)
        {
            var url =
                $"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{companySymbol}?modules=" +
                "summaryProfile,summaryDetail,quoteType,defaultKeyStatistics,assetProfile,financialData,earnings,upgradeDowngradeHistory";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            var response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("financials/{companySymbol}/{statementType}")]
        public IActionResult GetFinancials(string companySymbol, string statementType)
        {
            var url = $"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{companySymbol}?modules={statementType}";

            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            var response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("dividends/{companySymbol}")]
        public IActionResult GetDividends(string companySymbol)
        {
            var url = $"https://query1.finance.yahoo.com/v8/finance/chart/{companySymbol}?period1=0&period2=9999999999&interval=1d&events=div";

            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            var response = client.Execute(request);

            dynamic obj = JsonConvert.DeserializeObject<dynamic>(response.Content);

            var events = obj.chart.result[0].events;
            if (events == null) return NoContent();
            
            var dividends = events.dividends;
            return Ok(dividends.ToString());
        }

        [HttpGet("secFilings/{companySymbol}")]
        public IActionResult GetSecFillings(string companySymbol)
        {
            var url = $"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{companySymbol}?modules=secFilings";

            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            var response = client.Execute(request);

            dynamic obj = JsonConvert.DeserializeObject<dynamic>(response.Content);

            var result = obj.quoteSummary.result;
            if (result == null) return NoContent();

            var secFilings = result[0].secFilings.filings;
            return Ok(secFilings.ToString());
        }

        [HttpGet("ownership/{companySymbol}")]
        public IActionResult GetOwnership(string companySymbol)
        {
            var url = $"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{companySymbol}?modules=institutionOwnership,fundOwnership,majorHoldersBreakdown,insiderHolders,netSharePurchaseActivity,insiderTransactions";

            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            var response = client.Execute(request);

            dynamic obj = JsonConvert.DeserializeObject<dynamic>(response.Content);

            var ownership = obj.quoteSummary.result[0];
            return Ok(ownership.ToString());
        }

        [HttpGet("earnings/{companySymbol}")]
        public IActionResult GetEarnings(string companySymbol)
        {
            var url = $"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{companySymbol}?modules=earningsHistory,earningsTrend";

            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            var response = client.Execute(request);

            dynamic obj = JsonConvert.DeserializeObject<dynamic>(response.Content);

            var result = obj.quoteSummary.result;
            if (result == null) return NoContent();

            return Ok(result[0].ToString());
        }


        [HttpGet("price/{companySymbol}")]
        public IActionResult GetPrice(string companySymbol)
        {
            var url =
                $"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{companySymbol}?modules=price";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            var response = client.Execute(request);

            dynamic obj = JsonConvert.DeserializeObject<dynamic>(response.Content);
            var result = obj.quoteSummary.result;
            if (result == null) return NoContent();

            return Ok(result[0].price);
        }

        [HttpGet("prices")]
        public IDictionary<string, dynamic> GetPrices([FromQuery(Name = "symbols")] List<string> symbols)
        {
            var prices = new Dictionary<string, dynamic>();
            var url =
                $"https://query1.finance.yahoo.com/v7/finance/quote?symbols=";
            foreach (var symbol in symbols)
            {
                url += $"{symbol},";
            }

            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            var response = client.Execute(request);

            dynamic obj = JsonConvert.DeserializeObject<dynamic>(response.Content);
            var result = obj.quoteResponse.result;
            for (var i = 0; i < symbols.Count; ++i)
            {
                prices.Add(symbols[i], result[i]);
            }

            return prices;
        }

        [Authorize]
        [HttpGet("login")]
        public IActionResult GetLogin()
        {
            return Ok($"Ваш логин: {User.Identity.Name}");
        }

        //[Authorize(Roles = "admin")]
        //[HttpGet("role")]
        //public IActionResult GetRole()
        //{
        //    return Ok("Ваша роль: администратор");
        //}
    }
}