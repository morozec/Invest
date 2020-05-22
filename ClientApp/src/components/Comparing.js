import React from 'react'
import { Table } from 'react-bootstrap';

export function Comparing(props) {
    const { comparingCompanies } = props;

    const RATIO_TYPE = {
        relative: 0,
        absolute: 1,
        percent: 2
    };

    const getRatio = (ratios, indicatorName, ratioType = RATIO_TYPE.relative) => {
        let value = +ratios.filter(r => r.indicatorName === indicatorName)[0].value;
        if (ratioType === RATIO_TYPE.absolute) return `${(value / 1e9).toFixed(2)}B`;
        if (ratioType === RATIO_TYPE.percent) return `${(value * 100).toFixed(2)}%`;
        return (value).toFixed(2);
    }

    return (
        // <div className='comparingCotnainer'>
        //     {comparingCompanies.map((c,i) =>
        //         <div key={i}>
        //             {c.profile.name}
        //         </div>
        //     )}
        // </div>
        <div>
            <Table bordered hover variant='light' className='table-sm'>
                <thead>
                    <tr>
                        <th>Company</th>
                        {comparingCompanies.map((c, i) => <th key={i}>{`${c.profile.name} (${c.profile.ticker})`}</th>)}
                    </tr>
                </thead>
                <tbody>
                    <tr>
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
                    </tr>
                    {/* <tr>
                        <td>Operating Margin %</td>
                        <td className='value'>{getRatio('Operating Margin', RATIO_TYPE.percent)}</td>
                    </tr>
                    <tr>
                        <td>Net Profit Margin %</td>
                        <td className='value'>{getRatio('Net Profit Margin', RATIO_TYPE.percent)}</td>
                    </tr>
                    <tr>
                        <td>Return on Equity (ROE) %</td>
                        <td className='value'>{getRatio('Return on Equity', RATIO_TYPE.percent)}</td>
                    </tr>
                    <tr>
                        <td>Return on Assets (ROA) %</td>
                        <td className='value'>{getRatio('Return on Assets', RATIO_TYPE.percent)}</td>
                    </tr> */}
                </tbody>
            </Table>
        </div>
    )
}