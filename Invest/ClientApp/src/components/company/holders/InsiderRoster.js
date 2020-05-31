import React from 'react';
import { Table } from 'react-bootstrap';

export function InsiderRoster(props) {
    const { insiderHolders } = props;

    return (
        <div>
            <Table className='table-sm' bordered hover variant='light'>
                <caption>Insider Roster</caption>
                <thead>
                    <tr>
                        <th>Individual or Entity</th>
                        <th className='centered'>Most Recent Transaction</th>
                        <th className='centered'>Date</th>
                        <th className='centered'>Shares Owned as of Transaction Date</th>
                    </tr>
                </thead>
                <tbody>
                    {insiderHolders.holders.filter(data => data.positionDirect).map((data, i) =>
                        <tr key={i}>
                            <td>{data.name}</td>
                            <td className='centered'>{data.transactionDescription}</td>
                            <td className='centered'>{data.latestTransDate.fmt}</td>
                            <td className='centered'>{data.positionDirect.fmt}</td>
                        </tr>)}
                </tbody>
            </Table>
        </div>
    )
}