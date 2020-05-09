import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';

export function Stock() {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const response = await fetch('api/yahoofinance/balanceSheet');
      const bs = await response.json();
      setBalanceSheet(bs);
      setIsLoading(false);
    })();
  }, [])



  let content;
  if (isLoading) {
    content = <p><em>Loading...</em></p>
  } else {
    const balanceSheetStatements = balanceSheet.balanceSheetHistory.balanceSheetStatements;
    if (!balanceSheetStatements || balanceSheetStatements.length === 0) {
      content = null;
    } else {
      const balanceProperties = Object.keys(balanceSheetStatements[0]).filter(p => p !== 'endDate' && p !== 'maxAge');
      content = (
        <Table striped bordered hover variant="light">
          <thead>
            <tr>
              <th>Breakdown</th>
              {balanceSheetStatements.map((bss, i) => <th key={i}>{bss.endDate.fmt}</th>)}
            </tr>
          </thead>
          <tbody>
            {balanceProperties.map((prop, j) => {
              let propName = prop.replace(/([A-Z])/g, ' $1');
              propName = propName[0].toUpperCase() + propName.slice(1);
              return (
                <tr key={j}>
                  <td>{propName}</td>
                  {balanceSheetStatements.map((bss, i) => <td key={i}>{bss[prop].fmt}</td>)}
                </tr>
              )
            })}
          </tbody>
        </Table>
      )
    }
  }

  return (
    <div>
      <h1>Balance sheet</h1>
      {content}
    </div>
  )
}

