import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';

export function StatementData(props) {
    const [yearData, setYearsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { statementType, statementTitle, isActive } = props;
    const [visibleTids, setVisibleTids] = useState(new Map());


    useEffect(() => {
        if (!isActive) return;
        if (yearData) return;

        const years = [2019, 2018, 2017, 2016, 2015];
        const ibmId = 69543;

        const getData = async (companyId, year) => {
            const response = await fetch(`api/simfin/${statementType}/${companyId}/${year}`);
            const data = await response.json();
            return data;
        }

        let promises = years.map(year => getData(ibmId, year))

        Promise.all(promises).then((results) => {
            console.log(results);
            setYearsData(results);

            let values0 = results[0].values;
            let visibleTids = new Map();
            for (let value of values0) {
                visibleTids.set(value.tid, true);
            }
            setVisibleTids(visibleTids);

            setIsLoading(false);
        });

    }, [isActive, yearData, statementType])



    let content;
    if (isLoading) {
        content = <p><em>Loading...</em></p>;
    } else {
        let children = new Map();
        let baseIndexes = [];

        for (let index = 0; index < yearData[0].values.length; ++index) {
            let value = yearData[0].values[index];
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
                let value0 = yearData[0].values[index];
                let tid = value0['tid'];
                let standardisedName = value0['standardisedName'];

                cells.push(
                    children.has(tid)
                        ? <td key={0} className={`dl-${level}`}>{standardisedName} &#x25bc;</td>
                        : <td key={0} className={`dl-${level}`}>{standardisedName}</td>
                )

                for (let i = 0; i < yearData.length; ++i) {
                    let value = yearData[i].values[index];
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



        //const propNames = yearData[0].values.map(v => v.standardisedName);
        content = (
            <Table bordered hover variant='light'>
                <thead>
                    <tr>
                        <th>Breakdown</th>
                        {yearData.map((data, i) => <th className='date' key={i}>{data.periodEndDate}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </Table>
        )
    }



    return (
        <div>
            <h1>IBM {statementTitle}</h1>
            {content}
        </div>
    )
}

