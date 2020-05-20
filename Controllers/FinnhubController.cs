using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Invest.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RestSharp;

namespace Invest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FinnhubController : ControllerBase
    {
        [HttpGet("profile/{companySymbol}")]
        public IActionResult GetProfile(string companySymbol)
        {
            var url =
                $"https://finnhub.io/api/v1/stock/profile2?symbol={companySymbol}&token={Constants.FINNHUB_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("news/{companySymbol}")]
        public IActionResult GetNews(string companySymbol)
        {
            var today = DateTime.Today.ToString("yyyy-MM-dd");
            var monthAgo = DateTime.Today.AddDays(-30).ToString("yyyy-MM-dd");

            var url =
                $"https://finnhub.io/api/v1/company-news?symbol={companySymbol}&from={monthAgo}&to={today}&token={Constants.FINNHUB_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("recommendations/{companySymbol}")]
        public IActionResult GetRecommendations(string companySymbol)
        {
            var url =
                $"https://finnhub.io/api/v1/stock/recommendation?symbol={companySymbol}&token={Constants.FINNHUB_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("priceTargets/{companySymbol}")]
        public IActionResult GetPriceTargets(string companySymbol)
        {
            var url =
                $"https://finnhub.io/api/v1/stock/price-target?symbol={companySymbol}&token={Constants.FINNHUB_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("upgradeDowngrade/{companySymbol}")]
        public IActionResult GetUpgradeDowngrade(string companySymbol)
        {
            var url =
                $"https://finnhub.io/api/v1/stock/upgrade-downgrade?symbol={companySymbol}&token={Constants.FINNHUB_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        /// <summary>
        /// Календарь
        /// </summary>
        /// <param name="companySymbol"></param>
        /// <returns></returns>
        [HttpGet("earnings/{companySymbol}")]
        public IActionResult GetEarnings(string companySymbol)
        {
            const string startDate = "2015-01-01";
            const string endDate = "2030-01-01";

            var url =
                $"https://finnhub.io/api/v1/calendar/earnings?from={startDate}&to={endDate}&symbol={companySymbol}&token={Constants.FINNHUB_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }


        [HttpGet("revenueEstimates/{companySymbol}")]
        public IActionResult GetRevenueEstimates(string companySymbol)
        {
            var url =
                $"https://finnhub.io/api/v1/stock/revenue-estimate?symbol={companySymbol}&token={Constants.FINNHUB_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("epsEstimates/{companySymbol}")]
        public IActionResult GetEpsEstimates(string companySymbol)
        {
            var url =
                $"https://finnhub.io/api/v1/stock/eps-estimate?symbol={companySymbol}&token={Constants.FINNHUB_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }
    }
}