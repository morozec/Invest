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
        [HttpGet("balanceSheet")]
        public IActionResult GetBalanceSheet()
        {
            var ibmFile = @"C:\Users\andre\Documents\ibm.txt";
            //var client = new RestClient("https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-balance-sheet?symbol=IBM");
            //var request = new RestRequest(Method.GET);
            //request.AddHeader("x-rapidapi-host", "apidojo-yahoo-finance-v1.p.rapidapi.com");
            //request.AddHeader("x-rapidapi-key", "0b4cd80286msh853ffa4af8bdab2p170732jsnb807240dce12");
            //IRestResponse response = client.Execute(request);

            //System.IO.File.WriteAllText(@"C:\Users\andre\Documents\ibm.txt", response.Content);
            //return Ok(response.Content);

            var content = System.IO.File.ReadAllText(ibmFile);
            return Ok(content);

        }
    }
}