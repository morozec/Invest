import React, { useState, useEffect, Fragment } from 'react';
import { Table } from 'react-bootstrap';
import { getBillions } from '../../helpers';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import { Bar } from 'react-chartjs-2';

export function Summary(props) {
    const [profile, setProfile] = useState(null);
    const [ratios, setRatios] = useState(null);
    const [recommendations, setRecommendations] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const { isActive } = props;


    useEffect(() => {
        if (!isActive) return;
        if (profile) return;

        const ibmSymbol = 'ibm';
        const ibmId = 69543;

        const fbSymbol = 'fb';
        const fbId = 121021;
        setIsLoading(true);

        const getProfile = async (companySymbol) => {
            const response = await fetch(`api/finnhub/profile/${companySymbol}`);
            const profile = await response.json();
            return profile;
        }

        const getRatios = async (companyId) => {
            const response = await fetch(`api/simfin/ratios/${companyId}`);
            const ratios = await response.json();
            return ratios;
        }

        const getRecommendations = async (companySymbol) => {
            const response = await fetch(`api/finnhub/recommendations/${companySymbol}`);
            const recommendations = await response.json();
            return recommendations;
        }


        let promises = [getProfile(fbSymbol), getRatios(fbId), getRecommendations(fbSymbol)];
        Promise.all(promises).then(result => {
            setProfile(result[0]);
            setRatios(result[1]);
            setRecommendations(result[2].reverse());
            setIsLoading(false);
            console.log(result);
        })

    }, [isActive, profile])

    const getRatioValue = (ratioName, isAbsolute) => {
        let ratio = ratios.filter(r => r.indicatorName === ratioName)[0];
        if (ratio.value === null) return null;
        return isAbsolute ? getBillions(ratio.value) : +ratio.value;
    }


    let content;

    if (isLoading || !profile) {
        content = <p><em>Loading...</em></p>;
    } else {
        let dividend = getRatioValue('Dividends per Share', false);
        let dividendYield = null;
        if (dividend !== null) {
            let price = getRatioValue('Last Closing Price', false);
            dividendYield = +((dividend / price) * 100).toFixed(2);
        }


        let dataSet = [];
        dataSet.push({
            label: 'Strong Sell',
            backgroundColor: `rgba(127, 0, 0, 0.6)`,
            borderWidth: 1,
            hoverBackgroundColor: `rgba(127, 0, 0, 1)`,
            hoverBorderColor: `rgba(127, 0, 0, 1)`,
            data: recommendations.map(rec => rec.strongSell),
            stack: 'recommendations'
        });

        dataSet.push({
            label: 'Sell',
            backgroundColor: `rgba(255, 0, 0, 0.6)`,
            borderWidth: 1,
            hoverBackgroundColor: `rgba(255, 0, 0, 1)`,
            hoverBorderColor: `rgba(255, 0, 0, 1)`,
            data: recommendations.map(rec => rec.sell),
            stack: 'recommendations'
        });

        dataSet.push({
            label: 'Hold',
            backgroundColor: `rgba(255, 255, 0, 0.6)`,
            borderWidth: 1,
            hoverBackgroundColor: `rgba(255, 255, 0, 1)`,
            hoverBorderColor: `rgba(255, 255, 0, 1)`,
            data: recommendations.map(rec => rec.hold),
            stack: 'recommendations'
        });

        dataSet.push({
            label: 'Buy',
            backgroundColor: `rgba(0, 255, 0, 0.6)`,
            borderWidth: 1,
            hoverBackgroundColor: `rgba(0, 255, 0, 1)`,
            hoverBorderColor: `rgba(0, 255, 0, 1)`,
            data: recommendations.map(rec => rec.buy),
            stack: 'recommendations'
        });
        
        dataSet.push({
            label: 'Strong Buy',
            backgroundColor: `rgba(0, 127, 0, 0.6)`,
            borderWidth: 1,
            hoverBackgroundColor: `rgba(0, 127, 0, 1)`,
            hoverBorderColor: `rgba(0, 127, 0, 1)`,
            data: recommendations.map(rec => rec.strongBuy),
            stack: 'recommendations'
        });

        let recommendationsData = {
            labels: recommendations.map(r => r.period),
            datasets: dataSet
        };


        content = (
            <Fragment>
                <div className='companyHeader mb-2'>
                    <div className='companyName'>
                        <h1>{`${profile.name} (${profile.ticker})`}</h1>
                    </div>

                    <div className='companyUrl'>
                        <a href={profile.weburl} target="_blank">{profile.weburl}</a>
                    </div>

                    <div className='companyLogo'>
                        <img src={profile.logo} alt={`${profile.name} logo`} />
                    </div>
                </div>


                <Table bordered hover striped variant='light' className='mr-2'>
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


                <TradingViewWidget
                    symbol="NASDAQ:FB"
                    theme={Themes.LIGHT}
                    locale="en"
                />


                <Bar
                    data={recommendationsData}
                    options={{
                        responsive: true,
                        scales: {
                            xAxes: [{
                                stacked: true
                            }],
                            yAxes: [{
                                stacked: true
                            }]
                        }
                    }} />



            </Fragment>
        )
    }

    return (
        <div>

            {content}
        </div>
    )
}

