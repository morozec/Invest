import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { StatementData } from './StatementData';

export function StockSimfin() {

  const [key, setKey] = useState('income');

  return (
    <div>
      <Tabs activeKey={key} onSelect = {(k) => setKey(k)}>
        <Tab eventKey="income" title="Income" >
          <StatementData statementType='income' statementTitle='Income' isActive = {key === 'income'}/>
        </Tab>
        <Tab eventKey="balanceSheet" title="Balance Sheet">
          <StatementData statementType='balanceSheet' statementTitle='Balance Sheet' isActive = {key === 'balanceSheet'}/>
        </Tab>
        <Tab eventKey="cashFlow" title="Cash Flow">
          <StatementData statementType='cashFlow' statementTitle='Cash Flow' isActive = {key === 'cashFlow'}/>
        </Tab>
      </Tabs>
    </div>
  )
}

