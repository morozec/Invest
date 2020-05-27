const RATIO_TYPE = {
    relative: 0,
    absolute: 1,
    percent: 2
};

// export const GROUPS = {
//     Valuation: ['Market Capitalisation', 'Enterprise Value', 'Price to Earnings (P/E) Ratio', 'Price to Sales (P/S) Ratio',
//         'Price to Book (P/B) Value', 'Price to Free Cash Flow (P/FCF)', 'EV/EBITDA', 'EV/Sales', 'EV/FCF'],
//     Profitability: ['Gross Margin %', 'Operating Margin %', 'Net Profit Margin %', 'Return on Equity (ROE) %', 'Return on Assets (ROA) %'],
//     Dividends: ['Dividends Paid', 'Dividends per Share', 'Dividend Yield'],
//     Income: ['Revenue', 'Gross Profit', 'Operating Income (EBIT)', 'EBITDA', 'Net Income (common s-holders)',
//         'Earnings per Share (EPS), Basic', 'Earnings per Share (EPS), Diluted'],
//     'Balance Sheet': ['Total Assets', 'Total Liabilities', 'Total Equity', 'Liabilities to Equity Ratio', 'Cash and Cash-equivalents',
//         'Total Debt', 'Debt to Assets Ratio', 'Current Ratio', 'Book Value per Share', 'Pietroski F-Score'],
//     'Cash Flow': ['Operating Cash Flow', 'Free Cash Flow', 'Free Cash Flow per Share', 'Net Change in Cash']
// };

export const GROUPS = [
    {
        name:'Valuation',
        indexes:[
            {profileGroup:'summaryDetail', name:'marketCap', comparingCoeff:0},
            {profileGroup:'defaultKeyStatistics', name:'enterpriseValue', comparingCoeff:0},
            {profileGroup:'summaryDetail', name:'trailingPE', comparingCoeff:-1},
            {profileGroup:'summaryDetail', name:'priceToSalesTrailing12Months', comparingCoeff:-1},
            {profileGroup:'defaultKeyStatistics', name:'priceToBook', comparingCoeff:-1},
            {profileGroup:'defaultKeyStatistics', name:'enterpriseToRevenue', comparingCoeff:-1},
            {profileGroup:'defaultKeyStatistics', name:'enterpriseToEbitda', comparingCoeff:-1},
        ]
    },
    {
        name:'Profitability',
        indexes:[
            {profileGroup:'financialData', name:'grossMargins', comparingCoeff:0},
            {profileGroup:'financialData', name:'operatingMargins', comparingCoeff:0},
            {profileGroup:'financialData', name:'profitMargins', comparingCoeff:0},
            {profileGroup:'financialData', name:'returnOnEquity', comparingCoeff:1},
            {profileGroup:'financialData', name:'returnOnAssets', comparingCoeff:1},
        ]
    },
    {
        name:'Dividends',
        indexes:[
            {profileGroup:'summaryDetail', name:'dividendRate', comparingCoeff:0},
            {profileGroup:'summaryDetail', name:'dividendYield', comparingCoeff:1},
            {profileGroup:'summaryDetail', name:'payoutRatio', comparingCoeff:-1},
        ]
    },
    {
        name:'Income',
        indexes:[
            {profileGroup:'financialData', name:'totalRevenue', comparingCoeff:0},
            {profileGroup:'financialData', name:'revenueGrowth', comparingCoeff:1},
            {profileGroup:'financialData', name:'ebitda', comparingCoeff:0},
            {profileGroup:'defaultKeyStatistics', name:'netIncomeToCommon', comparingCoeff:0},
            {profileGroup:'defaultKeyStatistics', name:'trailingEps', comparingCoeff:0},
        ]
    },
    {
        name:'Balance Sheet',
        indexes:[
            {profileGroup:'financialData', name:'totalCash', comparingCoeff:0},
            {profileGroup:'financialData', name:'totalDebt', comparingCoeff:0},
            {profileGroup:'financialData', name:'debtToEquity', comparingCoeff:-1},
            {profileGroup:'financialData', name:'currentRatio', comparingCoeff:1},
            {profileGroup:'financialData', name:'quickRatio', comparingCoeff:1},
        ]
    },
    {
        name:'Cash Flow',
        indexes:[
            {profileGroup:'financialData', name:'operatingCashflow', comparingCoeff:0},
            {profileGroup:'financialData', name:'freeCashflow', comparingCoeff:0},
        ]
    },    
];

export function RatioHelper(profile) {
    this.profile = profile;
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
                const lastClosingPrice = + (this.ratios.filter(r => r.indicatorName === 'Last Closing Price')[0].value);
                groupedRatios.Dividends['Dividend Yield'] ={
                    value: +ratio.value / lastClosingPrice,
                    comparingCoeff:1,
                    displayValue:getValue(+ratio.value / lastClosingPrice, RATIO_TYPE.percent)
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
                groupedRatios.Income['Net Income (common s-holders)'] ={
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