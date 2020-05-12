import React, { Fragment } from 'react';
import { Table } from 'react-bootstrap';
import { getBillions, getDateStringFromUnixTime } from '../../helpers';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import { Bar, Line } from 'react-chartjs-2';

export function Summary(props) {

    const { profile, ratios, recommendations, priceTargets, upgradeDowngrade } = props;

    const getRatioValue = (ratioName, isAbsolute) => {
        let ratio = ratios.filter(r => r.indicatorName === ratioName)[0];
        if (ratio.value === null) return null;
        return isAbsolute ? getBillions(ratio.value) : +ratio.value;
    }


    let dividend = getRatioValue('Dividends per Share', false);
    let dividendYield = null;
    if (dividend !== null) {
        let price = getRatioValue('Last Closing Price', false);
        dividendYield = +((dividend / price) * 100).toFixed(2);
    }

    let content = (
        <Fragment>
            <div className='companyHeader mb-2'>
                <div className='companyName'>
                    <h1>{`${profile.name} (${profile.ticker})`}</h1>
                </div>

                <div className='companyUrl'>
                    <a href={profile.weburl} target="_blank" rel="noopener noreferrer">{profile.weburl}</a>
                </div>

                <div className='companyLogo'>
                    <img src={profile.logo} alt={`${profile.name} logo`} />
                </div>
            </div>



            <div className='companyInfo'>
                <Table bordered hover striped variant='dark' className='mainRatiosContainer'>
                    <tbody>
                        <tr>
                            <td>Market Capitalisation</td>
                            <td>{`${getRatioValue('Market Capitalisation', true)} B`}</td>
                        </tr>
                        <tr>
                            <td>P/E</td>
                            <td>{`${getRatioValue('Price to Earnings Ratio', false)}`}</td>
                        </tr>
                        <tr>
                            <td>P/S</td>
                            <td>{`${getRatioValue('Price to Sales Ratio', false)}`}</td>
                        </tr>
                        <tr>
                            <td>P/B</td>
                            <td>{`${getRatioValue('Price to Book Value', false)}`}</td>
                        </tr>
                        <tr>
                            <td>P/FCF</td>
                            <td>{`${getRatioValue('Price to Free Cash Flow', false)}`}</td>
                        </tr>
                        <tr>
                            <td>Revenue</td>
                            <td>{`${getRatioValue('Revenues', true)}`} B</td>
                        </tr>
                        <tr>
                            <td>EPS</td>
                            <td>{`${getRatioValue('Earnings per Share, Basic', false)}`}</td>
                        </tr>
                        <tr>
                            <td>Dividends per Share (Yield %)</td>
                            <td>{`${dividend} ${dividendYield !== null ? `(${dividendYield}%)` : ''}`}</td>
                        </tr>
                    </tbody>
                </Table>

                <div className='tradingViewContainer'>
                    <TradingViewWidget
                        symbol={`${profile.ticker}`}
                        theme={Themes.LIGHT}
                        locale="en"
                        autosize
                    />
                </div>

                <Table bordered hover variant='dark' className='table-sm upgradeDowngradeContainer'>
                    <caption className='udCaption'>Upgrade/Downgrade</caption>
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

                <div className='recommendationsContainer'>
                    <Bar
                        data={{
                            labels: recommendations.map(r => r.period),
                            datasets: [
                                {
                                    label: 'Strong Sell',
                                    backgroundColor: `rgba(127, 0, 0, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(127, 0, 0, 1)`,
                                    hoverBorderColor: `rgba(127, 0, 0, 1)`,
                                    data: recommendations.map(rec => rec.strongSell),
                                    stack: 'recommendations'
                                },

                                {
                                    label: 'Sell',
                                    backgroundColor: `rgba(255, 0, 0, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(255, 0, 0, 1)`,
                                    hoverBorderColor: `rgba(255, 0, 0, 1)`,
                                    data: recommendations.map(rec => rec.sell),
                                    stack: 'recommendations'
                                },

                                {
                                    label: 'Hold',
                                    backgroundColor: `rgba(255, 255, 0, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(255, 255, 0, 1)`,
                                    hoverBorderColor: `rgba(255, 255, 0, 1)`,
                                    data: recommendations.map(rec => rec.hold),
                                    stack: 'recommendations'
                                },

                                {
                                    label: 'Buy',
                                    backgroundColor: `rgba(0, 255, 0, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(0, 255, 0, 1)`,
                                    hoverBorderColor: `rgba(0, 255, 0, 1)`,
                                    data: recommendations.map(rec => rec.buy),
                                    stack: 'recommendations'
                                },

                                {
                                    label: 'Strong Buy',
                                    backgroundColor: `rgba(0, 127, 0, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(0, 127, 0, 1)`,
                                    hoverBorderColor: `rgba(0, 127, 0, 1)`,
                                    data: recommendations.map(rec => rec.strongBuy),
                                    stack: 'recommendations'
                                }
                            ]
                        }}
                        options={{
                            responsive: true,
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
                <div className='priceTragetsContainer'>
                    <Line
                        legend={{ display: false }}
                        data={{
                            labels: ['Current Price', 'Price Targets'],
                            datasets: [
                                {
                                    label: 'Current',
                                    backgroundColor: `rgba(0, 0, 0, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(0, 0, 0, 1)`,
                                    hoverBorderColor: `rgba(0, 0, 0, 1)`,
                                    data: [100, null],
                                    pointRadius: 15,
                                    pointHoverRadius: 15,
                                    borderDash: [10, 5],
                                    fill: false,

                                },
                                {
                                    label: 'Low',
                                    backgroundColor: `rgba(255, 0, 0, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(255, 0, 0, 1)`,
                                    hoverBorderColor: `rgba(255, 0, 0, 1)`,
                                    data: [null, priceTargets.targetLow],
                                    pointRadius: 15,
                                    pointHoverRadius: 15,
                                    borderDash: [10, 5],
                                    fill: false,

                                },
                                {
                                    label: 'Mean',
                                    backgroundColor: `rgba(255, 255, 0, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(255, 255, 0, 1)`,
                                    hoverBorderColor: `rgba(255, 255, 0, 1)`,
                                    data: [null, priceTargets.targetMean],
                                    pointRadius: 15,
                                    pointHoverRadius: 15,
                                    borderDash: [10, 5],
                                    fill: false,
                                },
                                {
                                    label: 'High',
                                    backgroundColor: `rgba(0, 255, 0, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(0, 255, 0, 1)`,
                                    hoverBorderColor: `rgba(0, 255, 0, 1)`,
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

            </div>

        </Fragment>
    )

    return (
        <div>

            {content}
        </div>
    )
}

