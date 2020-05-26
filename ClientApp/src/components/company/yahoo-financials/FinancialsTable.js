import React, { Fragment, useState } from 'react';
import { Table } from 'react-bootstrap';
export function FinancialsTable(props) {
    const { financials, strongNames } = props;

    const getAllContainers = (indexes) => {
        let res = [];
        for (let index of indexes) {
            if (index.children.length > 0) {
                res.push(index.name);
                res = [...res, ...getAllContainers(index.children)];
            }
        }
        return res;
    }

    const [expanded, setExpanded] = useState(new Map(getAllContainers(financials.indexes).map(c => [c, false])));

    const handleRowClick = (indexName) => {
        if (!expanded.has(indexName)) return;
        let newExpanded = new Map(expanded);
        newExpanded.set(indexName, !expanded.get(indexName));
        setExpanded(newExpanded);
    }

    const getSum = (index, j) => {
        let sum = index.children.reduce((s, child) => s + financials.data[child.name][j], 0);
        return sum;
    }

    const getIndexRow = (index, displayLevel = 0) => {
        return (
            <Fragment key={index.name}>
                <tr className={expanded.has(index.name) ? 'container' : ''} onClick={() => handleRowClick(index.name)}>

                    {expanded.has(index.name) && <td key={0} className={`dl-${displayLevel}`}>
                        {strongNames.has(index.name) ? <strong>{index.name}</strong> : index.name} &#x25bc;
                    </td>}
                    {!expanded.has(index.name) && <td key={0} className={`dl-${displayLevel}`}>
                        {strongNames.has(index.name) ? <strong>{index.name}</strong> : index.name}
                    </td>}

                    {financials.data.map((d, j) =>
                        <td key={j + 1} className='centered'>{d[index.name] !== null ? d[index.name].fmt : '-'}</td>
                    )}

                    {/* {financials.data.hasOwnProperty(index.name) && financials.data[index.name].map((value, j) =>
                        <td key={j + 1} className='centered'>{value !== null ? value : '-'}</td>
                    )}

                    {!financials.data.hasOwnProperty(index.name) && financials.dates.map((d, j) =>
                        <td key={j + 1} className='centered'>{getSum(index, j)}</td>
                    )} */}
                </tr>
                {(!expanded.has(index.name) || expanded.get(index.name)) &&
                    index.children.map(child => getIndexRow(child, displayLevel + 1))}
            </Fragment>
        )
    }

    return (
        <Table className='table-sm' bordered hover variant='light'>
            <thead>
                <tr>
                    <th>Breakdown</th>
                    {financials.dates.map((date, i) => <th className='centered' key={i}>{date}</th>)}
                </tr>
            </thead>
            <tbody>
                {financials.indexes.map((index) =>
                    getIndexRow(index)
                )}
            </tbody>
        </Table>
    )
}