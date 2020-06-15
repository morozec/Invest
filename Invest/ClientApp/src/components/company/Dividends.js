import React, { useState, useEffect } from 'react'
import { getDateStringFromUnixTime } from '../../helpers';
import { Table } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

export function Dividends(props) {
    const { ticker, isActive } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [dividends, setDividends] = useState(null);

    useEffect(() => {
        const getData = async () => {
            if (!isActive) return false;
            console.log('dividends update')
            const response = await fetch(`api/YahooFinance/dividends/${ticker}`);
            if (response.status === 204) {
                setDividends(null);
            } else {
                const dividends = await response.json();
                setDividends(dividends);
            }
            setIsLoading(false);
        }
        getData(ticker);
    }, [ticker, isActive])

    const keys = dividends === null ? null : Object.keys(dividends)
    let content = isLoading
        ? <p><em>Loading...</em></p>
        : dividends === null
            ? <p>No dividends history</p>
            : <div className='dividendsContainer'>
                <div>
                    <Table className='table-sm' bordered hover variant='light'>
                        <thead>
                            <tr>
                                <th className='centered'>Date</th>
                                <th className='centered'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map(key =>
                                <tr key={key}>
                                    <td className='centered'>{getDateStringFromUnixTime(dividends[key].date)}</td>
                                    <td className='centered'>{dividends[key].amount}</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>

                <div>
                    <Bar
                        data={{
                            labels:keys.map(key => getDateStringFromUnixTime(dividends[key].date)),
                            //labels: [new Date(2000, 1, 1), new Date(2005, 1, 1), new Date(2008, 1, 1), new Date(2010, 1, 1), new Date(2020, 1, 1)],
                            datasets: [
                                {
                                    label: 'Dividend amount',
                                    backgroundColor: `rgba(138, 167, 255, 1)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(138, 167, 255, 0.6)`,
                                    hoverBorderColor: `rgba(138, 167, 255, 0.6)`,
                                    data: keys.map(key => dividends[key].amount),
                                    barPercentage: 0.5,
                                    barThickness:6,
                                    maxBarThickness:8
                                }
                            ],
                            
                        }}
                        options = {{
                            scales: {
                                xAxes: [{
                                    type: 'time',
                                    distribution: 'linear',
                                    
                                }]
                            }
                        }}
                    />
                </div>


            </div>

    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} Dividends</h1>
            </div>
            {content}
        </div>
    )
}