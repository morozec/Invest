import React, { Fragment } from 'react';
import { Table, Button } from 'react-bootstrap';
import { getBillions, getDateStringFromUnixTime } from '../../helpers';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import { Bar, Line } from 'react-chartjs-2';

export function Summary(props) {

    const { ticker, profile, recommendations, priceTargets, upgradeDowngrade,
        comparingCompanies, addComparingCompany, removeComparingCompany } = props;

    const handleCompareClick = () => {
        addComparingCompany({
            profile: profile,
            recommendations: recommendations,
            priceTargets: priceTargets
        });
    }

    const handleRemoveFromComparingClick = () => {
        removeComparingCompany(profile.symbol);
    }

    let content = (
        <Fragment>
            <div className='companyHeader mb-2'>
                <div className='companyName'>
                    <h1>{`${profile.longName} (${ticker}) `}
                        {comparingCompanies.some(c => c.profile.symbol === profile.symbol)
                            ? <Button variant='outline-danger' onClick={handleRemoveFromComparingClick}>Delete from comparison</Button>
                            : <Button variant='outline-success' onClick={handleCompareClick}>Compare</Button>}

                    </h1>
                </div>

                <div className='companyUrl'>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a>
                </div>

                <div className='companyLogo'>
                    <img src={profile.logo_url} alt={`${profile.logo_url} logo`} />
                </div>
            </div>



            <div className='companyInfo'>
                <div className='mainRatiosContainer'>
                    <Table bordered hover striped variant='dark' className='table-sm'>
                        <tbody>
                            <tr>
                                <td>Previous Close</td>
                                <td>{profile.previousClose}</td>
                            </tr>
                            <tr>
                                <td>Open</td>
                                <td>{profile.open}</td>
                            </tr>
                            <tr>
                                <td>Bid</td>
                                <td>{`${profile.bid} x ${profile.bidSize}`}</td>
                            </tr>
                            <tr>
                                <td>Ask</td>
                                <td>{`${profile.ask} x ${profile.askSize}`}</td>
                            </tr>
                            <tr>
                                <td>Day's Range</td>
                                <td>{`${profile.dayLow} - ${profile.dayHigh}`}</td>
                            </tr>
                            <tr>
                                <td>52 Week Change</td>
                                <td>{profile['52WeekChange']}</td>
                            </tr>
                            <tr>
                                <td>Volume</td>
                                <td>{profile.volume}</td>
                            </tr>
                            <tr>
                                <td>Avg. Volume</td>
                                <td>{profile.averageVolume}</td>
                            </tr>
                        </tbody>
                    </Table>

                    <Table bordered hover striped variant='dark' className='table-sm'>
                        <tbody>
                            <tr>
                                <td>Market Cap</td>
                                <td>{profile.marketCap}</td>
                            </tr>
                            <tr>
                                <td>Beta (5Y Monthly)</td>
                                <td>{profile.beta}</td>
                            </tr>
                            <tr>
                                <td>PE Ratio (TTM)</td>
                                <td>{profile.trailingPE}</td>
                            </tr>
                            <tr>
                                <td>EPS (TTM)</td>
                                <td>{profile.trailingEps}</td>
                            </tr>
                            <tr>
                                <td>Earnings Date</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td>{`Forward Dividend & Yield`}</td>
                                <td>{`${profile.dividendRate} (${profile.dividendYield * 100}%)`}</td>
                            </tr>
                            <tr>
                                <td>Ex-Dividend Date</td>
                                <td>{getDateStringFromUnixTime(profile.exDividendDate)}</td>
                            </tr>
                            <tr>
                                <td>1y Target Est</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>

                <div className='tradingViewContainer'>
                    <TradingViewWidget
                        symbol={`${ticker}`}
                        theme={Themes.LIGHT}
                        locale="en"
                        autosize
                    />
                </div>

                {upgradeDowngrade.length > 0 &&

                    <Table bordered hover variant='dark' className='table-sm upgradeDowngradeContainer'>
                        <caption>Upgrade/Downgrade</caption>
                        <thead>
                            <tr>
                                <th>Grade</th>
                                <th>Company</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upgradeDowngrade.map((ud, i) =>
                                <tr className={ud.action} key={i}>
                                    <td>{ud.fromGrade ? `${ud.fromGrade} → ${ud.toGrade}` : ud.toGrade}</td>
                                    <td>{ud.company}</td>
                                    <td>{getDateStringFromUnixTime(ud.gradeTime)}</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                }
                {recommendations.length > 0 &&
                    <div className='recommendationsContainer'>
                        <Bar
                            data={{
                                labels: recommendations.map(r => r.period),
                                datasets: [
                                    {
                                        label: 'Strong Sell',
                                        backgroundColor: `rgba(255, 0, 0, 1)`,
                                        borderWidth: 1,
                                        hoverBackgroundColor: `rgba(255, 0, 0, 0.6)`,
                                        hoverBorderColor: `rgba(255, 150, 150, 0.6)`,
                                        data: recommendations.map(rec => rec.strongSell),
                                        stack: 'recommendations'
                                    },

                                    {
                                        label: 'Sell',
                                        backgroundColor: `rgba(255, 150, 150, 1)`,
                                        borderWidth: 1,
                                        hoverBackgroundColor: `rgba(255, 150, 150, 0.6)`,
                                        hoverBorderColor: `rgba(255, 150, 150, 0.6)`,
                                        data: recommendations.map(rec => rec.sell),
                                        stack: 'recommendations'
                                    },

                                    {
                                        label: 'Hold',
                                        backgroundColor: `rgba(255, 255, 0, 1)`,
                                        borderWidth: 1,
                                        hoverBackgroundColor: `rgba(255, 255, 0, 0.6)`,
                                        hoverBorderColor: `rgba(255, 255, 0, 0.6)`,
                                        data: recommendations.map(rec => rec.hold),
                                        stack: 'recommendations'
                                    },

                                    {
                                        label: 'Buy',
                                        backgroundColor: `rgba(0, 222, 41, 1)`,
                                        borderWidth: 1,
                                        hoverBackgroundColor: `rgba(0, 222, 41, 0.6)`,
                                        hoverBorderColor: `rgba(0, 222, 41, 0.6)`,
                                        data: recommendations.map(rec => rec.buy),
                                        stack: 'recommendations'
                                    },

                                    {
                                        label: 'Strong Buy',
                                        backgroundColor: `rgba(0, 110, 30, 1)`,
                                        borderWidth: 1,
                                        hoverBackgroundColor: `rgba(0, 110, 30, 0.6)`,
                                        hoverBorderColor: `rgba(0, 110, 30, 0.6)`,
                                        data: recommendations.map(rec => rec.strongBuy),
                                        stack: 'recommendations'
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                title: {
                                    display: true,
                                    text: 'Recommendation Trends'
                                },
                                scales: {
                                    xAxes: [{
                                        stacked: true
                                    }],
                                    yAxes: [{
                                        stacked: true
                                    }]
                                }
                            }} />
                    </div>
                }

                {priceTargets.symbol !== '' &&

                    <div className='priceTragetsContainer'>
                        <Line
                            legend={{ display: false }}
                            data={{
                                labels: ['Current Price', 'Price Targets'],
                                datasets: [
                                    {
                                        label: 'Current',
                                        backgroundColor: `rgba(0, 0, 0, 1)`,
                                        borderWidth: 1,
                                        hoverBackgroundColor: `rgba(0, 0, 0, 0.6)`,
                                        hoverBorderColor: `rgba(0, 0, 0, 0.6)`,
                                        data: [profile.previousClose, null],
                                        pointRadius: 15,
                                        pointHoverRadius: 15,
                                        borderDash: [10, 5],
                                        fill: false,

                                    },
                                    {
                                        label: 'Low',
                                        backgroundColor: `rgba(255, 0, 0, 1)`,
                                        borderWidth: 1,
                                        hoverBackgroundColor: `rgba(255, 0, 0, 0.6)`,
                                        hoverBorderColor: `rgba(255, 0, 0, 0.6)`,
                                        data: [null, priceTargets.targetLow],
                                        pointRadius: 15,
                                        pointHoverRadius: 15,
                                        borderDash: [10, 5],
                                        fill: false,

                                    },
                                    {
                                        label: 'Mean',
                                        backgroundColor: `rgba(255, 255, 0, 1)`,
                                        borderWidth: 1,
                                        hoverBackgroundColor: `rgba(255, 255, 0, 0.6)`,
                                        hoverBorderColor: `rgba(255, 255, 0, 0.6)`,
                                        data: [null, priceTargets.targetMean],
                                        pointRadius: 15,
                                        pointHoverRadius: 15,
                                        borderDash: [10, 5],
                                        fill: false,
                                    },
                                    {
                                        label: 'High',
                                        backgroundColor: `rgba(0, 222, 41, 1)`,
                                        borderWidth: 1,
                                        hoverBackgroundColor: `rgba(0, 222, 41, 0.6)`,
                                        hoverBorderColor: `rgba(0, 222, 41, 0.6)`,
                                        data: [null, priceTargets.targetHigh],
                                        pointRadius: 15,
                                        pointHoverRadius: 15,
                                        borderDash: [10, 5],
                                        fill: false,
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                title: {
                                    display: true,
                                    text: 'Price Target'
                                },
                            }}
                        />
                    </div>
                }

            </div>

        </Fragment>
    )

    return (
        <div>

            {content}
        </div>
    )
}

