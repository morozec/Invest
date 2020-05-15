import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

export function SharesAggregated(props) {
    const { isActive, ticker, simfinId } = props;
    const [isLoading, setIsLoading] = useState(true);

    const [sharesAggregatedBasicData, setSharesAggregatedBasicData] = useState(null);
    const [sharesAggregatedBasicDataChanges, setSharesAggregatedBiasicDataChanges] = useState(null);

    const [sharesAggregatedDilutedData, setSharesAggregatedDilutedData] = useState(null);
    const [sharesAggregatedDilutedDataChanges, setSharesAggregatedDilutedDataChanges] = useState(null);


    useEffect(() => {
        if (!isActive) return;
        if (sharesAggregatedBasicData) return;

        setIsLoading(true);

        const getData = async (companyId) => {
            const response = await fetch(`api/simfin/sharesAggregated/${companyId}`);
            const data = await response.json();
            return data.filter(d => d.period === 'Q1' || d.period === 'Q2' || d.period === 'Q3' || d.period === 'Q4');
        }

        getData(simfinId).then(result => {
            console.log(result);

            const saBasicData = result.filter(d => d.figure === 'common-outstanding-basic');
            const saDilutedData = result.filter(d => d.figure === 'common-outstanding-diluted');
            
            let basicChanges = [0, 0, 0, 0];
            for (let i = 4; i < saBasicData.length; ++i) {
                let change = ((saBasicData[i].value - saBasicData[i - 4].value) / saBasicData[i - 4].value * 100).toFixed(2);
                basicChanges.push(change);
            }

            setSharesAggregatedBasicData(saBasicData);
            setSharesAggregatedBiasicDataChanges(basicChanges);

            let dilutedChanges = [0, 0, 0, 0];
            for (let i = 4; i < saDilutedData.length; ++i) {
                let change = ((saDilutedData[i].value - saDilutedData[i - 4].value) / saDilutedData[i - 4].value * 100).toFixed(2);
                dilutedChanges.push(change);
            }

            setSharesAggregatedDilutedData(saDilutedData);
            setSharesAggregatedDilutedDataChanges(dilutedChanges);

            setIsLoading(false);
        })

    }, [isActive, simfinId, sharesAggregatedBasicData])

    const getBillions = (value) => {
        return (+value / 1e9).toFixed(3);
    }

    let content;

    if (isLoading) {
        content = <p><em>Loading...</em></p>;
    } else {
        content =
            <div className='sharesAggregatedContainer'>
                <div className='sharesAggregatedBasic'>
                    <Bar
                        data={{
                            labels: sharesAggregatedBasicData.map(sa => sa.date),
                            datasets:
                                [{
                                    label: 'Quarterly Shares Outstanding BASIC, B',
                                    backgroundColor: `rgba(0, 0, 255, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(0, 0, 255, 1)`,
                                    hoverBorderColor: `rgba(0, 0, 255, 1)`,
                                    data: sharesAggregatedBasicData.map(sa => getBillions(sa.value)),
                                }]
                        }}
                        options={{
                            responsive: true,
                        }} />
                </div>

                <div className='sharesAggregatedBasicChanges'>
                    <Bar
                        data={{
                            labels: sharesAggregatedBasicData.map(sa => sa.date),
                            datasets:
                                [{
                                    label: 'YoY Quarterly Growth BASIC, %',
                                    backgroundColor: sharesAggregatedBasicDataChanges.map(c =>
                                        c >= 0 ? `rgba(0, 255, 0, 0.6)` : `rgba(255, 0, 0, 0.6)`),
                                    borderWidth: 1,
                                    hoverBackgroundColor: sharesAggregatedBasicDataChanges.map(c =>
                                        c >= 0 ? `rgba(0, 255, 0, 1)` : `rgba(255, 0, 0, 1)`),
                                    hoverBorderColor: sharesAggregatedBasicDataChanges.map(c =>
                                        c >= 0 ? `rgba(0, 255, 0, 1)` : `rgba(255, 0, 0, 1)`),
                                    data: sharesAggregatedBasicDataChanges,
                                }]
                        }}
                        options={{
                            responsive: true,
                        }} />
                </div>


                <div className='sharesAggregatedDilued'>
                    <Bar
                        data={{
                            labels: sharesAggregatedDilutedData.map(sa => sa.date),
                            datasets:
                                [{
                                    label: 'Quarterly Shares Outstanding DILUTED, B',
                                    backgroundColor: `rgba(0, 0, 255, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(0, 0, 255, 1)`,
                                    hoverBorderColor: `rgba(0, 0, 255, 1)`,
                                    data: sharesAggregatedDilutedData.map(sa => getBillions(sa.value)),
                                }]
                        }}
                        options={{
                            responsive: true,
                        }} />
                </div>

                <div className='sharesAggregatedDiluedChanges'>
                    <Bar
                        data={{
                            labels: sharesAggregatedDilutedData.map(sa => sa.date),
                            datasets:
                                [{
                                    label: 'YoY Quarterly Growth DILUTED, %',
                                    backgroundColor: sharesAggregatedDilutedDataChanges.map(c =>
                                        c >= 0 ? `rgba(0, 255, 0, 0.6)` : `rgba(255, 0, 0, 0.6)`),
                                    borderWidth: 1,
                                    hoverBackgroundColor: sharesAggregatedDilutedDataChanges.map(c =>
                                        c >= 0 ? `rgba(0, 255, 0, 1)` : `rgba(255, 0, 0, 1)`),
                                    hoverBorderColor: sharesAggregatedDilutedDataChanges.map(c =>
                                        c >= 0 ? `rgba(0, 255, 0, 1)` : `rgba(255, 0, 0, 1)`),
                                    data: sharesAggregatedDilutedDataChanges,
                                }]
                        }}
                        options={{
                            responsive: true,
                        }} />
                </div>
            </div>
    }


    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} Shares Outstanding</h1>
            </div>
            {content}

        </div >
    )
}

