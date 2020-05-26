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
                $"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{companySymbol}?modules=" +
                "summaryProfile,summaryDetail,quoteType,defaultKeyStatistics,assetProfile,financialData";
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

    }
}