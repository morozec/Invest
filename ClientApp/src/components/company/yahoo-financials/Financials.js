import React, { useEffect, useState } from 'react';
import { FinancialsTable } from './FinancialsTable';
import { Bar } from 'react-chartjs-2';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

export function Financials(props) {
    const { isActive, yearStatementType, quarterStatementType, companySymbol, parseFinancials, statementTitle, chartInfos } = props;

    const [financialsYear, setFinancialsYear] = useState(null);
    const [financialsQuarter, setFinancialsQuarter] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [periodType, setPeriodType] = useState('year');

    useEffect(() => {
        if (!isActive) return;
        const isYear = periodType === 'year';
        if (isYear && financialsYear) return;
        if (!isYear && financialsQuarter) return;

        setIsLoading(true);

        const getData = async (companySymbol, statementType) => {
            const response = await fetch(`api/yahooFinance/financials/${companySymbol}/${statementType}`);
            const data = await response.json();
            const result = data.quoteSummary.result;
            if (result === null) return null;
            return result[0];
        }

        getData(companySymbol, isYear ? yearStatementType : quarterStatementType).then(result => {
            console.log(result);
            let financials = parseFinancials(result, isYear ? yearStatementType : quarterStatementType, yearStatementType);
            if (periodType === 'year') setFinancialsYear(financials);
            else setFinancialsQuarter(financials);
            setIsLoading(false);
        })

    }, [isActive, yearStatementType, quarterStatementType, companySymbol, parseFinancials, periodType, financialsYear, financialsQuarter])

    const getStrongNames = () => {
        let strongNames = new Set();
        for (let ci of chartInfos) {
            for (let bar of ci.bars) {
                strongNames.add(bar.name);
            }
        }
        return strongNames;
    }

    let financials = periodType === 'year' ? financialsYear : financialsQuarter;
    let content = isLoading || financials === null
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
                                        data: financials.data.map(d => d[ci.name].raw).reverse(),
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

    const handlePeriodTypeChanged = (v) => {
        setPeriodType(v);
    }

    return (
        <div>
            <div className='statementHeader'>
                <h1>{companySymbol} {statementTitle}</h1>

                <ToggleButtonGroup className='periodType' type='radio' value={periodType} name='periodType' onChange={handlePeriodTypeChanged}>
                    <ToggleButton value='year' variant='outline-secondary'>Year</ToggleButton>
                    <ToggleButton value='quarter' variant='outline-secondary'>Quarter</ToggleButton>
                </ToggleButtonGroup>
            </div>
            {content}
        </div>
    )
}