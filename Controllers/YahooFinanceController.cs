using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestSharp;

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
                $"http://localhost:4567/api/info/{companySymbol}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("income/{companySymbol}/{period}")]
        public IActionResult GetIncome(string companySymbol, string period)
        {
            var url =
                $"http://localhost:4567/api/financials/{companySymbol}/{period}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("balanceSheet/{companySymbol}/{period}")]
        public IActionResult GetBalanceSheet(string companySymbol, string period)
        {
            var url =
                $"http://localhost:4567/api/balanceSheet/{companySymbol}/{period}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("cashflow/{companySymbol}/{period}")]
        public IActionResult GetCashflow(string companySymbol, string period)
        {
            var url =
                $"http://localhost:4567/api/cashflow/{companySymbol}/{period}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }
    }
}