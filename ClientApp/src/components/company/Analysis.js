import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';

export function Analysis(props) {
    const { isActive, ticker } = props;
    const [earningsContainer, setEarningsContainer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isActive) return;
        const getData = async () => {
            const response = await fetch(`api/YahooFinance/earnings/${ticker}`);
            if (response.status === 204) {
                setEarningsContainer(null);
            } else {
                const data = await response.json();
                console.log(data)
                setEarningsContainer(data);
            }
            setIsLoading(false);
        }

        getData();
    }, [isActive, ticker])

    let earningsTrend = isLoading ? null : earningsContainer.earningsTrend.trend.slice(0, 4);
    let content = isLoading
        ? <p><em>Loading...</em></p>
        : earningsContainer === null
            ? <p>No analysis data</p>
            :
            <div>
                <div>
                    <Table className='table-sm' bordered hover variant='light'>
                        <caption>Earnings Estimate</caption>
                        <thead>
                            <tr>
                                <th></th>
                                <th className='centered'>{`Current Qtr. (${earningsTrend[0].endDate})`}</th>
                                <th className='centered'>{`Next Qtr. (${earningsTrend[1].endDate})`}</th>
                                <th className='centered'>{`Current Year (${earningsTrend[2].endDate})`}</th>
                                <th className='centered'>{`Next Year (${earningsTrend[3].endDate})`}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>No. of Analysts</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.earningsEstimate.numberOfAnalysts.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Avg. Estimate</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.earningsEstimate.avg.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Low Estimate</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.earningsEstimate.low.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>High Estimate</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.earningsEstimate.high.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Year Ago EPS</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.earningsEstimate.yearAgoEps.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>EPS Growth (year/est)</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.earningsEstimate.growth.fmt}</td>)}
                            </tr>

                        </tbody>
                    </Table>
                </div>

                <div>
                    <Table className='table-sm' bordered hover variant='light'>
                        <caption>Revenue Estimate</caption>
                        <thead>
                            <tr>
                                <th></th>
                                <th className='centered'>{`Current Qtr. (${earningsTrend[0].endDate})`}</th>
                                <th className='centered'>{`Next Qtr. (${earningsTrend[1].endDate})`}</th>
                                <th className='centered'>{`Current Year (${earningsTrend[2].endDate})`}</th>
                                <th className='centered'>{`Next Year (${earningsTrend[3].endDate})`}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>No. of Analysts</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.revenueEstimate.numberOfAnalysts.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Avg. Estimate</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.revenueEstimate.avg.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Low Estimate</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.revenueEstimate.low.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>High Estimate</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.revenueEstimate.high.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Year Ago Sales</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.revenueEstimate.yearAgoRevenue.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Sales Growth (year/est)</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.revenueEstimate.growth.fmt}</td>)}
                            </tr>

                        </tbody>
                    </Table>
                </div>


                <div>
                    <Table className='table-sm' bordered hover variant='light'>
                        <caption>Earnings History</caption>
                        <thead>
                            <tr>
                                <th></th>
                                {earningsContainer.earningsHistory.history.map((h, i) =>
                                    <th key={i} className='centered'>{h.quarter.fmt}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>EPS Est.</td>
                                {earningsContainer.earningsHistory.history.map((h, i) =>
                                    <td key={i} className='centered'>{h.epsEstimate.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>EPS Actual</td>
                                {earningsContainer.earningsHistory.history.map((h, i) =>
                                    <td key={i} className='centered'>{h.epsActual.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Difference</td>
                                {earningsContainer.earningsHistory.history.map((h, i) =>
                                    <td key={i} className='centered'>{h.epsDifference.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Surprise %</td>
                                {earningsContainer.earningsHistory.history.map((h, i) =>
                                    <td key={i} className='centered'>{h.surprisePercent.fmt}</td>)}
                            </tr>

                        </tbody>
                    </Table>
                </div>

                <div>
                    <Table className='table-sm' bordered hover variant='light'>
                        <caption>EPS Trend</caption>
                        <thead>
                            <tr>
                                <th></th>
                                <th className='centered'>{`Current Qtr. (${earningsTrend[0].endDate})`}</th>
                                <th className='centered'>{`Next Qtr. (${earningsTrend[1].endDate})`}</th>
                                <th className='centered'>{`Current Year (${earningsTrend[2].endDate})`}</th>
                                <th className='centered'>{`Next Year (${earningsTrend[3].endDate})`}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Current Estimate</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.epsTrend.current.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>7 Days Ago</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.epsTrend['7daysAgo'].fmt}</td>)}
                            </tr>
                            <tr>
                                <td>30 Days Ago</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.epsTrend['30daysAgo'].fmt}</td>)}
                            </tr>
                            <tr>
                                <td>60 Days Ago</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.epsTrend['60daysAgo'].fmt}</td>)}
                            </tr>
                            <tr>
                                <td>90 Days Ago</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.epsTrend['90daysAgo'].fmt}</td>)}
                            </tr>

                        </tbody>
                    </Table>
                </div>


                <div>
                    <Table className='table-sm' bordered hover variant='light'>
                        <caption>EPS Revisions</caption>
                        <thead>
                            <tr>
                                <th></th>
                                <th className='centered'>{`Current Qtr. (${earningsTrend[0].endDate})`}</th>
                                <th className='centered'>{`Next Qtr. (${earningsTrend[1].endDate})`}</th>
                                <th className='centered'>{`Current Year (${earningsTrend[2].endDate})`}</th>
                                <th className='centered'>{`Next Year (${earningsTrend[3].endDate})`}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Up Last 7 Days</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.epsRevisions.upLast7days.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Up Last 30 Days</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.epsRevisions.upLast30days.fmt}</td>)}
                            </tr>
                            <tr>
                                <td>Down Last 30 Days</td>
                                {earningsTrend.map((et, i) => <td key={i} className='centered'>{et.epsRevisions.downLast30days.fmt}</td>)}
                            </tr>

                        </tbody>
                    </Table>
                </div>

                <div>
                    <Table className='table-sm' bordered hover variant='light'>
                        <caption>Growth Estimates</caption>
                        <thead>
                            <tr>
                                <th></th>
                                <th className='centered'>Growth</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Current Qtr.</td>
                                <td className='centered'>{earningsContainer.earningsTrend.trend[0].growth.fmt}</td>
                            </tr>
                            <tr>
                                <td>Next Qtr.</td>
                                <td className='centered'>{earningsContainer.earningsTrend.trend[1].growth.fmt}</td>
                            </tr>
                            <tr>
                                <td>Current Year</td>
                                <td className='centered'>{earningsContainer.earningsTrend.trend[2].growth.fmt}</td>
                            </tr>
                            <tr>
                                <td>Next Year</td>
                                <td className='centered'>{earningsContainer.earningsTrend.trend[3].growth.fmt}</td>
                            </tr>
                            <tr>
                                <td>Next 5 Years (per annum)</td>
                                <td className='centered'>{earningsContainer.earningsTrend.trend[4].growth.fmt}</td>
                            </tr>
                            <tr>
                                <td>Past 5 Years (per annum)</td>
                                <td className='centered'>{earningsContainer.earningsTrend.trend[5].growth.fmt}</td>
                            </tr>

                        </tbody>
                    </Table>
                </div>


                <div>
                    <Line
                        data={{
                            labels: [...earningsContainer.earningsHistory.history.map(h => h.quarter.fmt), earningsTrend[0].endDate, earningsTrend[1].endDate],
                            datasets: [
                                {
                                    label: 'EPS Actual',
                                    pointBackgroundColor: `rgba(0, 110, 30, 1)`,
                                    borderWidth: 1,
                                    pointHoverBackgroundColor: `rgba(0, 110, 30, 0.6)`,
                                    pointHoverBorderColor: `rgba(0, 110, 30, 0.6)`,
                                    data: earningsContainer.earningsHistory.history.map(h => h.epsActual.raw),
                                    pointRadius: 15,
                                    pointHoverRadius: 15,
                                    fill:null,
                                    showLine:false,
                                },
                                {
                                    label: 'Consensus EPS',
                                    pointBackgroundColor: `rgba(255, 255, 255, 1)`,
                                    pointBorderColor: `rgba(0, 0, 0, 1)`,
                                    borderWidth: 1,
                                    pointHoverBackgroundColor: `rgba(255, 255, 255, 0.6)`,
                                    pointHoverBorderColor: `rgba(0, 0, 0, 0.6)`,
                                    data: [...earningsContainer.earningsHistory.history.map(h => h.epsEstimate.raw), earningsTrend[0].earningsEstimate.avg.raw, earningsTrend[1].earningsEstimate.avg.raw], 
                                    pointRadius: 15,
                                    pointHoverRadius: 15,
                                    fill:null,
                                    showLine:false,
                                },
                            ],

                        }}    
                        legend={{labels:{
                            usePointStyle:true
                        }}}
                                        
                    />
                </div>


            </div>

    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} Analysis</h1>
            </div>
            {content}
        </div>
    )
}