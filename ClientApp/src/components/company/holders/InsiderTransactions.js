import React from 'react';
import { Table } from 'react-bootstrap';

export function InsiderTransactions(props) {
    const { netSharePurchaseActivity, insiderTransactions } = props;

    return (
        <div>
            <div>
                <Table className='table-sm' bordered hover variant='light'>
                    <caption>Insider Purchases Last 6 Months</caption>
                    <thead>
                        <tr>
                            <th></th>
                            <th className='centered'>Shares</th>
                            <th className='centered'>Trans</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Purchases</td>
                            <td className='centered'>{netSharePurchaseActivity.buyInfoShares.fmt}</td>
                            <td className='centered'>{netSharePurchaseActivity.buyInfoCount.fmt}</td>
                        </tr>
                        <tr>
                            <td>Sales</td>
                            <td className='centered'>{netSharePurchaseActivity.sellInfoShares.fmt}</td>
                            <td className='centered'>{netSharePurchaseActivity.sellInfoCount.fmt}</td>
                        </tr>
                        <tr>
                            <td>Net Shares Purchased (Sold)</td>
                            <td className='centered'>{netSharePurchaseActivity.netInfoShares.fmt}</td>
                            <td className='centered'>{netSharePurchaseActivity.netInfoCount.fmt}</td>
                        </tr>
                        <tr>
                            <td>Total Insider Shares Held</td>
                            <td className='centered'>{netSharePurchaseActivity.totalInsiderShares.fmt}</td>
                            <td className='centered'>-</td>
                        </tr>
                        <tr>
                            <td>% Net Shares Purchased (Sold)</td>
                            <td className='centered'>{netSharePurchaseActivity.netPercentInsiderShares.fmt}</td>
                            <td className='centered'>-</td>
                        </tr>
                                           
                    </tbody>
                </Table>
            </div>

            <div>
                <Table className='table-sm fixedTable' bordered hover variant='light'>
                    <caption>Insider Transactions Reported - Last Two Years</caption>
                    <thead>
                        <tr className='d-flex'>
                            <th className='col-md-4'>Insider</th>
                            <th className='col-md-4'>Transaction</th>
                            <th className='centered col-md-1'>Type</th>
                            <th className='centered col-md-1'>Value</th>
                            <th className='centered col-md-1'>Date</th>
                            <th className='centered col-md-1'>Shares</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insiderTransactions.transactions.map((data, i) => 
                        <tr key={i} className='d-flex'>
                            <td className='col-md-4'>{`${data.filerName} (${data.filerRelation})`}</td>
                            <td className='col-md-4'>{data.transactionText}</td>
                            <td className='centered col-md-1'>{data.ownership === 'D' ? 'Direct' : 'Indirect'}</td>
                            <td className='centered col-md-1'>{data.value.fmt}</td>
                            <td className='centered col-md-1'>{data.startDate.fmt}</td>
                            <td className='centered col-md-1'>{data.shares.fmt}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </div>           
        </div>
    )
}