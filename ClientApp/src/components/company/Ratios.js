import React from 'react';
import { Table } from 'react-bootstrap';

export function Ratios(props) {
    const { ticker, ratios } = props;

    let tableRows = ratios.filter(r => r.value !== null).map(r =>
        <tr key={r.indicatorId}>
            <td>{r.indicatorName}</td>
            <td>{r.value}</td>
        </tr>)

    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} Ratios</h1>
            </div>
            <Table bordered hover striped variant='light'>
                <tbody>
                    {tableRows}
                </tbody>
            </Table>
        </div>
    )
}

