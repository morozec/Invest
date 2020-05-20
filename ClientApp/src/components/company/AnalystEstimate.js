import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

export function AnalystEstimate(props) {
    const { ticker, isActive } = props;
    console.log(props);

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

        const getRevenueEstamates = async (companySymbol) => {
            const response = await fetch(`api/finnhub/revenueEstimates/${companySymbol}`);
            const data = await response.json();
            return data;
        }

        const getEpsEstamates = async (companySymbol) => {
            const response = await fetch(`api/finnhub/epsEstimates/${companySymbol}`);
            const data = await response.json();
            return data;
        }

        console.log('aEst')

        const promises = [getEarnings(ticker), getRevenueEstamates(ticker), getEpsEstamates(ticker)];
        Promise.all(promises).then(result => {
            console.log(result);
            const lastDate = result[0].earningsCalendar[0].date;

            const estEarnings = result[1].data.filter(rev => rev.period > lastDate).map(rev => {
                let estEps = result[2].data.filter(eps => eps.period === rev.period)[0];
                return {
                    date: rev.period,
                    revenueActual: null,
                    revenueEstimate: rev.revenueAvg,
                    epsActual: null,
                    epsEstimate: estEps !== undefined ? estEps.epsAvg : null
                }
            });
            const fullEarnings = [...estEarnings, ...result[0].earningsCalendar]
            setEarnings(fullEarnings);
            setIsLoading(false);
        })


    }, [isActive, earnings, ticker])


    let content;

    if (isLoading) {
        content = <p><em>Loading...</em></p>;
    } else {
        const reversedEarnings = [...earnings].reverse();
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
                        {earnings.map((v, i) => (
                            <tr key={i}>
                                <td>{v.date}</td>
                                <td>-</td>
                                <td>{`${v.revenueActual !== null ? v.revenueActual : '-'} / ${v.revenueEstimate !== null ? v.revenueEstimate : '-'}`}</td>
                                <td>{`${v.epsActual !== null ? (v.epsActual).toFixed(2) : '-'} / ${v.epsEstimate !== null ? (v.epsEstimate).toFixed(2) : '-'}`}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <div className='content-charts'>
                    <Bar
                        data={{
                            labels: reversedEarnings.map(v => v.date),
                            datasets: [
                                {
                                    label: 'EPS Actual',
                                    backgroundColor: `rgba(0, 110, 30, 1)`,
                                    borderColor: `rgba(0, 110, 30, 1)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(0, 110, 30, 0.6)`,
                                    hoverBorderColor: `rgba(0, 110, 30, 0.6)`,
                                    data: reversedEarnings.map(v => v.epsActual),
                                    yAxisID: 'epsAxis',
                                    type: 'line',
                                    pointRadius: 10,
                                    pointHoverRadius: 10,
                                    fill: false,
                                    showLine: false,
                                },
                                {
                                    label: 'EPS Estimate',
                                    backgroundColor: `rgba(156, 255, 174, 1)`,
                                    borderColor: `rgba(156, 255, 174, 1)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(156, 255, 174, 0.6)`,
                                    hoverBorderColor: `rgba(156, 255, 174, 0.6)`,
                                    data: reversedEarnings.map(v => v.epsEstimate),
                                    yAxisID: 'epsAxis',
                                    type: 'line',
                                    pointRadius: 10,
                                    pointHoverRadius: 10,
                                    fill: false,
                                    showLine: false,
                                },


                                {
                                    label: 'Revenue Estimate',
                                    backgroundColor: `rgba(191, 191, 191, 1)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(191, 191, 191, 0.6)`,
                                    hoverBorderColor: `rgba(191, 191, 191, 0.6)`,
                                    data: reversedEarnings.map(v => v.revenueEstimate),
                                    yAxisID: 'revenueAxis'
                                },
                                {
                                    label: 'Revenue Actual',
                                    backgroundColor: `rgba(74, 74, 74, 1)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(74, 74, 74, 0.6)`,
                                    hoverBorderColor: `rgba(74, 74, 74, 0.6)`,
                                    data: reversedEarnings.map(v => v.revenueActual),
                                    revenueAxis: 'revenueAxis',
                                },



                            ]
                        }}
                        options={{
                            scales: {
                                yAxes: [
                                    {
                                        display: true,
                                        position: 'left',
                                        id: 'revenueAxis',
                                        gridLines: {
                                            display: true
                                        },
                                        labels: {
                                            show: true,
                                        },
                                        ticks: {
                                            beginAtZero: true,
                                        },

                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Revenue'
                                        }
                                    },
                                    {
                                        display: true,
                                        position: 'right',
                                        id: 'epsAxis',
                                        gridLines: {
                                            display: false
                                        },
                                        labels: {
                                            show: true
                                        },
                                        ticks: {
                                            beginAtZero: true,
                                        },

                                        scaleLabel: {
                                            display: true,
                                            labelString: 'EPS'
                                        }
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