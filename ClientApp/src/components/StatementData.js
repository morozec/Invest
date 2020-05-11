import React, { useState, useEffect } from 'react';
import { Table, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

export function StatementData(props) {
    const [ttmData, setTtmData] = useState(null);
    const [yearsData, setYearsData] = useState(null);
    const [quartersData, setQuartersData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { statementType, statementTitle, isActive } = props;
    const [visibleTids, setVisibleTids] = useState(new Map());
    const [periodType, setPeriodType] = useState('year');


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
            if (!ttmData){
                if (periodType === 'year') setYearsData(results.slice(1));
                else setQuartersData(results.slice(1));
                setTtmData(results[0]);
            }else{
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
                    const valueChosenB = Math.floor(+value.valueChosen / 1e6);
                    cells.push(<td key={i + 1} className='valueChosen'>{valueChosenB}</td>)
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



        content = (
            <Table bordered hover variant='light'>
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
        )
    }

    const handlePeriodTypeChanged = (v) => {
        setPeriodType(v);
    }


    return (
        <div>
            <div className='statementHeader'>
                <h1>IBM {statementTitle}</h1>

                <ToggleButtonGroup className='periodType' type='radio' value={periodType} name='periodType' onChange={handlePeriodTypeChanged}>
                    <ToggleButton value='year' variant='outline-secondary'>Year</ToggleButton>
                    <ToggleButton value='quarter' variant='outline-secondary'>Quarter</ToggleButton>
                </ToggleButtonGroup>
            </div>

            {content}
        </div>
    )
}

