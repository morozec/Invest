import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

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



  let content, data;
  if (isLoading) {
    content = <p><em>Loading...</em></p>;
    data = {};
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
      );

      const dates = balanceSheetStatements.map(bss => bss.endDate.fmt).reverse();
      const longTermDebts = balanceSheetStatements.map(bss => bss.longTermDebt.raw).reverse();
      const cashs = balanceSheetStatements.map(bss => bss.cash.raw).reverse();

      data = {
        labels: dates,
        datasets: [
          {
            label: 'Long Term Debt',
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: longTermDebts
          },

          {
            label: 'Cash',
            backgroundColor: 'rgba(99,255,132,0.2)',
            borderColor: 'rgba(99,255,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(99,255,132,0.4)',
            hoverBorderColor: 'rgba(99,255,132,1)',
            data: cashs
          },
        ]
      };
    }
  }



  return (
    <div>
      <h1>Balance sheet</h1>
      {content}
      <Bar data={data} />
    </div>
  )
}

