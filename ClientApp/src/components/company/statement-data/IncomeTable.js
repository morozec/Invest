import React, { useState } from 'react';
import { Table } from 'react-bootstrap';

export function IncomeTable(props) {
    const { ttmData, data } = props;
    const [visibleTids, setVisibleTids] = useState(
        ttmData.industryTemplate === 'general'
            ? new Map([['11', false], ['20', false]])
            : ttmData.industryTemplate === 'banks'
                ? new Map([['1', false], ['2', false], ['7', false], ['16', false]])
                : new Map()); //TODO: insurance

    const getMillions = (v) => +v / 1e6;

    const handleClickRow = (tid) => {
        if (!visibleTids.has(tid)) return;
        let newVisibleTids = new Map(visibleTids);
        newVisibleTids.set(tid, !visibleTids.get(tid));
        setVisibleTids(newVisibleTids);
    }

    let tableRows = [];
    let fullData = [ttmData, ...data];
    for (let row = 0; row < ttmData.values.length; ++row) {

        let ttmValue = ttmData.values[row];
        let lastPeriodValue = data[0].values[row];
        if (ttmValue.valueChosen === null && lastPeriodValue.valueChosen === null) continue;
        if (visibleTids.has(ttmValue.parent_tid) && !visibleTids.get(ttmValue.parent_tid)) continue;
        let standardisedName = ttmValue['standardisedName'];
        let displayLevel = ttmValue['displayLevel'];
        let tid = ttmValue.tid;
        let uid = ttmValue.uid;
        const isContainer = visibleTids.has(tid);

        let cells = [];
        const needStrong = uid === '1' || uid === '19' || uid === '55' || uid === 'dilutedEps';

        cells.push(isContainer
            ? <td key={0} className={`dl-${displayLevel}`}>{needStrong ? <strong>{standardisedName}</strong> : standardisedName}  &#x25bc;</td>
            : <td key={0} className={`dl-${displayLevel}`}>{needStrong ? <strong>{standardisedName}</strong> : standardisedName}</td>);

        for (let i = 0; i < fullData.length; ++i) {
            let value = fullData[i].values[row];
            let displayValue = value.valueChosen === null
                ? '-'
                : value.tid === 'basicEps' || value.tid === 'dilutedEps'
                    ? value.valueChosen.toFixed(2)
                    : getMillions(value.valueChosen);
            cells.push(<td key={i + 1} className='value'>{displayValue}</td>)
        }

        tableRows.push(
            <tr key={row} onClick={() => handleClickRow(tid)} className={isContainer ? 'container' : ''}>
                {cells}
            </tr>)
    }

    return (
        <Table className='table-sm' bordered hover variant='light'>
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