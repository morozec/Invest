import React, { useState, useEffect, useCallback } from 'react'
import { Button, ToggleButtonGroup, ToggleButton, Modal, Form, Table, Tabs, Tab } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import 'chartjs-plugin-colorschemes';
import Select, { createFilter } from 'react-select';
import { MenuList } from './helpers/MenuList';
import { useCookies } from 'react-cookie';
import { PortfolioEditor } from './PortfolioEditor';
import { Line } from 'react-chartjs-2';

export function Portfolio(props) {
    const { companies } = props;
    const [cookies] = useCookies(['jwt']);
    const [isLoading, setIsLoading] = useState(true);

    const [portfolios, setPortfolios] = useState(null);
    const [commissions, setCommisions] = useState(null);
    const [portfolioHoldings, setPortfolioHoldings] = useState(null);
    const [mktValues, setMktValues] = useState({});
    const [portfolioTransactions, setPortfolioTransactions] = useState(null);

    const [showNewDialog, setShowNewDialog] = useState(false);
    const [showHoldingsDialog, setShowHoldingsDialog] = useState(false);

    const [addHoldingsType, setAddHoldingsType] = useState('Buy');
    const [addHoldingsCompany, setAddHoldingsCompany] = useState(null);
    const [addHoldingsPrice, setAddHoldingsPrice] = useState(0);
    const [addHoldingsQuantity, setAddHoldingsQuantity] = useState(1);
    const [addHoldingsCommission, setAddHoldingsCommission] = useState(0);
    const [addHoldingsDate, setAddHoldingsDate] = useState(getYYYYMMDDDate(new Date()));
    const [addHoldingsComment, setAddHoldingsComment] = useState('');

    const [transactionsItem, setTransactionsItem] = useState(null);
    const [transactions, setTransactions] = useState(null);
    const [curTransactionId, setCurTransactionId] = useState(null);

    const [currencyRates, setCurrencyRates] = useState(null)

    const { portfolioId } = useParams();
    const [portfolioIds, setResPortfolioIds] = useState(portfolioId.split(','))

    const [showPortfolioEditor, setShowPortfilioEditor] = useState(false);

    const [currencyGroups, setCurrencyGroups] = useState({});
    const [industryGroups, setIndustryGroups] = useState({});
    const [sectorsGroups, setSectorsGroups] = useState({});

    const [selectedCurrency, setSelectedCurrency] = useState('USD');

    useEffect(() => {
        setResPortfolioIds(portfolioId.split(','))
    }, [portfolioId])

    const loadCurrencyRate = async (from, to) => {
        let response = await fetch(`api/currency/${from}/${to}`, {
            method: 'GET',
        })
        let rate = await response.json();
        return {
            from: from,
            to: to,
            rate: rate
        };
    }

    const loadCurrencyRates = useCallback(async () => {
        const currencies = ['USD', 'EUR', 'RUB'];
        let rates = {};
        let promises = [];
        for (let i = 0; i < currencies.length; ++i) {
            let ci = currencies[i];
            rates[ci] = {};
            for (let j = i; j < currencies.length; ++j) {
                let cj = currencies[j];
                if (i === j) {
                    rates[ci][cj] = 1;
                } else {
                    let promise = loadCurrencyRate(ci, cj);
                    promises.push(promise);
                }
            }
        }

        let results = await Promise.all(promises);
        for (let result of results) {
            const { from, to, rate } = result;
            rates[from][to] = rate;
            rates[to][from] = 1 / rate;
        }

        return rates;
    }, [])

    const handleNewClose = () => {
        setShowNewDialog(false);
        setAddHoldingsCompany(null);
        setAddHoldingsPrice(0);
        setAddHoldingsQuantity(1);
        setAddHoldingsCommission(0);
        setAddHoldingsComment('');
        setCurTransactionId(null);
    }    

    const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);

    const handleHoldingsClose = () => {
        setShowHoldingsDialog(false);
        setTransactionsItem(null);
    }
    const handleHoldingsShow = () => setShowHoldingsDialog(true);

    function getYYYYMMDDDate(date) {
        return date.toISOString().substring(0, 10);
    }

    const loadPrice = async (company) => {
        let response = await fetch(`api/yahoofinance/price/${company.ticker}`, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
            }
        });
        let price = await response.json();
        company.price = price;
    }

    const loadAllPrices = async (companies) => {
        let url = 'api/yahoofinance/prices?';
        for (let company of companies) {
            url += `symbols=${company.ticker}&`;
        }

        let response = await fetch(url, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
            }
        });
        let prices = await response.json();
        return prices;
        // companies.map(c => c.price = prices[c.ticker]);
    }

    const loadDividends = useCallback(async (companies) => {
        let url = `api/account/getDividends?`;

        for (let pid of portfolioIds) {
            url += `ids=${pid}&`;
        }
        for (let company of companies) {
            url += `symbols=${company.ticker}&`;
        }


        let response = await fetch(url, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                'Authorization': 'Bearer ' + cookies.jwt
            }
        });

        let result = await response.json();
        console.log('market values', result.mktValues);
        setMktValues(result.mktValues);
        return result.dividends;
    }, [portfolioIds, cookies.jwt])

    const loadPortfolio = useCallback(async () => {
        if (!cookies.jwt) return;

        const ids = portfolioIds.reduce((str, id) => `${str}ids=${id}&`, "");
        let response = await fetch(`api/account/portfolio?${ids}`, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                'Authorization': 'Bearer ' + cookies.jwt
            },
        });
        let portfolio = await response.json();
        console.log('portfolio', portfolio);
        return portfolio;
    }, [portfolioIds, cookies.jwt]);
   
    const addUpdateHoldings = async (id) => {
        await fetch('api/account/addUpdateTransaction', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + cookies.jwt
            },
            body: JSON.stringify({
                id: id,
                portfolioId: portfolioId,
                companyTicker: addHoldingsCompany.ticker,
                quantity: addHoldingsQuantity,
                price: addHoldingsPrice,
                commission: addHoldingsCommission,
                date: addHoldingsDate,
                type: addHoldingsType,
                comment: addHoldingsComment
            })
        });
    }


    useEffect(() => {
        (async () => {
            setIsLoading(true);
            let promises = [loadPortfolio(), loadCurrencyRates()];
            const [portfolio, rates] = await Promise.all(promises);
            setPortfolios(portfolio.portfolios);
            setCommisions(portfolio.commissions);
            setSelectedCurrency(portfolio.portfolios[0].currency);
            setPortfolioTransactions(portfolio.transactions);

            setPortfolioHoldings(portfolio.holdings);
            setCurrencyRates(rates);
            setIsLoading(false);

            let pricedHoldings = [...portfolio.holdings];
            let t0 = performance.now();
            let [prices, dividends] = await Promise.all([loadAllPrices(pricedHoldings), loadDividends(pricedHoldings)]);
            for (let ph of pricedHoldings) {
                ph.price = prices[ph.ticker];
                ph.dividends = dividends[ph.ticker]
            }
            let t1 = performance.now();
            console.log('all prices time', t1 - t0);
            setPortfolioHoldings(pricedHoldings);

            // promises = [...pricedHoldings.map(item => loadPrice(item)), ...pricedHoldings.map(item => loadDividends(item))]
            // await Promise.all(promises);
            // setPortfolioHoldings(pricedHoldings);


        })()
    }, [loadPortfolio, loadCurrencyRates, loadDividends])

    const handleAddUpdateHoldings = () => {
        (async () => {

            let id = curTransactionId;
            handleNewClose();

            if (showHoldingsDialog) {
                setIsTransactionsLoading(true);
                await addUpdateHoldings(id);
                let transactions = await loadTransactions(transactionsItem.ticker);
                setTransactions(transactions);
                setIsTransactionsLoading(false);


                let portfolio = await loadPortfolio();
                setPortfolios(portfolio.portfolios);
                setCommisions(portfolio.commissions);
                setPortfolioHoldings(portfolio.holdings);
                setSelectedCurrency(portfolio.portfolios[0].currency);
                setPortfolioTransactions(portfolio.transactions);

                let pricedHoldings = [...portfolio.holdings];
                let [prices, dividends] = await Promise.all([loadAllPrices(pricedHoldings), loadDividends(pricedHoldings)]);
                for (let ph of pricedHoldings) {
                    ph.price = prices[ph.ticker];
                    ph.dividends = dividends[ph.ticker];
                }
                setPortfolioHoldings(pricedHoldings);

                return;
            }

            setIsLoading(true);
            await addUpdateHoldings(id);
            let portfolio = await loadPortfolio();
            setPortfolios(portfolio.portfolios);
            setCommisions(portfolio.commissions);
            setPortfolioHoldings(portfolio.holdings);
            setSelectedCurrency(portfolio.portfolios[0].currency);
            setPortfolioTransactions(portfolio.transactions);
            setIsLoading(false);

            let pricedHoldings = [...portfolio.holdings];
            let [prices, dividends] = await Promise.all([loadAllPrices(pricedHoldings), loadDividends(pricedHoldings)]);
            for (let ph of pricedHoldings) {
                ph.price = prices[ph.ticker];
                ph.dividends = dividends[ph.ticker];
            }
            setPortfolioHoldings(pricedHoldings);
        })();
    }

    const loadTransactions = async (ticker) => {
        let url = `api/account/portfolio/${ticker}?`;
        for (let pid of portfolioIds) {
            url += `ids=${pid}&`
        }
        console.log(url);

        let response = await fetch(url, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                'Authorization': 'Bearer ' + cookies.jwt
            },
        });
        let transactions = await response.json();
        console.log('trans', transactions)
        return transactions;
    }

    const handleShowTransactions = (item) => {
        (async () => {
            handleHoldingsShow(true);
            setIsTransactionsLoading(true);
            setTransactionsItem(item);
            let transactions = await loadTransactions(item.ticker);
            setTransactions(transactions);
            setIsTransactionsLoading(false);
        })()
    }

    const handleAddHoldings = () => {
        if (transactionsItem) {
            let ahCompanies = companies.filter(c => c.ticker === transactionsItem.ticker);
            if (ahCompanies.length === 1) {
                setAddHoldingsCompany(ahCompanies[0]);
            }
            setAddHoldingsPrice(transactionsItem.price.regularMarketPrice.raw);
        }
        setShowNewDialog(true);
    }

    const handleEditTransaction = (t) => {
        setAddHoldingsCompany(t.company);
        setCurTransactionId(t.id);

        setAddHoldingsType(t.transactionType.type)
        setAddHoldingsPrice(t.price);
        setAddHoldingsQuantity(t.quantity);
        setAddHoldingsCommission(t.commission);
        setAddHoldingsComment(t.comment);
        setAddHoldingsDate(t.date.substring(0, 10));

        setShowNewDialog(true);
    }

    const handleDeleteTransaction = async (t) => {
        setIsTransactionsLoading(true);
        await fetch(`api/account/deleteTransaction`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + cookies.jwt
            },
            body: JSON.stringify({ id: t.id })
        });
        let transactions = await loadTransactions(t.company.ticker);
        setTransactions(transactions);
        setIsTransactionsLoading(false);


        let portfolio = await loadPortfolio();
        setPortfolios(portfolio.portfolios);
        setCommisions(portfolio.commissions);
        setPortfolioHoldings(portfolio.holdings);
        setSelectedCurrency(portfolio.portfolios[0].currency);
        setPortfolioTransactions(portfolio.transactions);

        let pricedHoldings = [...portfolio.holdings];
        let [prices, dividends] = await Promise.all([loadAllPrices(pricedHoldings), loadDividends(pricedHoldings)]);
        for (let ph of pricedHoldings) {
            ph.price = prices[ph.ticker];
            ph.dividends = dividends[ph.ticker];
        }
        setPortfolioHoldings(pricedHoldings);
    }

    const getAvgPrice = (item) => (item.amount / item.quantity).toFixed(2);

    const getDaysChangePlusPercent = (item) => `${item.price.regularMarketChange.fmt} (${item.price.regularMarketChangePercent.fmt})`

    const getMarketValue = (item) => (item.price.regularMarketPrice.raw * item.quantity);

    const getDaysPL = (item) => item.price.regularMarketChange.raw * item.quantity;
    const getDaysPLPlusPerncet = (item) => `${getDaysPL(item).toFixed(2)} (${item.price.regularMarketChangePercent.fmt})`;

    const getUnrealizedPL = (item) => item.price.regularMarketPrice.raw * item.quantity - item.amount;
    const getUnrealizedPLPercent = (item) => `${(getUnrealizedPL(item) / item.amount * 100).toFixed(2)}%`;
    const getUnrealizedPLPlusPercent = (item) => `${getUnrealizedPL(item).toFixed(2)} (${getUnrealizedPLPercent(item)})`


    const getOverallPL = (item) => (getUnrealizedPL(item) + item.closedAmount + item.dividends);
    const getOverallPLPercent = (item) => `${((getUnrealizedPL(item) + item.closedAmount + item.dividends) / item.totalAmount * 100).toFixed(2)}%`;
    // const getOverallPLPlusPercent = (item) => `${getOverallPL(item).toFixed(2)} (${getOverallPLPercent(item)})`


    const getPortfolioCurrencyValue = useCallback((value, valueCurrency) => {
        return portfolios ? value * currencyRates[valueCurrency][selectedCurrency] : null;
    }, [currencyRates, portfolios, selectedCurrency])

    const handleAddHoldingsCompanyChanged = (company) => {
        setAddHoldingsCompany(company);
        let pricedCompany = { ticker: company.ticker };
        loadPrice(pricedCompany).then(() => setAddHoldingsPrice(pricedCompany.price.regularMarketPrice.raw));
    }

    const handleAddHoldingsPriceChanged = (price) => {
        setAddHoldingsPrice(price);
    }

    useEffect(() => {
        if (!portfolios || portfolios.length > 1) return;
        let com = +(addHoldingsPrice * addHoldingsQuantity * portfolios[0].defaultCommissionPercent / 100.0).toFixed(2);
        setAddHoldingsCommission(com);
    }, [addHoldingsPrice, addHoldingsQuantity, portfolios])

    useEffect(() => {
        if (!portfolioHoldings || !currencyRates || portfolioHoldings.some(ph => !ph.price)) {
            setCurrencyGroups({});
            setIndustryGroups({});
            setSectorsGroups({});
            return;
        }

        let cg = {};
        let ig = {};
        let sg = {};

        for (let ph of portfolioHoldings) {
            if (ph.quantity <= 0) continue;
            let value = getPortfolioCurrencyValue(ph.price.regularMarketPrice.raw * ph.quantity, ph.currency);
            if (!cg.hasOwnProperty(ph.currency)) {
                cg[ph.currency] = value;
            } else {
                cg[ph.currency] += value;
            }

            if (ph.industry) {
                if (!ig.hasOwnProperty(ph.industry)) {
                    ig[ph.industry] = value;
                } else {
                    ig[ph.industry] += value;
                }
            }

            if (ph.sector) {
                if (!sg.hasOwnProperty(ph.sector)) {
                    sg[ph.sector] = value;
                } else {
                    sg[ph.sector] += value;
                }
            }
        }
        setCurrencyGroups(cg);
        setIndustryGroups(ig);
        setSectorsGroups(sg);


    }, [portfolioHoldings, currencyRates, getPortfolioCurrencyValue])//TODO: currency changed


    const getPortfolioMarketValue = () => {
        if (!portfolioHoldings || !currencyRates) return null;
        if (portfolioHoldings.some(ph => !ph.price)) return null;
        if (portfolioHoldings.some(ph => ph.currency !== ph.price.currency)) throw new Error("WRONG CURRENCY");
        return portfolioHoldings.reduce((sum, ph) =>
            sum + getPortfolioCurrencyValue(getMarketValue(ph), ph.currency), 0).toFixed(2);
    };

    const getPortfolioDaysPl = () => {
        if (!portfolioHoldings || !currencyRates) return null;
        if (portfolioHoldings.some(ph => !ph.price)) return null;
        return portfolioHoldings.reduce((sum, ph) =>
            sum + getPortfolioCurrencyValue(getDaysPL(ph), ph.currency), 0).toFixed(2);
    };

    const getPortfolioUnrealizedPl = () => {
        if (!portfolioHoldings || !currencyRates) return null;
        if (portfolioHoldings.some(ph => !ph.price)) return null;
        return portfolioHoldings.reduce((sum, ph) =>
            sum + getPortfolioCurrencyValue(getUnrealizedPL(ph), ph.currency), 0).toFixed(2);
    }

    const getPortfolioOverallPl = () => {
        if (!portfolioHoldings || !currencyRates) return null;
        if (portfolioHoldings.some(ph => !ph.price)) return null;
        return portfolioHoldings.reduce((sum, ph) =>
            sum + getPortfolioCurrencyValue(getOverallPL(ph), ph.currency), 0).toFixed(2);
    }

    const getSumPortfolioCommissions = () => {
        if (!commissions || !currencyRates) return null;
        let sumCommission = 0;
        for (let currency of Object.keys(commissions)) {
            sumCommission += getPortfolioCurrencyValue(commissions[currency], currency);
        }
        return sumCommission.toFixed(2);
    }

    const getPortfolioDividends = () => {
        if (!portfolioHoldings || !currencyRates) return null;
        if (portfolioHoldings.some(ph => ph.dividends === undefined)) return null;
        return portfolioHoldings.reduce((sum, ph) =>
            sum + getPortfolioCurrencyValue(ph.dividends, ph.currency), 0).toFixed(2);
    }

    const savePortfolioEdit = (name, defaultCommissionPercent) => {
        (async () => {
            setIsLoading(true);
            await fetch('api/account/addUpdatePortfolio', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    'Authorization': 'Bearer ' + cookies.jwt
                },
                body: JSON.stringify({ id: portfolioId, name, defaultCommissionPercent })
            });
            let portfolio = await loadPortfolio();
            setPortfolios(portfolio.portfolios);
            setCommisions(portfolio.commissions);

            setIsLoading(false);
            setShowPortfilioEditor(false);
        })()
    }

    const handleCurrencyChanged = (currency) => {
        setSelectedCurrency(currency);
        if (portfolioIds.length === 1) {
            (async () => {
                setIsLoading(true);
                await fetch('api/account/addUpdatePortfolio', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json;charset=utf-8",
                        'Authorization': 'Bearer ' + cookies.jwt
                    },
                    body: JSON.stringify({ id: portfolioId, currency: currency })
                });
                let portfolio = await loadPortfolio();
                setPortfolios(portfolio.portfolios);
                setCommisions(portfolio.commissions);

                setIsLoading(false);
            })()
        }
    }

    const getDateMktValue = (date) => {
        let value = 0;
        const allCurrenciesValues = mktValues[date];
        let currencies = Object.keys(allCurrenciesValues);
        for (let currency of currencies) {
            value += getPortfolioCurrencyValue(allCurrenciesValues[currency], currency);
        }
        return value;
    }

    const currencies = ['USD', 'EUR', 'RUB'];

    let addHoldingsButton = <Button variant='success' onClick={handleAddHoldings} disabled={portfolioIds.length > 1}>
        Add Holdings
    </Button>

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : <div>
            <div className='statementHeader'>
                {portfolios.length === 1 && (
                    <div className='d-flex'>
                        <h1>{portfolios[0].name}</h1>
                        <Button variant='outline-warning' className='ml-2' onClick={() => setShowPortfilioEditor(true)}>Edit</Button>
                    </div>
                )}
                {portfolios.length > 1 && (
                    <div>
                        <h1>
                            {portfolios.map(p => <Link key={p.id} to={{ pathname: `/portfolio/p=${p.id}` }}> {p.name} </Link>)}
                        </h1>
                    </div>
                )}
            </div>
            <div className='row'>
                <div className='col-sm-4'>
                    <div className='d-flex'>
                        <div>Currency</div>
                        <div className='ml-auto'>
                            <select value={selectedCurrency} onChange={(e) => handleCurrencyChanged(e.target.value)}>
                                {currencies.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className='d-flex'>
                        <div>Market Value</div>
                        <div className='ml-auto'>{getPortfolioMarketValue() ?? <em>Loading...</em>}</div>
                    </div>
                    <div className='d-flex'>
                        <div>{"Day's P&L"}</div>
                        <div className='ml-auto'>{getPortfolioDaysPl() ?? <em>Loading...</em>}</div>
                    </div>
                    <div className='d-flex'>
                        <div>{"Unrealized P&L"}</div>
                        <div className='ml-auto'>{getPortfolioUnrealizedPl() ?? <em>Loading...</em>}</div>
                    </div>
                    <div className='d-flex'>
                        <div>{"Overall P&L"}</div>
                        <div className='ml-auto'>{getPortfolioOverallPl() ?? <em>Loading...</em>}</div>
                    </div>
                    <div className='d-flex'>
                        <div>{"Comission"}</div>
                        <div className='ml-auto'>{getSumPortfolioCommissions() ?? <em>Loading...</em>}</div>
                    </div>
                    <div className='d-flex'>
                        <div>{"Dividends"}</div>
                        <div className='ml-auto'>{getPortfolioDividends() ?? <em>Loading...</em>}</div>
                    </div>
                </div>
                <div className='col-sm-4'>
                    <Line
                        data={{
                            labels: Object.keys(mktValues),
                            datasets: [
                                {
                                    label: 'Market Value',
                                    backgroundColor: `rgba(0, 110, 30, 1)`,
                                    borderColor: `rgba(0, 110, 30, 1)`,

                                    pointBorderColor: 'rgba(0,0,0,1)',
                                    pointBackgroundColor: 'rgba(156, 255, 174,1)',
                                    pointRadius: 2.5,
                                    pointBorderWidth: 1,

                                    pointHoverRadius: 5,
                                    pointHoverBorderWidth: 2,

                                    pointHitRadius: 10,

                                    data: Object.keys(mktValues).map(date => getDateMktValue(date)),
                                }
                            ],

                        }}
                        options={{
                            scales: {
                                xAxes: [{
                                    type: 'time',
                                    distribution: 'linear',

                                }]
                            }
                        }}
                    />
                </div>
            </div>

            <Tabs defaultActiveKey="holdings">
                <Tab eventKey="holdings" title="Holdings">
                    <div className='mt-2'>{addHoldingsButton}</div>
                    <Table className='table-sm portfolioTable' bordered hover variant='light'>
                        <thead>
                            <tr>
                                <th className='centered'>Symbol</th>
                                <th>Name</th>
                                <th className='centered'>Sector</th>
                                <th className='centered'>Industry</th>
                                <th className='centered'>Currency</th>
                                <th className='centered'>Price</th>
                                <th className='centered'>Day's Price Change</th>
                                <th className='centered'>Mkt Value</th>
                                <th className='centered'>Avg Price</th>
                                <th className='centered'>Quantity</th>
                                <th className='centered'>Amount</th>
                                <th className='centered'>{"Day's P&L"}</th>
                                <th className='centered'>{"Unrealized P&L"}</th>
                                <th className='centered'>Dividends</th>
                                <th className='centered'>{"Closed P&L"}</th>
                                <th className='centered'>{"Overall P&L"}</th>
                                <th className='centered'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolioHoldings.filter(ph => ph.quantity !== 0).map(item =>
                                <tr key={item.ticker}>
                                    <td className='centered'><Link to={`/stock?t=${item.ticker}`}>{item.ticker}</Link></td>
                                    <td>{item.price ? item.price.shortName : <em>Loading...</em>}</td>
                                    <td className='centered'>{item.sector}</td>
                                    <td className='centered'>{item.industry}</td>
                                    <td className='centered'>{item.currency}</td>
                                    <td className='centered'>{item.price ? item.price.regularMarketPrice.fmt : <em>Loading...</em>}</td>
                                    <td className={`centered ${item.price && item.price.regularMarketChange.raw > 0
                                        ? 'up'
                                        : item.price && item.price.regularMarketChange.raw < 0
                                            ? 'down'
                                            : ''}`}>
                                        {item.price ? getDaysChangePlusPercent(item) : <em>Loading...</em>}
                                    </td>
                                    <td className='centered'>{item.price ? getMarketValue(item).toFixed(2) : <em>Loading...</em>}</td>
                                    <td className='centered'>{getAvgPrice(item)}</td>
                                    <td className='centered'>{item.quantity}</td>
                                    <td className='centered'>{item.amount.toFixed(2)}</td>
                                    <td className={`centered ${item.price && item.price.regularMarketChange.raw > 0
                                        ? 'up'
                                        : item.price && item.price.regularMarketChange.raw < 0
                                            ? 'down'
                                            : ''}`}>
                                        {item.price ? getDaysPLPlusPerncet(item) : <em>Loading...</em>}
                                    </td>
                                    <td className={`centered ${item.price && getUnrealizedPL(item) > 0
                                        ? 'up'
                                        : item.price && getUnrealizedPL(item) < 0
                                            ? 'down'
                                            : ''}`}>
                                        {item.price ? getUnrealizedPLPlusPercent(item) : <em>Loading...</em>}
                                    </td>

                                    <td className='centered'>
                                        {item.dividends !== undefined ? (item.dividends).toFixed(2) : <em>Loading...</em>}
                                    </td>

                                    <td className={`centered ${item.closedAmount > 0
                                        ? 'up'
                                        : item.closedAmount < 0
                                            ? 'down'
                                            : ''}`}>
                                        {(item.closedAmount).toFixed(2)}
                                    </td>

                                    <td className={`centered ${item.price && getOverallPL(item) > 0
                                        ? 'up'
                                        : item.price && getOverallPL(item) < 0
                                            ? 'down'
                                            : ''}`}>
                                        {item.price ? getOverallPL(item).toFixed(2) : <em>Loading...</em>}
                                    </td>

                                    <td className='centered'>
                                        <Button variant='outline-warning' onClick={() => handleShowTransactions(item)}>
                                            Holdings
                                        </Button>
                                    </td>
                                </tr>)}
                        </tbody>
                    </Table>


                </Tab>
                <Tab eventKey="closed" title="Closed">
                    <Table className='table-sm portfolioTable' bordered hover variant='light'>
                        <thead>
                            <tr>
                                <th className='centered'>Symbol</th>
                                <th>Name</th>
                                <th className='centered'>Sector</th>
                                <th className='centered'>Industry</th>
                                <th className='centered'>Currency</th>
                                <th className='centered'>Price</th>
                                <th className='centered'>Day's Price Change</th>
                                <th className='centered'>Dividends</th>
                                <th className='centered'>{"Closed P&L"}</th>
                                <th className='centered'>{"Overall P&L"}</th>
                                <th className='centered'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolioHoldings.filter(ph => ph.quantity === 0).map(item =>
                                <tr key={item.ticker}>
                                    <td className='centered'><Link to={`/stock?t=${item.ticker}`}>{item.ticker}</Link></td>
                                    <td>{item.price ? item.price.shortName : <em>Loading...</em>}</td>
                                    <td className='centered'>{item.sector}</td>
                                    <td className='centered'>{item.industry}</td>
                                    <td className='centered'>{item.currency}</td>
                                    <td className='centered'>{item.price ? item.price.regularMarketPrice.fmt : <em>Loading...</em>}</td>
                                    <td className={`centered ${item.price && item.price.regularMarketChange.raw > 0
                                        ? 'up'
                                        : item.price && item.price.regularMarketChange.raw < 0
                                            ? 'down'
                                            : ''}`}>
                                        {item.price ? getDaysChangePlusPercent(item) : <em>Loading...</em>}
                                    </td>

                                    <td className='centered'>
                                        {item.dividends !== undefined ? (item.dividends).toFixed(2) : <em>Loading...</em>}
                                    </td>

                                    <td className={`centered ${item.closedAmount > 0
                                        ? 'up'
                                        : item.closedAmount < 0
                                            ? 'down'
                                            : ''}`}>
                                        {(item.closedAmount).toFixed(2)}
                                    </td>

                                    <td className={`centered ${item.price && getOverallPL(item) > 0
                                        ? 'up'
                                        : item.price && getOverallPL(item) < 0
                                            ? 'down'
                                            : ''}`}>
                                        {item.price ? getOverallPL(item).toFixed(2) : <em>Loading...</em>}
                                    </td>

                                    <td className='centered'>
                                        <Button variant='outline-warning' onClick={() => handleShowTransactions(item)}>
                                            Holdings
                                </Button>
                                    </td>
                                </tr>)}
                        </tbody>
                    </Table>


                </Tab>

                <Tab eventKey="history" title="Transaction History">
                    <Table className='table-sm' bordered hover variant='light'>
                        <thead>
                            <tr>
                                <th className='centered'>Date</th>
                                <th className='centered'>Symbol</th>
                                <th>Name</th>
                                <th className='centered'>Side</th>
                                <th className='centered'>Price</th>
                                <th className='centered'>Quantity</th>
                                <th className='centered'>Amount</th>
                                <th className='centered'>Commission</th>
                                <th className='centered'>Comment</th>
                                <th className='centered'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolioTransactions.map(t =>
                                <tr key={t.id}>
                                    <td className='centered'>{t.date.substring(0, 10)}</td>
                                    <td className='centered'>{t.company.ticker}</td>  
                                    <td>{t.company.shortName}</td>  
                                    <td className='centered'>{t.transactionType.type}</td>
                                    <td className='centered'>{t.price}</td>
                                    <td className='centered'>{t.quantity}</td>
                                    <td className='centered'>{(t.price * t.quantity).toFixed(2)}</td>
                                    <td className='centered'>{t.commission}</td>
                                    <td className='centered'>{t.comment}</td>
                                    <td className='centered'>
                                        <Button variant='outline-warning mr-1' disabled={portfolios.length > 1}
                                            onClick={() => handleEditTransaction(t)}>Edit</Button>
                                        <Button variant='outline-danger ml-1'
                                            onClick={() => handleDeleteTransaction(t)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>)}
                        </tbody>
                    </Table>
                </Tab>


                <Tab eventKey="analysis" title="Analysis">
                    <div className='row'>
                        <div className='col-sm-6'>

                            <Doughnut data={{
                                labels: portfolioHoldings.filter(ph => ph.quantity > 0).map(p => p.ticker),
                                datasets: [{
                                    data: portfolioHoldings.filter(ph => ph.quantity > 0).map(p => p.price
                                        ? getPortfolioCurrencyValue(p.price.regularMarketPrice.raw * p.quantity, p.currency).toFixed(2)
                                        : 0)
                                }]
                            }}
                                options={{
                                    plugins: {
                                        colorschemes: {
                                            scheme: 'brewer.Paired12'
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className='col-sm-6'>

                            <Doughnut data={{
                                labels: Object.keys(currencyGroups),
                                datasets: [{
                                    data: Object.keys(currencyGroups).map(currency => currencyGroups[currency].toFixed(2))
                                }]
                            }}
                                options={{
                                    plugins: {
                                        colorschemes: {
                                            scheme: 'brewer.Paired12'
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className='row'>
                        <div className='col-sm-6'>

                            <Doughnut data={{
                                labels: Object.keys(sectorsGroups),
                                datasets: [{
                                    data: Object.keys(sectorsGroups).map(sector => sectorsGroups[sector].toFixed(2))
                                }]
                            }}
                                options={{
                                    plugins: {
                                        colorschemes: {
                                            scheme: 'brewer.Paired12'
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className='col-sm-6'>

                            <Doughnut data={{
                                labels: Object.keys(industryGroups),
                                datasets: [{
                                    data: Object.keys(industryGroups).map(industry => industryGroups[industry].toFixed(2))
                                }]
                            }}
                                options={{
                                    plugins: {
                                        colorschemes: {
                                            scheme: 'brewer.Paired12'
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                </Tab>
            </Tabs>



        </div>


    return (
        <div>

            {content}

            <Modal show={showNewDialog} onHide={handleNewClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Holdings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className='d-flex'>
                            <Form.Label>Side</Form.Label>
                            <div className='ml-auto'>
                                <ToggleButtonGroup type='radio' value={addHoldingsType} name='periodType' onChange={(v) => setAddHoldingsType(v)}>
                                    <ToggleButton value='Buy' variant='outline-success'>Buy</ToggleButton>
                                    <ToggleButton value='Sell' variant='outline-danger'>Sell</ToggleButton>
                                </ToggleButtonGroup>
                            </div>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Symbol</Form.Label>
                            <Select
                                className='searchFormSelect'
                                options={companies}
                                value={addHoldingsCompany}
                                onChange={handleAddHoldingsCompanyChanged}

                                getOptionLabel={company => `${company.exchange} : ${company.ticker} - ${company.shortName}`}
                                getOptionValue={company => company}

                                filterOption={createFilter({ ignoreAccents: false })} // this makes all the difference!
                                components={{ MenuList }}
                            />

                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Price</Form.Label>
                            <Form.Control type='number' min={0} step='any'
                                value={addHoldingsPrice} onChange={(e) => handleAddHoldingsPriceChanged(+e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control type='number' min={1}
                                value={addHoldingsQuantity} onChange={(e) => setAddHoldingsQuantity(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Commission</Form.Label>
                            <Form.Control type='number' min={0} step='any'
                                value={addHoldingsCommission} onChange={(e) => setAddHoldingsCommission(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Date</Form.Label>
                            <Form.Control type='date'
                                value={addHoldingsDate} onChange={(e) => setAddHoldingsDate(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Comment</Form.Label>
                            <Form.Control type='text'
                                value={addHoldingsComment} onChange={(e) => setAddHoldingsComment(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleNewClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddUpdateHoldings} disabled={addHoldingsCompany === null}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showHoldingsDialog} onHide={handleHoldingsClose} className='transactionsModal'>
                <Modal.Header closeButton>
                    <Modal.Title>{`${transactionsItem !== null ? transactionsItem.ticker : ''} Holdings`}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        isTransactionsLoading
                            ? <p><em>Loading...</em></p>
                            : <div>
                                {addHoldingsButton}
                                <Table className='table-sm' bordered hover variant='light'>
                                    <thead>
                                        <tr>
                                            <th className='centered'>Date</th>
                                            <th className='centered'>Side</th>
                                            <th className='centered'>Price</th>
                                            <th className='centered'>Quantity</th>
                                            <th className='centered'>Amount</th>
                                            <th className='centered'>Commission</th>
                                            <th className='centered'>Comment</th>
                                            <th className='centered'></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(t =>
                                            <tr key={t.id}>
                                                <td className='centered fit'>{t.date.substring(0, 10)}</td>
                                                <td className='centered fit'>{t.transactionType.type}</td>
                                                <td className='centered fit'>{t.price}</td>
                                                <td className='centered fit'>{t.quantity}</td>
                                                <td className='centered fit'>{(t.price * t.quantity).toFixed(2)}</td>
                                                <td className='centered fit'>{t.commission}</td>
                                                <td className='centered fit'>{t.comment}</td>
                                                <td className='centered fit'>
                                                    <Button variant='outline-warning mr-1' disabled={portfolios.length > 1}
                                                        onClick={() => handleEditTransaction(t)}>Edit</Button>
                                                    <Button variant='outline-danger ml-1'
                                                        onClick={() => handleDeleteTransaction(t)}>
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>)}
                                    </tbody>
                                </Table>
                            </div>
                    }

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleHoldingsClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {portfolios && portfolios.length === 1 &&
                <PortfolioEditor show={showPortfolioEditor} handleClose={() => setShowPortfilioEditor(false)}
                    handleSave={savePortfolioEdit}
                    name={portfolios[0].name}
                    defaultCommissionPercent={portfolios[0].defaultCommissionPercent}
                />
            }
        </div>
    )
}