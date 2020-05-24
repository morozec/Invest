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

        [HttpGet("income/{companySymbol}")]
        public IActionResult GetIncome(string companySymbol)
        {
            var url =
                $"http://localhost:4567/api/financials/{companySymbol}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }
    }
}