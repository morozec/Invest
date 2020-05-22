import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';

export function CashFlowTable(props) {
    const { ttmData, data } = props;
    const [visibleTids, setVisibleTids] = useState(null);

    useEffect(() => {
        let vTids = new Map();
        for (let value of ttmData.values) {
            vTids.set(value.tid, false);
        }
        setVisibleTids(vTids);
    }, [ttmData])

    const getMillions = (v) => +v / 1e6;

    let tableRows = [];
    let fullData = [ttmData, ...data];

    let children = new Map();
    let baseIndexes = [];

    for (let index = 0; index < ttmData.values.length; ++index) {
        let value = ttmData.values[index];
        if (value.valueChosen === null) continue;
        if (value['uid'] === '13' || value['uid'] === '31' || value['uid'] === '43' ||
            value['uid'] === '44' || value['uid'] === '47' || value['uid'] === '48') {
            value['parent_tid'] = '0';
        }

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

    const handleClickRow = (tid) => {
        if (!children.has(tid)) return;
        let newVisibleTids = new Map(visibleTids);
        newVisibleTids.set(tid, !visibleTids.get(tid));
        setVisibleTids(newVisibleTids);
    }


    const fillTableRec = (indexes, level) => {
        if (!indexes) return;
        for (let index of indexes) {
            let cells = [];
            let ttmValue = ttmData.values[index];
            let tid = ttmValue['tid'];
            let standardisedName = ttmValue['standardisedName'];

            const needStrong =
                standardisedName === 'Cash from Operating Activities'
                || standardisedName === 'Cash from Investing Activities'
                || standardisedName === 'Cash from Financing Activities'
                || standardisedName === 'Free Cash Flow';

            cells.push(
                children.has(tid)
                    ? <td key={0} className={`dl-${level}`}>{needStrong ? <strong>{standardisedName}</strong> : standardisedName} &#x25bc;</td>
                    : <td key={0} className={`dl-${level}`}>{needStrong ? <strong>{standardisedName}</strong> : standardisedName}</td>
            )

            for (let i = 0; i < fullData.length; ++i) {
                let value = fullData[i].values[index];
                cells.push(<td key={i + 1} className='value'>{getMillions(value.valueChosen)}</td>)
            }


            tableRows.push(
                <tr className={children.has(tid) ? 'container' : ''} key={index} onClick={() => handleClickRow(tid)}>
                    {cells}
                </tr>)

            if (visibleTids && visibleTids.get(tid)) {
                fillTableRec(children.get(tid), level + 1);
            }
        }
    }

    fillTableRec(baseIndexes, 0);
    // tableRows.push(
    //     <tr key={baseIndexes.length} >
    //         <td key={0} className={`dl-0`}><strong>Free Cash Flow</strong></td>
    //         {fullData.map((fd, i) =>
    //             <td key={i + 1} className='value'>
    //                 {getMillions(
    //                     +(fd.values.filter(v => v.tid === '13')[0].valueChosen)
    //                     +
    //                     +(fd.values.filter(v => v.tid === '14')[0].valueChosen)
    //                 )}
    //             </td>)}
    //     </tr>)

    return (
        <Table className='table-sm' bordered hover variant='light'>
            <thead>
                <tr>
                    <th>Breakdown</th>
                    {[ttmData, ...data].map((data, i) => <th className='centered' key={i}>{i === 0 ? 'TTM' : data.periodEndDate}</th>)}
                </tr>
            </thead>
            <tbody>
                {tableRows}
            </tbody>
        </Table>
    )
}