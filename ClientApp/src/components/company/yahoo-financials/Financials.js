import React, { useEffect, useState } from 'react';
import { FinancialsTable } from './FinancialsTable';
import { Bar } from 'react-chartjs-2';

export function Financials(props) {
    const { isActive, statementType, companySymbol, parseFinancials, statementTitle, chartInfos } = props;

    const [financials, setFinancials] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isActive) return;

        setIsLoading(true);

        const getData = async (companySymbol) => {
            const response = await fetch(`api/yahooFinance/${statementType}/${companySymbol}`);
            const data = await response.json();
            return data;
        }

        getData(companySymbol).then(result => {
            let financials = parseFinancials(result);
            console.log(financials);
            setFinancials(financials);
            setIsLoading(false);
        })

    }, [isActive, statementType, companySymbol, parseFinancials])

    const getStrongNames = () => {
        let strongNames = new Set();
        for (let ci of chartInfos) {
            for (let bar of ci.bars) {
                strongNames.add(bar.name);
            }
        }
        return strongNames;
    }

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : <div className='content'>
            <FinancialsTable financials={financials} strongNames={getStrongNames()} />

            <div className='content-charts'>
                {chartInfos.map((chartInfo, i) =>
                    <Bar key={i}
                        data={{
                            labels: [...financials.dates].reverse(),
                            datasets:
                                chartInfo.bars.map((ci) => (
                                    {
                                        label: ci.name,
                                        backgroundColor: `rgba(${ci.color[0]},${ci.color[1]}, ${ci.color[2]}, 1)`,
                                        borderWidth: 1,
                                        hoverBackgroundColor: `rgba(${ci.color[0]},${ci.color[1]}, ${ci.color[2]}, 0.6)`,
                                        hoverBorderColor: `rgba(${ci.color[0]},${ci.color[1]}, ${ci.color[2]}, 0.6)`,
                                        data: [...financials.data[ci.name]].reverse(),
                                        stack: ci.stack
                                    }
                                ))
                        }}
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
                )}
            </div>
        </div>



    return (
        <div>
            <div className='statementHeader'>
                <h1>{companySymbol} {statementTitle}</h1>
            </div>


            {content}
        </div>
    )
}