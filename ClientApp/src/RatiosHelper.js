const RATIO_TYPE = {
    relative: 0,
    absolute: 1,
    percent: 2
};

export const GROUPS = {
    Valuation: ['Market Capitalisation', 'Enterprise Value', 'Price to Earnings (P/E) Ratio', 'Price to Sales (P/S) Ratio',
        'Price to Book (P/B) Value', 'Price to Free Cash Flow (P/FCF)', 'EV/EBITDA', 'EV/Sales', 'EV/FCF'],
    Profitability: ['Gross Margin %', 'Operating Margin %', 'Net Profit Margin %', 'Return on Equity (ROE) %', 'Return on Assets (ROA) %'],
    Dividends: ['Dividends Paid', 'Dividends per Share'],
    Income: ['Revenue', 'Gross Profit', 'Operating Income (EBIT)', 'EBITDA', 'Net Income (common shareholders)',
        'Earnings per Share (EPS), Basic', 'Earnings per Share (EPS), Diluted'],
    'Balance Sheet': ['Total Assets', 'Total Liabilities', 'Total Equity', 'Liabilities to Equity Ratio', 'Cash and Cash-equivalents',
        'Total Debt', 'Debt to Assets Ratio', 'Current Ratio', 'Book Value per Share', 'Pietroski F-Score'],
    'Cash Flow': ['Operating Cash Flow', 'Free Cash Flow', 'Free Cash Flow per Share', 'Net Change in Cash']
};

export function RatioHelper(ratios) {
    this.ratios = ratios;
}

const getValue = (value, ratioType = RATIO_TYPE.relative) => {
    if (ratioType === RATIO_TYPE.absolute) return `${(+value / 1e9).toFixed(2)}B`;
    if (ratioType === RATIO_TYPE.percent) return `${(+value * 100).toFixed(2)}%`;
    return (+value).toFixed(2);
}

RatioHelper.prototype.getGroupedRatios = function () {
    let groupedRatios = {
        Valuation: {},
        Profitability: {},
        Dividends: {},
        Income: {},
        'Balance Sheet': {},
        'Cash Flow': {}
    };
    for (let ratio of this.ratios) {
        switch (ratio.indicatorName) {
            case 'Market Capitalisation':
                groupedRatios.Valuation['Market Capitalisation'] = {
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute),
                };
                break;
            case 'Enterprise Value':
                groupedRatios.Valuation['Enterprise Value'] ={
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue: getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Price to Earnings Ratio':
                groupedRatios.Valuation['Price to Earnings (P/E) Ratio'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue:getValue(ratio.value)
                }; 
                break;
            case 'Price to Sales Ratio':
                groupedRatios.Valuation['Price to Sales (P/S) Ratio'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue:getValue(ratio.value)
                }; 
                break;
            case 'Price to Book Value':
                groupedRatios.Valuation['Price to Book (P/B) Value'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue:getValue(ratio.value)
                }; 
                break;
            case 'Price to Free Cash Flow':
                groupedRatios.Valuation['Price to Free Cash Flow (P/FCF)'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue:getValue(ratio.value)
                }; 
                break;
            case 'EV/EBITDA':
                groupedRatios.Valuation['EV/EBITDA'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue:getValue(ratio.value)
                }; 
                break;
            case 'EV/Sales':
                groupedRatios.Valuation['EV/Sales'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue:getValue(ratio.value)
                }; 
                break;
            case 'EV/FCF':
                groupedRatios.Valuation['EV/FCF'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue:getValue(ratio.value)
                }; 
                break;


            case 'Gross Margin':
                groupedRatios.Profitability['Gross Margin %'] ={
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue:getValue(ratio.value, RATIO_TYPE.percent)
                }; 
                break;
            case 'Operating Margin':
                groupedRatios.Profitability['Operating Margin %'] ={
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue: getValue(ratio.value, RATIO_TYPE.percent)
                };
                break;
            case 'Net Profit Margin':
                groupedRatios.Profitability['Net Profit Margin %'] ={
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue:getValue(ratio.value, RATIO_TYPE.percent)
                }; 
                break;
            case 'Return on Equity':
                groupedRatios.Profitability['Return on Equity (ROE) %'] ={
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue:getValue(ratio.value, RATIO_TYPE.percent)
                }; 
                break;
            case 'Return on Assets':
                groupedRatios.Profitability['Return on Assets (ROA) %'] ={
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue:getValue(ratio.value, RATIO_TYPE.percent)
                }; 
                break;

            case 'Dividends Paid':
                groupedRatios.Dividends['Dividends Paid'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Dividends per Share':
                groupedRatios.Dividends['Dividends per Share'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value)
                }; 
                break;


            case 'Revenues':
                groupedRatios.Income['Revenue'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Gross Profit':
                groupedRatios.Income['Gross Profit'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Operating Income (EBIT)':
                groupedRatios.Income['Operating Income (EBIT)'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'EBITDA':
                groupedRatios.Income['EBITDA'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Net Income (common shareholders)':
                groupedRatios.Income['Net Income (common shareholders)'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Earnings per Share, Basic':
                groupedRatios.Income['Earnings per Share (EPS), Basic'] ={
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue:getValue(ratio.value)
                }; 
                break;
            case 'Earnings per Share, Diluted':
                groupedRatios.Income['Earnings per Share (EPS), Diluted'] ={
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue:getValue(ratio.value)
                }; 
                break;


            case 'Total Assets':
                groupedRatios["Balance Sheet"]['Total Assets'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Total Liabilities':
                groupedRatios["Balance Sheet"]['Total Liabilities'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Total Equity':
                groupedRatios["Balance Sheet"]['Total Equity'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Liabilities to Equity Ratio':
                groupedRatios["Balance Sheet"]['Liabilities to Equity Ratio'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue:getValue(ratio.value)
                }; 
                break;
            case 'Cash and Cash-equivalents':
                groupedRatios["Balance Sheet"]['Cash and Cash-equivalents'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Total Debt':
                groupedRatios["Balance Sheet"]['Total Debt'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Debt to Assets Ratio':
                groupedRatios["Balance Sheet"]['Debt to Assets Ratio'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue: getValue(ratio.value)
                };
                break;
            case 'Current Ratio':
                groupedRatios["Balance Sheet"]['Current Ratio'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue:getValue(ratio.value)
                }; 
                break;
            case 'Book Value per Share':
                groupedRatios["Balance Sheet"]['Book Value per Share'] ={
                    value: +ratio.value,
                    comparingCoeff:-1,
                    displayValue:getValue(ratio.value)
                }; 
                break;
            case 'Pietroski F-Score':
                groupedRatios["Balance Sheet"]['Pietroski F-Score'] ={
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue: getValue(ratio.value)
                };
                break;


            case 'Operating Cash Flow':
                groupedRatios["Cash Flow"]['Operating Cash Flow'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Free Cash Flow':
                groupedRatios["Cash Flow"]['Free Cash Flow'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
            case 'Free Cash Flow per Share':
                groupedRatios["Cash Flow"]['Free Cash Flow per Share'] ={
                    value: +ratio.value,
                    comparingCoeff:1,
                    displayValue:getValue(ratio.value)
                };
                break;
            case 'Net Change in Cash':
                groupedRatios["Cash Flow"]['Net Change in Cash'] ={
                    value: +ratio.value,
                    comparingCoeff:0,
                    displayValue:getValue(ratio.value, RATIO_TYPE.absolute)
                }; 
                break;
        }
    }
    return groupedRatios;
} 