import React from 'react';
import { Table } from 'react-bootstrap';
import { GROUPS } from './../../RatiosHelper'

export function Ratios(props) {
    const { profile } = props;

    return (
        <div>
            <div className='statementHeader'>
                <h1>{profile.quoteType.symbol} Ratios</h1>
            </div>

            <div className='ratiosContainer row'>
                {GROUPS.map(group =>
                    <div className='col-md-4' key={group.name}>
                        <Table bordered hover striped variant='light' className='table-sm'>
                            <caption>{group.name}</caption>
                            <tbody>
                                {group.indexes.map(index =>
                                    <tr key={index.name}>
                                        <td>{index.name}</td>
                                        <td className='value'>{profile[index.profileGroup][index.name].fmt}</td>
                                    </tr>
                                )}                              
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>
        </div >
    )
}

