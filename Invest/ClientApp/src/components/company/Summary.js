import React, { Fragment, useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { getBillions, getDateStringFromUnixTime } from '../../helpers';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import { Bar, Line } from 'react-chartjs-2';

export function Summary(props) {
    const [logo, setLogo] = useState(null);
    const [isInWatchList, setIsInWatchList] = useState(false);
    const [isInWatchListChecking, setIsInWatchListChecking] = useState(true);

    const { ticker, profile, recommendations,
        comparingCompanies, addComparingCompany, removeComparingCompany, userData } = props;

    useEffect(() => {
        const getLogo = () => {
            let webUrl = profile.assetProfile.website;
            const startRegexp = /^((https?:\/\/)?www\.)/;
            let shortWebUrl = webUrl.replace(startRegexp, "");

            const endRegexp = /(\/)$/;
            shortWebUrl = shortWebUrl.replace(endRegexp, "");
            let logoUrl = `https://logo.clearbit.com/${shortWebUrl}`;
            return logoUrl;
        }

        let logo = getLogo();
        setLogo(logo);
    }, [profile])

   
    useEffect(() => {
        if (!userData) return;

        setIsInWatchListChecking(true);
        const checkIsInWatchList = async () => {
            setIsInWatchListChecking(true);
            let response = await fetch(`api/account/isInWatchList/${profile.quoteType.symbol}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + userData.token
                },
            });
            let result = await response.json();
            return result;
        }

        checkIsInWatchList().then(result => {
            setIsInWatchList(result);
            setIsInWatchListChecking(false);
        })
    }, [profile, userData])

    const handleCompareClick = () => {
        addComparingCompany({
            profile: profile,
            recommendations: recommendations,
        });
    }

    const handleRemoveFromComparingClick = () => {
        removeComparingCompany(profile.quoteType.symbol);
    }

    const handleAddToWatchListClick = () => {
        setIsInWatchListChecking(true);
        fetch('api/account/addToWatchList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userData.token
            },
            body: JSON.stringify({ ticker: profile.quoteType.symbol })
        }).then(response => {
            console.log(response.ok);
            setIsInWatchList(true);
            setIsInWatchListChecking(false);
        });
    }

    const handleDeleteFromWatchListClick = () => {
        setIsInWatchListChecking(true);
        fetch('api/account/deleteFromWatchList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userData.token
            },
            body: JSON.stringify({ ticker: profile.quoteType.symbol })
        }).then(response => {
            console.log(response.ok);
            setIsInWatchList(false);
            setIsInWatchListChecking(false);
        });
    }

    let content = (
        <Fragment>
            <div className='companyHeader mb-2'>
                <div className='companyName'>
                    <h1>{`${profile.quoteType.longName} (${profile.quoteType.symbol}) `}
                        {comparingCompanies.some(c => c.profile.quoteType.symbol === profile.quoteType.symbol)
                            ? <Button variant='outline-danger' onClick={handleRemoveFromComparingClick}>Delete from comparison</Button>
                            : <Button variant='outline-success' onClick={handleCompareClick}>Compare</Button>}
                        {userData && !isInWatchList &&
                            <Button variant='outline-success' onClick={handleAddToWatchListClick} disabled={isInWatchListChecking}>
                                Add to watch list
                            </Button>}
                        {userData && isInWatchList &&
                            <Button variant='outline-danger' onClick={handleDeleteFromWatchListClick} disabled={isInWatchListChecking}>
                                Delete from watch list
                            </Button>}

                    </h1>
                </div>

                <div className='companyUrl'>
                    <a href={profile.assetProfile.website} target="_blank" rel="noopener noreferrer">{profile.assetProfile.website}</a>
                </div>

                <div className='companyLogo'>
                    <img src={logo} alt={`${profile.quoteType.symbol} logo`} />
                </div>
            </div>



            <div className='companyInfo'>
                <div className='mainRatiosContainer'>
                    <Table bordered hover striped variant='dark' className='table-sm'>
                        <tbody>
                            <tr>
                                <td>Previous Close</td>
                                <td>{profile.summaryDetail.previousClose.fmt}</td>
                            </tr>
                            <tr>
                                <td>Open</td>
                                <td>{profile.summaryDetail.open.fmt}</td>
                            </tr>
                            <tr>
                                <td>Bid</td>
                                <td>{`${profile.summaryDetail.bid.fmt} x ${profile.summaryDetail.bidSize.fmt}`}</td>
                            </tr>
                            <tr>
                                <td>Ask</td>
                                <td>{`${profile.summaryDetail.ask.fmt} x ${profile.summaryDetail.askSize.fmt}`}</td>
                            </tr>
                            <tr>
                                <td>Day's Range</td>
                                <td>{`${profile.summaryDetail.dayLow.fmt} - ${profile.summaryDetail.dayHigh.fmt}`}</td>
                            </tr>
                            <tr>
                                <td>52 Week Range</td>
                                <td>{`${profile.summaryDetail.fiftyTwoWeekLow.fmt} - ${profile.summaryDetail.fiftyTwoWeekHigh.fmt}`}</td>
                            </tr>
                            <tr>
                                <td>Volume</td>
                                <td>{profile.summaryDetail.volume.fmt}</td>
                            </tr>
                            <tr>
                                <td>Avg. Volume</td>
                                <td>{profile.summaryDetail.averageVolume.fmt}</td>
                            </tr>
                        </tbody>
                    </Table>

                    <Table bordered hover striped variant='dark' className='table-sm'>
                        <tbody>
                            <tr>
                                <td>Market Cap</td>
                                <td>{profile.summaryDetail.marketCap.fmt}</td>
                            </tr>
                            <tr>
                                <td>Beta (5Y Monthly)</td>
                                <td>{profile.summaryDetail.beta.fmt}</td>
                            </tr>
                            <tr>
                                <td>PE Ratio (TTM)</td>
                                <td>{profile.summaryDetail.trailingPE.fmt}</td>
                            </tr>
                            <tr>
                                <td>EPS (TTM)</td>
                                <td>{profile.defaultKeyStatistics.trailingEps.fmt}</td>
                            </tr>
                            <tr>
                                <td>Earnings Date</td>
                                <td>{profile.earnings.earningsChart.earningsDate[0].fmt}</td>
                            </tr>
                            <tr>
                                <td>{`Forward Dividend & Yield`}</td>
                                <td>{`${profile.summaryDetail.dividendRate.fmt} (${profile.summaryDetail.dividendYield.fmt})`}</td>
                            </tr>
                            <tr>
                                <td>Ex-Dividend Date</td>
                                <td>{profile.summaryDetail.exDividendDate.fmt}</td>
                            </tr>
                            <tr>
                                <td>1y Target Est</td>
                                <td>{profile.financialData.targetMeanPrice.fmt}</td>
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

                {profile.upgradeDowngradeHistory &&
                    <div className='upgradeDowngradeContainer'>
                        <Table bordered hover variant='dark' className='table-sm'>
                            <caption>{'Upgrades & Downgrades'}</caption>
                            <tbody>
                                {profile.upgradeDowngradeHistory.history.slice(0, 10).map((ud, i) =>
                                    <tr className={ud.action} key={i}>
                                        <td>{ud.action}</td>
                                        <td>{ud.fromGrade ? `${ud.fromGrade} → ${ud.toGrade}` : ud.toGrade}</td>
                                        <td>{ud.firm}</td>
                                        <td>{getDateStringFromUnixTime(ud.epochGradeDate)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
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


                <div className='priceTragetsContainer'>
                    <Line
                        legend={{
                            labels: {
                                usePointStyle: true
                            }
                        }}
                        data={{
                            labels: ['Current Price', 'Price Targets'],
                            datasets: [
                                {
                                    label: 'Current',
                                    pointBackgroundColor: `rgba(0, 0, 0, 1)`,
                                    borderWidth: 1,
                                    pointHoverBackgroundColor: `rgba(0, 0, 0, 0.6)`,
                                    pointHoverBorderColor: `rgba(0, 0, 0, 0.6)`,
                                    data: [profile.financialData.currentPrice.raw, null],//TODO: rub
                                    pointRadius: 15,
                                    pointHoverRadius: 15,
                                    fill: false,
                                    showLine: false
                                },
                                {
                                    label: 'Low',
                                    pointBackgroundColor: `rgba(255, 0, 0, 1)`,
                                    borderWidth: 1,
                                    pointHoverBackgroundColor: `rgba(255, 0, 0, 0.6)`,
                                    pointHoverBorderColor: `rgba(255, 0, 0, 0.6)`,
                                    data: [null, profile.financialData.targetLowPrice.raw],
                                    pointRadius: 15,
                                    pointHoverRadius: 15,
                                    fill: false,
                                    showLine: false
                                },
                                {
                                    label: 'Mean',
                                    pointBackgroundColor: `rgba(255, 255, 0, 1)`,
                                    borderWidth: 1,
                                    pointHoverBackgroundColor: `rgba(255, 255, 0, 0.6)`,
                                    pointHoverBorderColor: `rgba(255, 255, 0, 0.6)`,
                                    data: [null, profile.financialData.targetMeanPrice.raw],
                                    pointRadius: 15,
                                    pointHoverRadius: 15,
                                    fill: false,
                                    showLine: false
                                },
                                {
                                    label: 'High',
                                    pointBackgroundColor: `rgba(0, 222, 41, 1)`,
                                    borderWidth: 1,
                                    pointHoverBackgroundColor: `rgba(0, 222, 41, 0.6)`,
                                    pointHoverBorderColor: `rgba(0, 222, 41, 0.6)`,
                                    data: [null, profile.financialData.targetHighPrice.raw],
                                    pointRadius: 15,
                                    pointHoverRadius: 15,
                                    fill: false,
                                    showLine: false
                                }
                            ]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            title: {
                                display: true,
                                text: `Analyst Price Target (${profile.financialData.numberOfAnalystOpinions.fmt})`
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

