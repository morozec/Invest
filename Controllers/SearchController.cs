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
                    || c.Name.StartsWith(searchString)).ToList();
        }

        private void InitDb()
        {
            var nasdaqUrl =
                "https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_json/data/a5bc7580d6176d60ac0b2142ca8d7df6/nasdaq-listed_json.json";
            var nyseUrl =
                "https://pkgstore.datahub.io/core/nyse-other-listings/nyse-listed_json/data/e8ad01974d4110e790b227dc1541b193/nyse-listed_json.json";
            var deserial = new JsonDeserializer();

            var client = new RestClient(nasdaqUrl);
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);

          
            var jsonNasdaqCompanies = deserial.Deserialize<List<Dictionary<string, string>>>(response);
            var nasdaqCompanies = jsonNasdaqCompanies.Select(
                c => new Company(c["Ticker"], c["Company Name"]));


            client = new RestClient(nyseUrl);
            request = new RestRequest(Method.GET);
            response = client.Execute(request);
            var jsonNuseCompanies = deserial.Deserialize<List<Dictionary<string, string>>>(response);
            var nuseCompanies = jsonNuseCompanies.Select(
                c => new Company(c["ACT Ticker"], c["Company Name"]));

            var allCompanies = new List<Company>();
            allCompanies.AddRange(nasdaqCompanies);
            allCompanies.AddRange(nuseCompanies);

            _companyContext.Companies.AddRange(allCompanies);

            _companyContext.SaveChanges();

        }
    }
}