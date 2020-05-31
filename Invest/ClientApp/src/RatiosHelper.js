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