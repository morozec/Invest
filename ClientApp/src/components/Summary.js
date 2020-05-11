import React, { useState, useEffect, Fragment } from 'react';
import { Table } from 'react-bootstrap';
import { getBillions } from '../helpers';

export function Summary(props) {
    const [profile, setProfile] = useState(null);
    const [ratios, setRatios] = useState(null);

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

        let promises = [getProfile(fbSymbol), getRatios(fbId)];
        Promise.all(promises).then(result => {
            setProfile(result[0]);
            setRatios(result[1]);
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

                <Table bordered hover striped variant='light'>
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
            </Fragment>
        )
        // let tableRows = ratios.filter(r => r.value !== null).map(r =>
        //     <tr key={r.indicatorId}>
        //         <td>{r.indicatorName}</td>
        //         <td>{r.value}</td>
        //     </tr>)

        // content = (
        //     <Table className='content-table' bordered hover variant='light'>
        //         <tbody>
        //             {tableRows}
        //         </tbody>
        //     </Table>
        // )
    }

    return (
        <div>

            {content}
        </div>
    )
}

