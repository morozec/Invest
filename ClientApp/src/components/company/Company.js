import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { StatementData } from './statement-data/StatementData';
import { Ratios } from './Ratios';
import { Summary } from './Summary';
import { News } from './News';
import { SharesAggregated } from './SharesAggregated'
import { useLocation } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { getDateStringFromUnixTime } from '../../helpers';
import { IncomeTable } from './statement-data/IncomeTable';
import { Financials } from './yahoo-financials/Financials';
import { Dividends } from './Dividends';
import {SecFilings} from './SecFilings'
import { Holders } from './holders/Ownership';
import { Analysis } from './Analysis';

function Company(props) {
  const [key, setKey] = useState('summary');

  const [profile, setProfile] = useState(null);

  // const [ratios, setRatios] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [priceTargets, setPriceTargets] = useState(null);
  const [upgradeDowngrade, setUpgradeDowngrade] = useState(null);

  const [sharesAggregatedBasicData, setSharesAggregatedBasicData] = useState(null);
  const [sharesAggregatedDilutedData, setSharesAggregatedDilutedData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const { comparingCompanies, addComparingCompany, removeComparingCompany } = props;


  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const ticker = query.get('t');
 

  const loadData = () => {
    setIsLoading(true);

    const getProfile = async (companySymbol) => {
      const response = await fetch(`api/yahoofinance/info/${companySymbol}`);
      const data = await response.json();
      const result = data.quoteSummary.result;
      if (result === null) return null;
      return result[0];
    }

    const getRecommendations = async (companySymbol) => {
      const response = await fetch(`api/finnhub/recommendations/${companySymbol}`);
      const recommendations = await response.json();
      return recommendations;
    }

    const getPriceTargets = async (companySymbol) => {
      const response = await fetch(`api/finnhub/priceTargets/${companySymbol}`);
      const data = await response.json();
      return data;
    }

    const getUpgradeDowngrade = async (companySymbol) => {
      const response = await fetch(`api/finnhub/upgradeDowngrade/${companySymbol}`);
      const data = await response.json();
      return data;
    }

    // const getSharesAggregated = async (companyId) => {
    //   const response = await fetch(`api/simfin/sharesAggregated/${companyId}`);
    //   const data = await response.json();
    //   return data;
    // }

    // const handleSharesAggregated = (sharesAggregatedResult) => {
    //   const saBasicData = sharesAggregatedResult.filter(d => d.figure === 'common-outstanding-basic');
    //   const saDilutedData = sharesAggregatedResult.filter(d => d.figure === 'common-outstanding-diluted');
    //   setSharesAggregatedBasicData(saBasicData);
    //   setSharesAggregatedDilutedData(saDilutedData);
    // }

    (async () => {
      let promises;
      promises = [
        getProfile(ticker),
        getRecommendations(ticker),
        getPriceTargets(ticker),
        getUpgradeDowngrade(ticker),
      ];
      let result = await Promise.all(promises);

      console.log('one step', result);
      setProfile(result[0]);
      setRecommendations(result[1].reverse());
      setPriceTargets(result[2]);
      setUpgradeDowngrade(result[3].slice(0, 10));

      setIsLoading(false);
    })();
  }

  useEffect(loadData, [ticker])


  let incomeIndexes = [
    { name: 'totalRevenue', children: [] },
    { name: 'costOfRevenue', children: [] },
    { name: 'grossProfit', children: [] },
    {
      name: 'totalOperatingExpenses', children: [
        { name: 'researchDevelopment', children: [] },
        { name: 'sellingGeneralAdministrative', children: [] },
        { name: 'otherOperatingExpenses', children: [] },
      ]
    },
    { name: 'operatingIncome', children: [] },
    { name: 'interestExpense', children: [] },
    { name: 'totalOtherIncomeExpenseNet', children: [] },
    { name: 'incomeBeforeTax', children: [] },
    { name: 'incomeTaxExpense', children: [] },
    { name: 'netIncomeFromContinuingOps', children: [] },
    { name: "netIncome", children: [] },
    { name: 'netIncomeApplicableToCommonShares', children: [] },
    { name: 'ebit', children: [] },
  ];

  let balanceSheetIndexes = [
    {
      name: "totalAssets", children: [
        {
          name: "totalCurrentAssets", children: [
            { name: "cash", children: [] },
            { name: "shortTermInvestments", children: [] },
            { name: "netReceivables", children: [] },
            { name: "inventory", children: [] },
            { name: "otherCurrentAssets", children: [] },
          ]
        },
        {
          name: 'Non-current assets', children: [//!!!
            { name: "propertyPlantEquipment", children: [] },
            { name: "longTermInvestments", children: [] },
            { name: "goodWill", children: [] },
            { name: "intangibleAssets", children: [] },
            { name: "otherAssets", children: [] }
          ]
        },

      ]
    },

    {
      name: "Liabilities and stockholders' equity", children: [//!!!
        {
          name: "totalLiab", children: [
            {
              name: "totalCurrentLiabilities", children: [
                { name: "shortLongTermDebt", children: [] },
                { name: "accountsPayable", children: [] },
                { name: "otherCurrentLiab", children: [] }
              ]
            },
            {
              name: "Non-current liabilities", children: [//!!!
                { name: "longTermDebt", children: [] },

              ]
            },
            { name: "minorityInterest", children: [] },
            { name: "otherLiab", children: [] }
          ]
        },
        {
          name: "totalStockholderEquity", children: [
            { name: "commonStock", children: [] },
            { name: "retainedEarnings", children: [] },
            { name: "treasuryStock", children: [] },
            { name: "otherStockholderEquity", children: [] }
          ]
        },
      ]
    }

  ];


  let cashflowIndexes = [
    {
      name: "totalCashFromOperatingActivities", children: [
        { name: "netIncome", children: [] },
        { name: "depreciation", children: [] },
        { name: "changeToAccountReceivables", children: [] },
        { name: "changeToInventory", children: [] },

      ]
    },

    {
      name: "totalCashflowsFromInvestingActivities", children: [
        {name: "capitalExpenditures", children: []},
        {name: "otherCashflowsFromInvestingActivities", children:[]},

      ]
    },

    {
      name: "totalCashFromFinancingActivities", children: [
        {name: "netBorrowings", children: []},
        {name: "issuanceOfStock", children: []},
        {name: "repurchaseOfStock", children: []},
        {name: "dividendsPaid", children: []},
        {name: "otherCashflowsFromFinancingActivities", children:[]},

      ]
    },

    {name: "changeInCash", children: []},
    {name: "effectOfExchangeRate", children: []}

  ];

  const parseFinancials = (indexes, statementType1) => {

    return (statementData, statementType0) => {
      let data = statementData[statementType0][statementType1];

      let dates = data.map(v => v.endDate.fmt);
      // let data = {};
      // for (let i = 0; i < statementData.index.length; ++i) {
      //   let index = statementData.index[i];
      //   data[index] = statementData.data[i];
      // }

      // let indexesSet = new Set();
      // const fillSet = (arr) => {
      //   for (let index of arr) {
      //     let name = index.name;
      //     indexesSet.add(name);
      //     fillSet(index.children);
      //   }
      // }
      // fillSet(indexes);

      // for (let i = 0; i < statementData.index.length; ++i) {
      //   if (!indexesSet.has(statementData.index[i])) {
      //     indexesSet.add(statementData.index[i]);
      //     indexes.push({
      //       name: statementData.index[i],
      //       children: []
      //     })
      //   }
      // }

      return {
        dates,
        indexes,
        data
      };
    }

  }


  let content;
  if (isLoading) {
    content = <p><em>Loading...</em></p>;
  } else {
    content =
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className='mb-2'>
        <Tab eventKey="summary" title="Summary">
          <Summary
            ticker={ticker}
            profile={profile}
            recommendations={recommendations}
            priceTargets={priceTargets}
            upgradeDowngrade={upgradeDowngrade}

            comparingCompanies={comparingCompanies}
            addComparingCompany={addComparingCompany}
            removeComparingCompany={removeComparingCompany}
          />
        </Tab>

        <Tab eventKey='income' title='Income'>
          <Financials
            isActive={key === 'income'}
            yearStatementType='incomeStatementHistory'
            quarterStatementType='incomeStatementHistoryQuarterly'
            statementTitle='Income'
            companySymbol={profile.quoteType.symbol}
            parseFinancials={parseFinancials(incomeIndexes, 'incomeStatementHistory')}

            chartInfos={
              [
                {
                  bars: [
                    {
                      name: 'totalRevenue',
                      stack: 'totalRevenue',
                      color: [200, 200, 200]
                    },
                    {
                      name: 'operatingIncome',
                      stack: 'operatingIncome',
                      color: [0, 110, 30]
                    },
                    {
                      name: 'netIncome',
                      stack: 'netIncome',
                      color: [156, 255, 174]
                    }
                  ],
                  isMillions: true
                },

                // {
                //   bars: [
                //     {
                //       uid: 'dilutedEps',
                //       stack: 'eps',
                //       color: [200, 200, 200]
                //     },
                //   ],
                //   isMillions: false
                // }
              ]
            }
          />
        </Tab>

        <Tab eventKey='balanceSheet' title='Balance Sheet'>
          <Financials
            isActive={key === 'balanceSheet'}
            yearStatementType='balanceSheetHistory'
            quarterStatementType='balanceSheetHistoryQuarterly'
            statementTitle='Balance Sheet'
            companySymbol={profile.quoteType.symbol}
            parseFinancials={parseFinancials(balanceSheetIndexes, 'balanceSheetStatements')}

            chartInfos={
              [
                {
                  bars: [
                    {
                      name: 'totalStockholderEquity',
                      stack: 'assets',
                      color: [74, 74, 74]
                    },
                    {
                      name: 'totalLiab',
                      stack: 'assets',
                      color: [191, 191, 191]
                    }
                  ],
                  isMillions: true
                },

                {
                  bars: [
                    {
                      name: 'cash',
                      stack: 'cash',
                      color: [0, 222, 41]
                    },
                    {
                      name: 'shortLongTermDebt',
                      stack: 'debt',
                      color: [255, 0, 0]
                    },
                    {
                      name: 'longTermDebt',
                      stack: 'debt',
                      color: [255, 150, 150]
                    }
                  ],
                  isMillions: true
                },
              ]
            }
          />
        </Tab>

        <Tab eventKey='cashflow' title='Cash Flow'>
          <Financials
            isActive={key === 'cashflow'}
            yearStatementType='cashflowStatementHistory'
            quarterStatementType='cashflowStatementHistoryQuarterly'
            statementTitle='Cash Flow'
            companySymbol={profile.quoteType.symbol}
            parseFinancials={parseFinancials(cashflowIndexes, 'cashflowStatements')}

            chartInfos={
              [
                {
                  bars: [
                    {
                      name: 'totalCashFromOperatingActivities',
                      stack: 'totalCashFromOperatingActivities',
                      color: [0, 110, 30]
                    },
                    {
                      name: 'totalCashflowsFromInvestingActivities',
                      stack: 'totalCashflowsFromInvestingActivities',
                      color: [0, 222, 41]
                    },
                    {
                      name: 'totalCashFromFinancingActivities',
                      stack: 'totalCashFromFinancingActivities',
                      color: [156, 255, 174]
                    },
                    // {
                    //   uid: 'fcf',
                    //   stack: 'Free Cash Flow',
                    //   color: [0, 0, 0]
                    // }
                  ],
                },                
              ]
            }
          />
        </Tab>
      
        <Tab eventKey="ratios" title="Ratios">
          <Ratios
            profile={profile}
          />
        </Tab>

        <Tab eventKey="dividends" title="Dividends">
          <Dividends
            ticker={profile.quoteType.symbol}
            isActive={key === 'dividends'}
          />
        </Tab>

        <Tab eventKey="secFillings" title="SEC Filings">
          <SecFilings
            ticker={profile.quoteType.symbol}
            isActive={key === 'secFillings'}
          />
        </Tab>

        <Tab eventKey="ownership" title="Ownership">
          <Holders
            ticker={profile.quoteType.symbol}
            isActive={key === 'ownership'}
          />
        </Tab>

        <Tab eventKey="news" title="News">
          <News
            ticker={profile.quoteType.symbol}
            isActive={key === 'news'}
          />
        </Tab>

        

        {/* <Tab eventKey="sharesAggregated" title="Shares Outstanding">
          <SharesAggregated
            ticker={profile.symbol}

            sharesAggregatedBasicData={sharesAggregatedBasicData.filter(d => d.period === 'Q1' || d.period === 'Q2' || d.period === 'Q3' || d.period === 'Q4')}
            sharesAggregatedDilutedData={sharesAggregatedDilutedData.filter(d => d.period === 'Q1' || d.period === 'Q2' || d.period === 'Q3' || d.period === 'Q4')}
          />
        </Tab> */}

        <Tab eventKey="analysis" title="Analysis">
          <Analysis
            ticker={profile.quoteType.symbol}
            isActive={key === 'analysis'}
          />
        </Tab>
      </Tabs>
  }

  return (
    <div>
      {content}
    </div>
  )
}

export default withRouter(Company);