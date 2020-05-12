import React from 'react';
import { Table } from 'react-bootstrap';
import { getBillions } from '../../helpers';

export function Ratios(props) {
    const { ticker, ratios } = props;

    const RATIO_TYPE = {
        relative: 0,
        absolute: 1,
        percent: 2
    };

    const getRatio = (indicatorName, ratioType = RATIO_TYPE.relative) => {
        let value = +ratios.filter(r => r.indicatorName === indicatorName)[0].value;
        if (ratioType === RATIO_TYPE.absolute) return `${(value / 1e9).toFixed(2)}B`;
        if (ratioType === RATIO_TYPE.percent) return `${(value * 100).toFixed(2)}%`;
        return (value).toFixed(2);
    }

    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} Ratios</h1>
            </div>

            <div className='ratiosContainer row'>
                <div className='col-md-4'>
                    <Table bordered hover striped variant='light' className='table-sm'>
                        <caption>Valuation</caption>
                        <tbody>
                            <tr>
                                <td>Market Capitalisation</td>
                                <td className='value'>{getRatio('Market Capitalisation', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Enterprise Value</td>
                                <td className='value'>{getRatio('Enterprise Value', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Price to Earnings (P/E) Ratio</td>
                                <td className='value'>{getRatio('Price to Earnings Ratio')}</td>
                            </tr>
                            <tr>
                                <td>Price to Sales (P/S) Ratio</td>
                                <td className='value'>{getRatio('Price to Sales Ratio')}</td>
                            </tr>
                            <tr>
                                <td>Price to Book (P/B) Value</td>
                                <td className='value'>{getRatio('Price to Book Value')}</td>
                            </tr>
                            <tr>
                                <td>Price to Free Cash Flow (P/FCF)</td>
                                <td className='value'>{getRatio('Price to Free Cash Flow')}</td>
                            </tr>

                            <tr>
                                <td>EV/EBITDA</td>
                                <td className='value'>{getRatio('EV/EBITDA')}</td>
                            </tr>
                            <tr>
                                <td>EV/Sales</td>
                                <td className='value'>{getRatio('EV/Sales')}</td>
                            </tr>
                            <tr>
                                <td>EV/FCF</td>
                                <td className='value'>{getRatio('EV/FCF')}</td>
                            </tr>

                        </tbody>
                    </Table>
                </div>

                <div className='col-md-4'>
                    <Table bordered hover striped variant='light' className='table-sm'>
                        <caption>Profitability</caption>
                        <tbody>
                            <tr>
                                <td>Gross Margin %</td>
                                <td className='value'>{getRatio('Gross Margin', RATIO_TYPE.percent)}</td>
                            </tr>
                            <tr>
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
                            </tr>
                        </tbody>
                    </Table>
                </div>

                <div className='col-md-4'>
                    <Table bordered hover striped variant='light' className='table-sm'>
                        <caption>Dividends</caption>
                        <tbody>
                            <tr>
                                <td>Dividends Paid</td>
                                <td className='value'>{getRatio('Dividends Paid', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Dividends per Share</td>
                                <td className='value'>{getRatio('Dividends per Share')}</td>
                            </tr>

                        </tbody>
                    </Table>
                </div>

                <div className='col-md-4'>
                    <Table bordered hover striped variant='light' className='table-sm'>
                        <caption>Income</caption>
                        <tbody>
                            <tr>
                                <td>Revenue</td>
                                <td className='value'>{getRatio('Revenues', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Gross Profit</td>
                                <td className='value'>{getRatio('Gross Profit', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Operating Income (EBIT)</td>
                                <td className='value'>{getRatio('Operating Income (EBIT)', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>EBITDA</td>
                                <td className='value'>{getRatio('EBITDA', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Net Income (common shareholders)</td>
                                <td className='value'>{getRatio('Net Income (common shareholders)', RATIO_TYPE.absolute)}</td>
                            </tr>

                            <tr>
                                <td>Earnings per Share (EPS), Basic</td>
                                <td className='value'>{getRatio('Earnings per Share, Basic')}</td>
                            </tr>
                            <tr>
                                <td>Earnings per Share (EPS), Diluted</td>
                                <td className='value'>{getRatio('Earnings per Share, Diluted')}</td>
                            </tr>

                        </tbody>
                    </Table>
                </div>

                <div className='col-md-4'>
                    <Table bordered hover striped variant='light' className='table-sm'>
                        <caption>Balance Sheet</caption>
                        <tbody>
                            <tr>
                                <td>Total Assets</td>
                                <td className='value'>{getRatio('Total Assets', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Total Liabilities</td>
                                <td className='value'>{getRatio('Total Liabilities', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Total Equity</td>
                                <td className='value'>{getRatio('Total Equity', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Liabilities to Equity Ratio</td>
                                <td className='value'>{getRatio('Liabilities to Equity Ratio')}</td>
                            </tr>

                            <tr>
                                <td>Cash and Cash-equivalents</td>
                                <td className='value'>{getRatio('Cash and Cash-equivalents', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Total Debt</td>
                                <td className='value'>{getRatio('Total Debt', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Debt to Assets Ratio</td>
                                <td className='value'>{getRatio('Debt to Assets Ratio')}</td>
                            </tr>

                            <tr>
                                <td>Current Ratio</td>
                                <td className='value'>{getRatio('Current Ratio')}</td>
                            </tr>

                            <tr>
                                <td>Book Value per Share</td>
                                <td className='value'>{getRatio('Book Value per Share')}</td>
                            </tr>

                            <tr>
                                <td>Pietroski F-Score</td>
                                <td className='value'>{getRatio('Pietroski F-Score')}</td>
                            </tr>

                        </tbody>
                    </Table>
                </div>

                <div className='col-md-4'>
                    <Table bordered hover striped variant='light' className='table-sm'>
                        <caption>Cash Flow</caption>
                        <tbody>
                            <tr>
                                <td>Operating Cash Flow</td>
                                <td className='value'>{getRatio('Operating Cash Flow', RATIO_TYPE.absolute)}</td>
                            </tr>
                            <tr>
                                <td>Free Cash Flow</td>
                                <td className='value'>{getRatio('Free Cash Flow', RATIO_TYPE.absolute)}</td>
                            </tr>

                            <tr>
                                <td>Free Cash Flow per Share</td>
                                <td className='value'>{getRatio('Free Cash Flow per Share')}</td>
                            </tr>

                            <tr>
                                <td>Net Change in Cash</td>
                                <td className='value'>{getRatio('Net Change in Cash', RATIO_TYPE.absolute)}</td>
                            </tr>

                        </tbody>
                    </Table>
                </div>



            </div>


        </div >
    )
}

