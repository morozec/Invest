import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { StatementData } from './statement-data/StatementData';
import { Ratios } from './Ratios';
import { Summary } from './Summary';
import { News } from './News';
import { SharesAggregated } from './SharesAggregated'
import { useLocation } from 'react-router-dom';

export function StockSimfin(props) {

  const [key, setKey] = useState('summary');

  const [simfinId, setSimfinId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ratios, setRatios] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [priceTargets, setPriceTargets] = useState(null);
  const [upgradeDowngrade, setUpgradeDowngrade] = useState(null);

  const [sharesAggregatedBasicData, setSharesAggregatedBasicData] = useState(null);
  const [sharesAggregatedDilutedData, setSharesAggregatedDilutedData] = useState(null);

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

    const getSharesAggregated = async (companyId) => {
      const response = await fetch(`api/simfin/sharesAggregated/${companyId}`);
      const data = await response.json();
      return data;
    }

    const handleSharesAggregated = (sharesAggregatedResult) => {
      const saBasicData = sharesAggregatedResult.filter(d => d.figure === 'common-outstanding-basic');
      const saDilutedData = sharesAggregatedResult.filter(d => d.figure === 'common-outstanding-diluted');
      setSharesAggregatedBasicData(saBasicData);
      setSharesAggregatedDilutedData(saDilutedData);
    }

    (async () => {
      let promises = [
        getSimfinId(ticker),
        getProfile(ticker),
        getRecommendations(ticker),
        getPriceTargets(ticker),
        getUpgradeDowngrade(ticker),
      ];

      let result = await Promise.all(promises);

      console.log(result);
      setSimfinId(result[0]);
      setProfile(result[1]);
      setRecommendations(result[2].reverse());
      setPriceTargets(result[3]);
      setUpgradeDowngrade(result[4].slice(0, 10));

      let promises2 = [
        getRatios(result[0]),
        getSharesAggregated(result[0])
      ];
      let result2 = await Promise.all(promises2);
      setRatios(result2[0]);
      handleSharesAggregated(result2[1]);
      setIsLoading(false);
    })();

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

            sharesAggregatedBasicData={sharesAggregatedBasicData}
            sharesAggregatedDilutedData={sharesAggregatedDilutedData}

            chartInfos={
              [
                {
                  bars: [
                    {
                      uid: '1',
                      stack: 'revenue',
                      color: [200, 200, 200]
                    },
                    {
                      uid: '19',
                      stack: 'operatingIncome',
                      color: [0, 110, 30]
                    },
                    {
                      uid: '55',
                      stack: 'netIncome',
                      color: [156, 255, 174]
                    }
                  ],
                  isMillions:true
                },

                // {
                //   bars: [
                //     {
                //       label: 'Diluted EPS',
                //       stack: 'eps',
                //       color: [200, 200, 200]
                //     },
                //   ],
                //   isMillions:false
                // }
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
                      uid: '84',
                      stack: 'assets',
                      color: [74, 74, 74]
                    },
                    {
                      uid: '73',
                      stack: 'assets',
                      color: [191, 191, 191]
                    }
                  ],
                  isMillions:true
                },

                {
                  bars: [
                    {
                      uid: '1',
                      stack: 'cash',
                      color: [0, 222, 41]
                    },
                    {
                      uid: '47',
                      stack: 'debt',
                      color: [255, 0, 0]
                    },
                    {
                      uid: '58',
                      stack: 'debt',
                      color: [255, 150, 150]
                    }
                  ],
                  isMillions:true
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
                    uid: '13',
                    stack: 'Cash from Operating Activities',
                    color: [0, 110, 30]
                  },
                  {
                    uid: '31',
                    stack: 'Cash from Investing Activities',
                    color: [0, 222, 41]
                  },
                  {
                    uid: '43',
                    stack: 'Cash from Financing Activities',
                    color: [156, 255, 174]
                  },
                  {
                    uid: 'fcf',
                    stack: 'Free Cash Flow',
                    color: [0, 0, 0]
                  }
                ],
                isMillions:true
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

            sharesAggregatedBasicData={sharesAggregatedBasicData.filter(d => d.period === 'Q1' || d.period === 'Q2' || d.period === 'Q3' || d.period === 'Q4')}
            sharesAggregatedDilutedData={sharesAggregatedDilutedData.filter(d => d.period === 'Q1' || d.period === 'Q2' || d.period === 'Q3' || d.period === 'Q4')}
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

