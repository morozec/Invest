import React, { useState, useEffect } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { IncomeTable } from './IncomeTable';
import { BalanceSheetTable } from './BalanceSheetTable';
import { CashFlowTable } from './CashFlowTable';

export function StatementData(props) {
    const [ttmData, setTtmData] = useState(null);
    const [yearsData, setYearsData] = useState(null);
    const [quartersData, setQuartersData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [periodType, setPeriodType] = useState('year');

    const { statementType, statementTitle, isActive, chartInfos, ticker, simfinId,
        sharesAggregatedBasicData,
        sharesAggregatedDilutedData
    } = props;


    useEffect(() => {
        if (!isActive) return;
        if (periodType === 'year' && yearsData) return;
        if (periodType === 'quarter' && quartersData) return;

        setIsLoading(true);
        let periods = periodType === 'year' //TODO!!!
            ? [[2019, 'fy'], [2018, 'fy'], [2017, 'fy'], [2016, 'fy'], [2015, 'fy']]
            : [[2020, 'q1'], [2019, 'q4'], [2019, 'q3'], [2019, 'q2'], [2019, 'q1']];

        const getData = async (companyId, year, pType) => {
            const response = await fetch(`api/simfin/${statementType}/${companyId}/${year}/${pType}`);
            const data = await response.json();
            if (statementType === 'income') {
                let netIncome = +data.values.filter(v => v.tid === '55')[0].valueChosen;


                let sharesAggregatedBasic = sharesAggregatedBasicData.filter(sa => sa.period === 'FY' && +sa.fyear === year)[0];
                let basicAverageShares = sharesAggregatedBasic !== undefined ?
                    sharesAggregatedBasic.value
                    : null;
                let epsBasic = sharesAggregatedBasic !== undefined
                    ? netIncome / sharesAggregatedBasic.value
                    : null;

                data.values.push({
                    tid: 'basicAverageShares',
                    standardisedName: 'Basic Average Shares',
                    displayLevel: "0",
                    valueChosen: basicAverageShares
                });

                data.values.push({
                    tid: 'basicEps',
                    standardisedName: 'Basic EPS',
                    displayLevel: "0",
                    valueChosen: epsBasic
                });


                let sharesAggregatedDiluted = sharesAggregatedDilutedData.filter(sa => sa.period === 'FY' && +sa.fyear === year)[0];
                let dilutedAverageShares = sharesAggregatedDiluted !== undefined ?
                    sharesAggregatedDiluted.value
                    : null;
                let epsDiluted = sharesAggregatedDiluted !== undefined
                    ? netIncome / sharesAggregatedDiluted.value
                    : null;

                data.values.push({
                    tid: 'dilutedAverageShares',
                    standardisedName: 'Diluted Average Shares',
                    displayLevel: "0",
                    valueChosen: dilutedAverageShares
                });

                data.values.push({
                    tid: 'dilutedEps',
                    standardisedName: 'Diluted EPS',
                    displayLevel: "0",
                    valueChosen: epsDiluted
                });
            }
            else if (statementType === 'cashFlow') {
                data.values.push({
                    tid: 'fcf',
                    standardisedName: 'Free Cash Flow',
                    displayLevel: "0",
                    valueChosen:
                        +data.values.filter(v => v.tid === '13')[0].valueChosen
                        +
                        +data.values.filter(v => v.tid === '14')[0].valueChosen
                })
            }
            return data;
        }
        let promises = !ttmData ? [getData(simfinId, 0, 'ttm')] : [];
        promises = [...promises, ...periods.map(period => getData(simfinId, period[0], period[1]))]

        Promise.all(promises).then((results) => {
            console.log(results);
            if (!ttmData) {
                if (periodType === 'year') setYearsData(results.slice(1));
                else setQuartersData(results.slice(1));
                setTtmData(results[0]);
            } else {
                if (periodType === 'year') setYearsData(results);
                else setQuartersData(results);
            }

            setIsLoading(false);
        });

    }, [isActive, yearsData, quartersData, ttmData, statementType, periodType, simfinId])

    const getMillions = (v) => Math.floor(+v / 1e6);

    let content;
    let data = periodType === 'year' ? yearsData : quartersData;

    if (isLoading || !data) {
        content = <p><em>Loading...</em></p>;
    } else {
        const dates = data.map(d => d.periodEndDate).reverse();
        let chartDatas = chartInfos.map(chartInfo => ({
            labels: dates,
            datasets:
                chartInfo.bars.map((ci, i) => (
                    {
                        label: ci.label,
                        backgroundColor: `rgba(${ci.color[0]},${ci.color[1]}, ${ci.color[2]}, 1)`,
                        borderWidth: 1,
                        hoverBackgroundColor: `rgba(${ci.color[0]},${ci.color[1]}, ${ci.color[2]}, 0.6)`,
                        hoverBorderColor: `rgba(${ci.color[0]},${ci.color[1]}, ${ci.color[2]}, 0.6)`,
                        data: data.map(d => getMillions(d.values.filter(v => v.standardisedName === ci.label)[0].valueChosen)).reverse(),
                        stack: ci.stack
                    }
                ))
        }));

        let table = null;
        if (statementType === 'income') table = <IncomeTable ttmData={ttmData} data={data} />
        else if (statementType === 'balanceSheet') table = <BalanceSheetTable ttmData={ttmData} data={data} />
        else if (statementType === 'cashFlow') table = <CashFlowTable ttmData={ttmData} data={data} />

        content = (
            <div className='content'>
                {table}

                <div className='content-charts'>
                    {chartDatas.map((chartData, i) =>
                        <Bar key={i}
                            data={chartData}
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
        )


    }

    const handlePeriodTypeChanged = (v) => {
        setPeriodType(v);
    }


    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} {statementTitle}</h1>

                {/* <ButtonGroup toggle className='showTtm'> 
                    <ToggleButton type="checkbox" defaultChecked value="1" variant='outline-secondary'>
                        Show TTM
                    </ToggleButton>
                </ButtonGroup> */}

                <ToggleButtonGroup className='periodType' type='radio' value={periodType} name='periodType' onChange={handlePeriodTypeChanged}>
                    <ToggleButton value='year' variant='outline-secondary'>Year</ToggleButton>
                    <ToggleButton value='quarter' variant='outline-secondary'>Quarter</ToggleButton>
                </ToggleButtonGroup>
            </div>

            {content}


        </div>
    )
}

