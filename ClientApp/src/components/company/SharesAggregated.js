import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

export function SharesAggregated(props) {
    const {
        ticker,
        sharesAggregatedBasicData,
        sharesAggregatedDilutedData
    } = props;

    let sharesAggregatedBasicDataChanges = [0, 0, 0, 0];
    for (let i = 4; i < sharesAggregatedBasicData.length; ++i) {
        let change = ((sharesAggregatedBasicData[i].value - sharesAggregatedBasicData[i - 4].value) / sharesAggregatedBasicData[i - 4].value * 100).toFixed(2);
        sharesAggregatedBasicDataChanges.push(change);
    }

    let sharesAggregatedDilutedDataChanges = [0, 0, 0, 0];
    for (let i = 4; i < sharesAggregatedDilutedData.length; ++i) {
        let change = ((sharesAggregatedDilutedData[i].value - sharesAggregatedDilutedData[i - 4].value) / sharesAggregatedDilutedData[i - 4].value * 100).toFixed(2);
        sharesAggregatedDilutedDataChanges.push(change);
    }

    const getBillions = (value) => {
        return (+value / 1e9).toFixed(3);
    }

    let content =
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



    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} Shares Outstanding</h1>
            </div>
            {content}

        </div >
    )
}

