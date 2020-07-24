using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DbRepository;
using Invest.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Model;
using RestSharp;
using RestSharp.Deserializers;

namespace Invest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly CompanyContext _companyContext;
        public SearchController(CompanyContext context)
        {
            _companyContext = context;
            
        }

        [HttpGet("{searchString}")]
        public List<Company> Search(string searchString)
        {

            //InitDb();
            return _companyContext.Companies
                .Where(c =>
                    c.Ticker.StartsWith(searchString)
                    || c.ShortName.StartsWith(searchString)).ToList();
        }

        private void InitDb()
        {
            var nasdaqUrl =
                "https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_json/data/a5bc7580d6176d60ac0b2142ca8d7df6/nasdaq-listed_json.json";
            var nyseUrl =
                "https://pkgstore.datahub.io/core/nyse-other-listings/other-listed_json/data/e95106d7c30d265a719c5ff43843907a/other-listed_json.json";
            var moexUrl =
                "http://iss.moex.com/iss/engines/stock/markets/shares/boards/tqbr/securities.json";

            
            var moexUrlTqtf =
                "http://iss.moex.com/iss/engines/stock/markets/shares/boards/tqtf/securities.json";

            var deserial = new JsonDeserializer();

            var client = new RestClient(moexUrl);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            var jsonMoexCompanies = deserial.Deserialize<Dictionary<string, Dictionary<string, List<List<string>>>>>(response);
            var moexSecurities = jsonMoexCompanies["securities"];
            var moexDatas = moexSecurities["data"];
            var moexCompanies = moexDatas.Select(
                c => new Company($"{c[0]}.ME", c[2], c[9], "MOEX", "Stock"));

            foreach (var nc in moexCompanies)
            {
                var company = _companyContext.Companies.SingleOrDefault(c => c.Ticker == nc.Ticker);
                if (company == null) 
                    _companyContext.Add(nc);
                else 
                    company.Type = nc.Type;
            }

            //client = new RestClient(nyseUrl);
            //request = new RestRequest(Method.GET);
            //response = client.Execute(request);
            //var jsonNuseCompanies = deserial.Deserialize<List<Dictionary<string, string>>>(response);
            //var nuseCompanies = jsonNuseCompanies.Select(
            //    c => new Company(c["ACT Symbol"], c["Company Name"], c["Company Name"], "NYSE"));

            //client = new RestClient(moexUrl);
            //request = new RestRequest(Method.GET);
            //response = client.Execute(request);
            //var jsonMoexCompanies = deserial.Deserialize<Dictionary<string, Dictionary<string, List<List<string>>>>>(response);
            //var moexSecurities = jsonMoexCompanies["securities"];
            //var moexDatas = moexSecurities["data"];
            //var moexCompanies = moexDatas.Select(
            //    c => new Company(c[0], c[2], c[9], "MOEX"));



            //var client = new RestClient(moexUrlTqtf);
            //var request = new RestRequest(Method.GET);
            //var response = client.Execute(request);
            //var jsonMoexCompaniesTqtf = deserial.Deserialize<Dictionary<string, Dictionary<string, List<List<string>>>>>(response);
            //var moexSecuritiesTqtf = jsonMoexCompaniesTqtf["securities"];
            //var moexDatasTqtf = moexSecuritiesTqtf["data"];
            //var moexCompaniesTqtf = moexDatasTqtf.Select(
            //    c => new Company(c[0], c[2], c[9], "MOEX"));

            //var allCompanies = new List<Company>();
            //allCompanies.AddRange(nasdaqCompanies);
            //allCompanies.AddRange(nuseCompanies);
            //allCompanies.AddRange(moexCompanies);
            //allCompanies.AddRange(moexCompaniesTqtf);

            //_companyContext.Companies.AddRange(allCompanies);

            _companyContext.SaveChanges();

        }
    }
}