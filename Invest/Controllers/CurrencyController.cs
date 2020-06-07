using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;

namespace Invest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CurrencyController : ControllerBase
    {
        [HttpGet("{from}/{to}")]
        public double GetRate(string from, string to)
        {
            var url = $"http://rate-exchange-1.appspot.com/currency?from={from}&to={to}";

            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            var response = client.Execute(request);
            dynamic obj = JsonConvert.DeserializeObject<dynamic>(response.Content);
            return obj.rate;
        }
    }
}