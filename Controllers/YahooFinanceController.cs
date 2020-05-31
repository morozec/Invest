using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
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
                "summaryProfile,summaryDetail,quoteType,defaultKeyStatistics,assetProfile,financialData,earnings";
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

    }
}