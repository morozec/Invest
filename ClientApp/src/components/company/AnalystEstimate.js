import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

export function AnalystEstimate(props) {
    const { ticker, isActive } = props;

    const [earnings, setEarnings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isActive) return;
        if (earnings) return;

        setIsLoading(true);

        const getEarnings = async (companySymbol) => {
            const response = await fetch(`api/finnhub/earnings/${companySymbol}`);
            const data = await response.json();
            return data;
        }

        getEarnings(ticker).then(result => {
            console.log(result);
            setEarnings(result);
            setIsLoading(false);
        })

    }, [isActive, earnings, ticker])


    let content;

    if (isLoading) {
        content = <p><em>Loading...</em></p>;
    } else {
        content =
            <div className='content'>
                <Table bordered hover striped variant='light' className='table-sm'>
                    <caption>{ticker} Earnings</caption>
                    <thead>
                        <tr>
                            <th>Release Date</th>
                            <th>Period End</th>
                            <th>Revenue	/ Forecast</th>
                            <th>EPS	/ Forecast</th>
                        </tr>
                    </thead>
                    <tbody>
                        {earnings.earningsCalendar.map((v, i) => (
                            <tr key={i}>
                                <td>{v.date}</td>
                                <td>-</td>
                                <td>{`${v.revenueActual} / ${v.revenueEstimate}`}</td>
                                <td>{`${(v.epsActual).toFixed(2)} / ${(v.epsEstimate).toFixed(2)}`}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <div className='content-charts'>
                    <Bar
                        data={{
                            labels: earnings.earningsCalendar.map(v => v.date),
                            datasets: [

                                {
                                    label: 'Revenue Estimate',
                                    backgroundColor: `rgba(191, 191, 191, 1)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(191, 191, 191, 0.6)`,
                                    hoverBorderColor: `rgba(191, 191, 191, 0.6)`,
                                    data: earnings.earningsCalendar.map(v => v.revenueEstimate),
                                },

                                {
                                    label: 'Revenue Actual',
                                    backgroundColor: `rgba(74, 74, 74, 1)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(74, 74, 74, 0.6)`,
                                    hoverBorderColor: `rgba(74, 74, 74, 0.6)`,
                                    data: earnings.earningsCalendar.map(v => v.revenueActual),
                                },

                                
                            ]
                        }}
                        options={{
                            scales:{
                                yAxes:[
                                    {
                                        type:'bar',
                                        display: true,
                                        position: 'left',
                                        id:'revenueAxis'
                                    }
                                ]
                            }
                        }}
                    />
                </div>

            </div>

    }

    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} Analyst Estimate</h1>
            </div>
            {content}
        </div>
    )
}