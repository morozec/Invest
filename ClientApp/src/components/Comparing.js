import React, { Fragment } from 'react'
import { Table } from 'react-bootstrap';
import { RatioHelper, GROUPS } from './../RatiosHelper';

export function Comparing(props) {
    const { comparingCompanies } = props;
    const groupedRatios = comparingCompanies.map(c => (new RatioHelper(c.ratios)).getGroupedRatios());

    return (
        <div>
            <Table bordered hover variant='light' className='table-sm'>
                <thead>
                    <tr>
                        <th>Company</th>
                        {comparingCompanies.map((c, i) => <th key={i} className='centered'>{`${c.profile.name} (${c.profile.ticker})`}</th>)}
                    </tr>
                </thead>
                <tbody>

                    {Object.keys(GROUPS).map(groupName =>
                        <Fragment key={groupName}>
                            <tr>
                                <th colSpan={comparingCompanies.length + 1} className='centered'>{groupName}</th>
                            </tr>
                            {GROUPS[groupName].map((ratioName, i) =>
                                <tr key={i}>
                                    <td>
                                        {ratioName}
                                    </td>
                                    {groupedRatios.map((gr, j) => <td key={j} className='value'> {gr[groupName][ratioName]} </td>)}
                                </tr>
                            )}
                        </Fragment>
                    )}


                    {/* <tr>
                        <td>Market Capitalisation</td>
                        {comparingCompanies.map((c, i) => <td key={i} className='value'>
                            {getRatio(c.ratios, 'Market Capitalisation', RATIO_TYPE.absolute)}
                        </td>)}
                    </tr>
                    <tr>
                        <td>Enterprise Value</td>
                        {comparingCompanies.map((c, i) => <td key={i} className='value'>
                            {getRatio(c.ratios, 'Enterprise Value', RATIO_TYPE.absolute)}
                        </td>)}
                    </tr> */}

                </tbody>
            </Table>
        </div>
    )
}