import React, { useState, useEffect } from 'react';
import { Table, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

export function StatementData(props) {
    const [ttmData, setTtmData] = useState(null);
    const [yearsData, setYearsData] = useState(null);
    const [quartersData, setQuartersData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleTids, setVisibleTids] = useState(new Map());
    const [periodType, setPeriodType] = useState('year');

    const { statementType, statementTitle, isActive, chartInfos } = props;


    useEffect(() => {
        if (!isActive) return;
        if (periodType === 'year' && yearsData) return;
        if (periodType === 'quarter' && quartersData) return;

        setIsLoading(true);
        let periods = periodType === 'year'
            ? [[2019, 'fy'], [2018, 'fy'], [2017, 'fy'], [2016, 'fy'], [2015, 'fy']]
            : [[2020, 'q1'], [2019, 'q4'], [2019, 'q3'], [2019, 'q2'], [2019, 'q1']]
        const ibmId = 69543;

        const getData = async (companyId, year, pType) => {
            const response = await fetch(`api/simfin/${statementType}/${companyId}/${year}/${pType}`);
            const data = await response.json();
            return data;
        }
        let promises = !ttmData ? [getData(ibmId, 0, 'ttm')] : [];
        promises = [...promises, ...periods.map(period => getData(ibmId, period[0], period[1]))]

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

            let visibleTids = new Map();
            for (let value of results[0].values) {
                visibleTids.set(value.tid, true);
            }
            setVisibleTids(visibleTids);

            setIsLoading(false);
        });

    }, [isActive, yearsData, quartersData, ttmData, statementType, periodType])

    const getBillions = (v) => Math.floor(+v / 1e6);

    let content;
    let data = periodType === 'year' ? yearsData : quartersData;

    if (isLoading || !data) {
        content = <p><em>Loading...</em></p>;
    } else {
        let children = new Map();
        let baseIndexes = [];

        for (let index = 0; index < ttmData.values.length; ++index) {
            let value = ttmData.values[index];
            if (value.valueChosen === null) continue;
            if (value['parent_tid'] === "0") {
                baseIndexes.push(index);
                continue;
            }
            let parentId = value['parent_tid'];
            if (!children.has(parentId)) {
                children.set(parentId, [index]);
            } else {
                children.get(parentId).push(index);
            }
        }

        // console.log(baseIndexes);
        // console.log(children);

        const handleClickRow = (tid) => {
            if (!children.has(tid)) return;
            let newVisibleTids = new Map(visibleTids);
            newVisibleTids.set(tid, !visibleTids.get(tid));
            setVisibleTids(newVisibleTids);
        }

        let tableRows = [];
        const fillTableRec = (indexes, level) => {
            if (!indexes) return;
            for (let index of indexes) {
                let cells = [];
                let ttmValue = ttmData.values[index];
                let tid = ttmValue['tid'];
                let standardisedName = ttmValue['standardisedName'];

                cells.push(
                    children.has(tid)
                        ? <td key={0} className={`dl-${level}`}>{standardisedName} &#x25bc;</td>
                        : <td key={0} className={`dl-${level}`}>{standardisedName}</td>
                )

                let fullData = [ttmData, ...data];
                for (let i = 0; i < fullData.length; ++i) {
                    let value = fullData[i].values[index];
                    cells.push(<td key={i + 1} className='valueChosen'>{getBillions(value.valueChosen)}</td>)
                }


                tableRows.push(
                    <tr className={children.has(tid) ? 'container' : ''} key={index} onClick={() => handleClickRow(tid)}>
                        {cells}
                    </tr>)

                //console.log(visibleTids);
                if (visibleTids.get(tid)) {
                    fillTableRec(children.get(tid), level + 1);
                }
            }
        }
        fillTableRec(baseIndexes, 0);

        const dates = data.map(d => d.periodEndDate).reverse();
        let chartDatas = chartInfos.map(chartInfo => ({
            labels: dates,
            datasets:
                chartInfo.bars.map((ci, i) => (
                    {
                        label: ci.label,
                        backgroundColor: `rgba(${ci.color[0]},${ci.color[1]}, ${ci.color[2]}, 0.6)`,
                        borderWidth: 1,
                        hoverBackgroundColor: `rgba(${ci.color[0]},${ci.color[1]}, ${ci.color[2]}, 1)`,
                        hoverBorderColor: `rgba(${ci.color[0]},${ci.color[1]}, ${ci.color[2]}, 1)`,
                        data: data.map(d => getBillions(d.values.filter(v => v.standardisedName === ci.label)[0].valueChosen)).reverse(),
                        stack: ci.stack
                    }
                ))
        }));

        content = (
            <div className='content'>
                <Table className='content-table' bordered hover variant='light'>
                    <thead>
                        <tr>
                            <th>Breakdown</th>
                            {[ttmData, ...data].map((data, i) => <th className='date' key={i}>{i === 0 ? 'TTM' : data.periodEndDate}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </Table>


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
                <h1>IBM {statementTitle}</h1>

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

