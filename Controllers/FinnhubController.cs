using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Invest.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
    }
}