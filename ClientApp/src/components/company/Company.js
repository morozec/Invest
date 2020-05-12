import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { StatementData } from './StatementData';
import { Ratios } from './Ratios';
import { Summary } from './Summary';
import { News } from './News';

export function StockSimfin() {

  const [key, setKey] = useState('summary');

  return (
    <div>
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className='mb-2'>
        <Tab eventKey="summary" title="Summary">
          <Summary
            isActive={key === 'summary'}
          />
        </Tab>

        <Tab eventKey="income" title="Income" >
          <StatementData
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
                      label: 'Net Income',
                      stack: 'netIncome',
                      color: [99, 255, 132]
                    }
                  ]
                }
              ]
            }
          />
        </Tab>
        <Tab eventKey="balanceSheet" title="Balance Sheet">
          <StatementData
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
                      color: [43, 179, 16]
                    },
                    {
                      label: 'Total Liabilities',
                      stack: 'assets',
                      color: [214, 214, 19]
                    }
                  ]
                },

                {
                  bars: [
                    {
                      label: 'Cash, Cash Equivalents & Short Term Investments',
                      stack: 'cash',
                      color: [43, 179, 16]
                    },
                    {
                      label: 'Short Term Debt',
                      stack: 'debt',
                      color: [200, 0, 0]
                    },
                    {
                      label: 'Long Term Debt',
                      stack: 'debt',
                      color: [189, 82, 0]
                    }
                  ]
                },
              ]
            }
          />
        </Tab>
        <Tab eventKey="cashFlow" title="Cash Flow">
          <StatementData
            statementType='cashFlow'
            statementTitle='Cash Flow'
            isActive={key === 'cashFlow'}
            chartInfos={[
              {
                bars: [
                  {
                    label: 'Cash from Operating Activities',
                    stack: 'Cash from Operating Activities',
                    color: [0, 255, 17]
                  },
                  {
                    label: 'Cash from Investing Activities',
                    stack: 'Cash from Investing Activities',
                    color: [183, 255, 0]
                  },
                  {
                    label: 'Cash from Financing Activities',
                    stack: 'Cash from Financing Activities',
                    color: [0, 255, 217]
                  }
                ]
              },
            ]}
          />
        </Tab>

        <Tab eventKey="ratios" title="Ratios">
          <Ratios
            isActive={key === 'ratios'}
          />
        </Tab>

        <Tab eventKey="news" title="News">
          <News
            isActive={key === 'news'}
          />
        </Tab>
      </Tabs>
    </div>
  )
}

