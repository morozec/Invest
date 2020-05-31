import React from 'react';
import { Table } from 'react-bootstrap';

export function MajorHolders(props) {
    const { majorHoldersBreakdown, institutionOwnership, fundOwnership } = props;

    return (
        <div>
            <div>
                <Table className='table-sm' bordered hover variant='light'>
                    <caption>Major Holders</caption>
                    <tbody>
                        <tr>
                            <td>
                                {majorHoldersBreakdown.insidersPercentHeld.fmt}
                            </td>
                            <td>% of Shares Held by All Insider</td>
                        </tr>
                        <tr>
                            <td>
                                {majorHoldersBreakdown.institutionsPercentHeld.fmt}
                            </td>
                            <td>% of Shares Held by Institutions</td>
                        </tr>
                        <tr>
                            <td>
                                {majorHoldersBreakdown.institutionsFloatPercentHeld.fmt}
                            </td>
                            <td>% of Float Held by Institutions</td>
                        </tr>
                        <tr>
                            <td>
                                {majorHoldersBreakdown.institutionsCount.fmt}
                            </td>
                            <td>Number of Institutions Holding Shares</td>
                        </tr>
                    </tbody>
                </Table>
            </div>

            <div>
                <Table className='table-sm fixedTable' bordered hover variant='light'>
                    <caption>Top Institutional Holders</caption>
                    <thead>
                        <tr>
                            <th className='holdersTableCol0'>Holder</th>
                            <th className='centered'>Shares</th>
                            <th className='centered'>Date Reported</th>
                            <th className='centered'>% Out</th>
                            <th className='centered'>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {institutionOwnership.ownershipList.map((data, i) => 
                        <tr key={i}>
                            <td>{data.organization}</td>
                            <td className='centered'>{data.position.fmt}</td>
                            <td className='centered'>{data.reportDate.fmt}</td>
                            <td className='centered'>{data.pctHeld.fmt}</td>
                            <td className='centered'>{data.value.fmt}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </div>

            <div>
                <Table className='table-sm fixedTable' bordered hover variant='light'>
                    <caption>Top Mutual Fund Holders</caption>
                    <thead>
                        <tr>
                            <th className='holdersTableCol0'>Holder</th>
                            <th className='centered'>Shares</th>
                            <th className='centered'>Date Reported</th>
                            <th className='centered'>% Out</th>
                            <th className='centered'>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fundOwnership.ownershipList.map((data, i) => 
                        <tr key={i}>
                            <td>{data.organization}</td>
                            <td className='centered'>{data.position.fmt}</td>
                            <td className='centered'>{data.reportDate.fmt}</td>
                            <td className='centered'>{data.pctHeld.fmt}</td>
                            <td className='centered'>{data.value.fmt}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </div>
        </div>
    )
}