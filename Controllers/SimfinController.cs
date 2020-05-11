using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Threading.Tasks;
using Invest.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestSharp;

namespace Invest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SimfinController : ControllerBase
    {
        [HttpGet("income/{companyId}/{year}/{pType}")]
        public IActionResult GetIncome(int companyId, int year, string pType)
        {
            var url =
                $"https://simfin.com/api/v1/companies/id/{companyId}/statements/standardised?stype=pl&ptype={pType}&fyear={year}&api-key={Constants.SIMFIN_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("balanceSheet/{companyId}/{year}/{pType}")]
        public IActionResult GetBalanceSheet(int companyId, int year, string pType)
        {
            var url =
                $"https://simfin.com/api/v1/companies/id/{companyId}/statements/standardised?stype=bs&ptype={pType}&fyear={year}&api-key={Constants.SIMFIN_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }

        [HttpGet("cashFlow/{companyId}/{year}/{pType}")]
        public IActionResult GetCashFlow(int companyId, int year, string pType)
        {
            var url =
                $"https://simfin.com/api/v1/companies/id/{companyId}/statements/standardised?stype=cf&ptype={pType}&fyear={year}&api-key={Constants.SIMFIN_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }
        

        [HttpGet("ratios/{companyId}")]
        public IActionResult GetRatios(int companyId)
        {
            var url =
                $"https://simfin.com/api/v1/companies/id/{companyId}/ratios?api-key={Constants.SIMFIN_API}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Ok(response.Content);
        }
    }
}