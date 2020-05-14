import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { StatementData } from './statement-data/StatementData';
import { Ratios } from './Ratios';
import { Summary } from './Summary';
import { News } from './News';
import {SharesAggregated} from './SharesAggregated'
import { useLocation } from 'react-router-dom';

export function StockSimfin(props) {

  const [key, setKey] = useState('summary');

  const [simfinId, setSimfinId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ratios, setRatios] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [priceTargets, setPriceTargets] = useState(null);
  const [upgradeDowngrade, setUpgradeDowngrade] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const ticker = query.get('t');

  useEffect(() => {
    setIsLoading(true);

    const getSimfinId = async (companySymbol) => {
      const response = await fetch(`api/simfin/id/${companySymbol}`);
      const json = await response.json();
      return json[0].simId;
    }

    const getProfile = async (companySymbol) => {
      const response = await fetch(`api/finnhub/profile/${companySymbol}`);
      const profile = await response.json();
      return profile;
    }

    const getRatios = async (companyId) => {
      const response = await fetch(`api/simfin/ratios/${companyId}`);
      const ratios = await response.json();
      return ratios;
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

    let promises = [
      getSimfinId(ticker),
      getProfile(ticker),
      getRecommendations(ticker),
      getPriceTargets(ticker),
      getUpgradeDowngrade(ticker)
    ];

    Promise.all(promises).then(result => {
      console.log(result);
      setSimfinId(result[0]);
      setProfile(result[1]);
      setRecommendations(result[2].reverse());
      setPriceTargets(result[3]);
      setUpgradeDowngrade(result[4].slice(0, 10));
      return result[0];//simfin id
    })
      .then(simfinId => getRatios(simfinId))
      .then(ratios => {
        setRatios(ratios);
        setIsLoading(false);
      })


  }, [ticker])

  let content;
  if (isLoading) {
    content = <p><em>Loading...</em></p>;
  } else {
    content =
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className='mb-2'>
        <Tab eventKey="summary" title="Summary">
          <Summary
            profile={profile}
            ratios={ratios}
            recommendations={recommendations}
            priceTargets={priceTargets}
            upgradeDowngrade={upgradeDowngrade}
          />
        </Tab>

        <Tab eventKey="income" title="Income" >
          <StatementData
            ticker={profile.ticker}
            simfinId={simfinId}
            statementType='income'
            statementTitle='Income'
            isActive={key === 'income'}
            chartInfos={
              [
                {
                  bars: [
                    {
                      label: 'Revenue',
                      stack: 'revenue',
                      color: [200, 200, 200]
                    },
                    {
                      label: 'Operating Income (Loss)',
                      stack: 'operatingIncome',
                      color: [0, 110, 30]
                    },
                    {
                      label: 'Net Income',
                      stack: 'netIncome',
                      color: [156, 255, 174]
                    }
                  ]
                }
              ]
            }
          />
        </Tab>
        <Tab eventKey="balanceSheet" title="Balance Sheet">
          <StatementData
            ticker={profile.ticker}
            simfinId={simfinId}
            statementType='balanceSheet'
            statementTitle='Balance Sheet'
            isActive={key === 'balanceSheet'}
            chartInfos={
              [
                {
                  bars: [
                    {
                      label: 'Total Equity',
                      stack: 'assets',
                      color: [74, 74, 74]
                    },
                    {
                      label: 'Total Liabilities',
                      stack: 'assets',
                      color: [191, 191, 191]
                    }
                  ]
                },

                {
                  bars: [
                    {
                      label: 'Cash, Cash Equivalents & Short Term Investments',
                      stack: 'cash',
                      color: [0, 222, 41]
                    },
                    {
                      label: 'Short Term Debt',
                      stack: 'debt',
                      color: [255, 0, 0]
                    },
                    {
                      label: 'Long Term Debt',
                      stack: 'debt',
                      color: [255, 150, 150]
                    }
                  ]
                },
              ]
            }
          />
        </Tab>
        <Tab eventKey="cashFlow" title="Cash Flow">
          <StatementData
            ticker={profile.ticker}
            simfinId={simfinId}
            statementType='cashFlow'
            statementTitle='Cash Flow'
            isActive={key === 'cashFlow'}
            chartInfos={[
              {
                bars: [
                  {
                    label: 'Cash from Operating Activities',
                    stack: 'Cash from Operating Activities',
                    color: [0, 110, 30]
                  },
                  {
                    label: 'Cash from Investing Activities',
                    stack: 'Cash from Investing Activities',
                    color: [0, 222, 41]
                  },
                  {
                    label: 'Cash from Financing Activities',
                    stack: 'Cash from Financing Activities',
                    color: [156, 255, 174]
                  },
                  {
                    label: 'Free Cash Flow',
                    stack: 'Free Cash Flow',
                    color: [0, 0, 0]
                  }
                ]
              },
            ]}
          />
        </Tab>

        <Tab eventKey="ratios" title="Ratios">
          <Ratios
            ticker={profile.ticker}
            ratios={ratios}
          />
        </Tab>

        <Tab eventKey="news" title="News">
          <News
            ticker={profile.ticker}
            isActive={key === 'news'}
          />
        </Tab>

        <Tab eventKey="sharesAggregated" title="Shares Outstanding">
          <SharesAggregated
            ticker={profile.ticker}
            simfinId={simfinId}
            isActive={key === 'sharesAggregated'}
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
