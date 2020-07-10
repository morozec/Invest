import React, { useState, useEffect, useCallback } from 'react'
import { Button, ToggleButtonGroup, ToggleButton, Modal, Form, Table, Tabs, Tab, Col, Row } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import 'chartjs-plugin-colorschemes';
import 'chartjs-plugin-datalabels';
import Select, { createFilter } from 'react-select';
import { MenuList } from './helpers/MenuList';
import { useCookies } from 'react-cookie';
import { PortfolioEditor } from './PortfolioEditor';
import { Line } from 'react-chartjs-2';
import _ from 'lodash'

export function Portfolio(props) {
    const { companies } = props;
    const [cookies] = useCookies(['jwt']);
    const [isLoading, setIsLoading] = useState(true);

    const [allPortfolios, setAllPortfolios] = useState([]);
    const [allCurrencies, setAllCurrencies] = useState([]);

    const [portfolios, setPortfolios] = useState(null);
    const [commissions, setCommisions] = useState(null);
    const [portfolioHoldings, setPortfolioHoldings] = useState(null);
    const [mktValues, setMktValues] = useState({});
    const [overallPL, setOverallPL] = useState({});
    const [portfolioTransactions, setPortfolioTransactions] = useState(null);
    const [cashTransations, setCashTransactions] = useState(null);

    const [showNewDialog, setShowNewDialog] = useState(false);
    const [showHoldingsDialog, setShowHoldingsDialog] = useState(false);

    const [addHoldingsPortfolioId, setAddHoldingsPortfolioId] = useState(null);
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
    const [showDividendTaxSettings, setShowDividendTaxSetings] = useState(false);

    const [currencyGroups, setCurrencyGroups] = useState({});
    const [industryGroups, setIndustryGroups] = useState({});
    const [sectorsGroups, setSectorsGroups] = useState({});

    const [portfolioDefaultDividendTaxPercent, setPortfolioDefaultDividendTaxPercent] = useState(0);
    const [dividendTaxSettings, setDividendTaxSettings] = useState([]);
    const [dividendTaxSettingsCopy, setDividendTaxSettingsCopy] = useState([]);
    const [portfolioDefaultDividendTaxPercentCopy, setPortfolioDefaultDividendTaxPercentCopy] = useState(0);

    const [curCashTransactionId, setCurCashTransactionId] = useState(null);
    const [showAddCash, setShowAddCash] = useState(false);
    const [addCashPortfolioId, setAddCashPortfolioId] = useState(null);
    const [addCashCurrencyId, setAddCashCurrencyId] = useState(-1);
    const [addCashAmount, setAddCashAmount] = useState(0);
    const [addCashDate, setAddCashDate] = useState(getYYYYMMDDDate(new Date()));
    const [addCashIsAdd, setAddCashIsAdd] = useState(true);

    const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);

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

    const loadAllCurrencies = useCallback(async () => {
        let response = await fetch(`api/account/currencies`, {
            method: 'GET',
        })
        let currencies = await response.json();
        console.log('all curr', currencies);
        return currencies;
    }, [])

    const loadCurrencyRates = useCallback(async (currencies) => {
        let rates = {};
        let promises = [];
        for (let i = 0; i < currencies.length; ++i) {
            let ci = currencies[i].name;
            rates[ci] = {};
            for (let j = i; j < currencies.length; ++j) {
                let cj = currencies[j].name;
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
        console.log('divs container', result);
        setMktValues(result.mktValues);
        setOverallPL(result.overallPL);
        return result.dividends;
    }, [portfolioIds, cookies.jwt])


    const loadAllPortfolios = useCallback(async () => {
        if (!cookies.jwt) return;

        let response = await fetch('api/account/portfolios', {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                'Authorization': 'Bearer ' + cookies.jwt
            }
        });
        let allPortfolios = await response.json();
        return allPortfolios;

    }, [cookies.jwt]);

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

    const loadCashTransactions = useCallback(async () => {
        if (!cookies.jwt) return;

        const ids = portfolioIds.reduce((str, id) => `${str}ids=${id}&`, "");
        let response = await fetch(`api/account/cashTransactions?${ids}`, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                'Authorization': 'Bearer ' + cookies.jwt
            },
        });
        let cashTransactions = await response.json();
        return cashTransactions;
    }, [portfolioIds, cookies.jwt])

    const addUpdateHoldings = async (id) => {
        await fetch('api/account/addUpdateTransaction', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + cookies.jwt
            },
            body: JSON.stringify({
                id: id,
                portfolioId: addHoldingsPortfolioId,
                companyTicker: addHoldingsCompany.ticker,
                quantity: addHoldingsQuantity,
                price: addHoldingsPrice,
                commission: addHoldingsCommission,
                date: addHoldingsDate,
                type: addHoldingsType,
                comment: addHoldingsComment,
            })
        });
    }


    useEffect(() => {
        (async () => {
            setIsLoading(true);
            let promises = [loadPortfolio(), loadAllPortfolios(), loadAllCurrencies(), loadCashTransactions()];
            const [portfolio, allPortfolios, allCurrencies, cashTransactions] = await Promise.all(promises);
            setPortfolios(portfolio.portfolios);
            setCommisions(portfolio.commissions);
            setSelectedCurrencyId(portfolio.portfolios[0].currency.id);
            setPortfolioTransactions(portfolio.transactions);

            setPortfolioHoldings(portfolio.holdings);
            initDividendTaxSettings(portfolio.holdings, portfolio.portfolios[0].defaultDividendTaxPercent);

            setAllPortfolios(allPortfolios);
            setAllCurrencies(allCurrencies);
            setAddHoldingsPortfolioId(portfolio.portfolios[0].id);
            setAddCashPortfolioId(portfolio.portfolios[0].id);
            setCashTransactions(cashTransactions);
            setAddCashCurrencyId(portfolio.portfolios[0].currency.id);
            setIsLoading(false);

            let pricedHoldings = [...portfolio.holdings];
            let t0 = performance.now();
            let [rates, prices, dividends] = await Promise.all(
                [loadCurrencyRates(allCurrencies), loadAllPrices(pricedHoldings), loadDividends(pricedHoldings)]);
            setCurrencyRates(rates);
            for (let ph of pricedHoldings) {
                ph.price = prices[ph.ticker];
                ph.dividends = dividends[ph.ticker]
            }
            let t1 = performance.now();
            console.log('all prices time', t1 - t0);
            setPortfolioHoldings(pricedHoldings);

        })()
    }, [loadPortfolio, loadCurrencyRates, loadDividends, loadAllPortfolios, loadAllCurrencies, loadCashTransactions])

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
                initDividendTaxSettings(portfolio.holdings, portfolio.portfolios[0].defaultDividendTaxPercent);
                setSelectedCurrencyId(portfolio.portfolios[0].currency.id);
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
            initDividendTaxSettings(portfolio.holdings, portfolio.portfolios[0].defaultDividendTaxPercent);
            setSelectedCurrencyId(portfolio.portfolios[0].currency.id);
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

        setAddHoldingsPortfolioId(t.portfolio.id);
        setAddHoldingsType(t.transactionType.type);
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
        initDividendTaxSettings(portfolio.holdings, portfolio.portfolios[0].defaultDividendTaxPercent);
        setSelectedCurrencyId(portfolio.portfolios[0].currency.id);
        setPortfolioTransactions(portfolio.transactions);

        let pricedHoldings = [...portfolio.holdings];
        let [prices, dividends] = await Promise.all([loadAllPrices(pricedHoldings), loadDividends(pricedHoldings)]);
        for (let ph of pricedHoldings) {
            ph.price = prices[ph.ticker];
            ph.dividends = dividends[ph.ticker];
        }
        setPortfolioHoldings(pricedHoldings);
    }

    const handleEditCashTransaction = (t) => {
        setCurCashTransactionId(t.id);
        setAddCashPortfolioId(t.portfolio.id);
        setAddCashAmount(Math.abs(t.amount));
        setAddCashDate(t.date.substring(0, 10));
        setAddCashCurrencyId(t.currency.id);
        setAddCashIsAdd(t.amount >= 0 ? true : false);

        setShowAddCash(true);
    }

    const handleDeleteCashTransaction = async (t) => {
        await fetch(`api/account/deleteCashTransaction`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + cookies.jwt
            },
            body: JSON.stringify({ id: t.id })
        });
        const [cashTransactions] = await Promise.all([loadCashTransactions(), loadDividends(portfolioHoldings)]);
        setCashTransactions(cashTransactions);
    }

    const getSumDividends = (dividends) => dividends.reduce((sum, cur) => sum + cur.value, 0);

    const getAvgPrice = (item) => (item.amount / item.quantity).toFixed(2);

    const getDaysChangePlusPercent = (item) => `${item.price.regularMarketChange.fmt} (${item.price.regularMarketChangePercent.fmt})`

    const getMarketValue = (item) => (item.price.regularMarketPrice.raw * item.quantity);

    const getDaysPL = (item) => item.price.regularMarketChange.raw * item.quantity;
    const getDaysPLPlusPerncet = (item) => `${getDaysPL(item).toFixed(2)} (${item.price.regularMarketChangePercent.fmt})`;

    const getUnrealizedPL = (item) => item.price.regularMarketPrice.raw * item.quantity - item.amount;
    const getUnrealizedPLPercent = (item) => `${(getUnrealizedPL(item) / item.amount * 100).toFixed(2)}%`;
    const getUnrealizedPLPlusPercent = (item) => `${getUnrealizedPL(item).toFixed(2)} (${getUnrealizedPLPercent(item)})`


    const getOverallPL = (item) => (getUnrealizedPL(item) + item.closedAmount + getSumDividends(item.dividends));
    const getOverallPLPercent = (item) => `${((getUnrealizedPL(item) + item.closedAmount + getSumDividends(item.dividends)) / item.totalAmount * 100).toFixed(2)}%`;
    // const getOverallPLPlusPercent = (item) => `${getOverallPL(item).toFixed(2)} (${getOverallPLPercent(item)})`

    const getCurrencyById = useCallback(
        (id) => allCurrencies.filter(c => c.id === id)[0],
        [allCurrencies]
    )

    const getPortfolioCurrencyValue = useCallback((value, valueCurrency) => {
        const selectedCurrency = getCurrencyById(selectedCurrencyId);
        return portfolios && currencyRates ? value * currencyRates[valueCurrency][selectedCurrency.name] : null;
    }, [currencyRates, portfolios, getCurrencyById, selectedCurrencyId])

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
        const holdingsMarketValue = portfolioHoldings.reduce((sum, ph) =>
            sum + getPortfolioCurrencyValue(getMarketValue(ph), ph.currency), 0);
        const cashMarketValue = allCurrencies.reduce((sum, currency) => 
            sum + getPortfolioCurrencyValue(getCashAmount(currency.id), currency.name), 0);
        return (holdingsMarketValue + cashMarketValue).toFixed(2)
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
            sum + getPortfolioCurrencyValue(getSumDividends(ph.dividends), ph.currency), 0).toFixed(2);
    }

    const getPortfolioDividendHistory = () => {
        if (!portfolioHoldings || !currencyRates) return [];
        if (portfolioHoldings.some(ph => ph.dividends === undefined)) return [];
        let history = [];
        for (let ph of portfolioHoldings) {
            history = [...history, ...ph.dividends.map(div => ({
                date: div.date,
                value: div.value,
                ticker: ph.ticker,
                shortName: ph.price ? ph.price.shortName : <em>Loading...</em>,
                currency: ph.currency
            }))];
        }
        history.sort((h1, h2) => h1.date < h2.date ? 1 : -1);
        return history;
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

    const handleCurrencyChanged = (currencyId) => {
        setSelectedCurrencyId(currencyId);
        if (portfolioIds.length === 1) {
            (async () => {
                setIsLoading(true);
                await fetch('api/account/addUpdatePortfolio', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json;charset=utf-8",
                        'Authorization': 'Bearer ' + cookies.jwt
                    },
                    body: JSON.stringify({ id: portfolioId, currencyId: currencyId })
                });
                let portfolio = await loadPortfolio();
                setPortfolios(portfolio.portfolios);
                setCommisions(portfolio.commissions);

                setIsLoading(false);
            })()
        }
    }

    const getDateValue = (dateValue) => {
        let value = 0;
        let currencies = Object.keys(dateValue);
        for (let currency of currencies) {
            value += getPortfolioCurrencyValue(dateValue[currency], currency);
        }
        return value;
    }

    const initDividendTaxSettings = (portfolioHoldings, defaultDividendTaxPercent) => {
        let settings = portfolioHoldings.map(ph => ({
            ticker: ph.ticker,
            name: ph.companyName,
            isSpecialDividendTax: ph.dividendTaxPercent !== null,
            dividendTaxPercent: ph.dividendTaxPercent !== null ? ph.dividendTaxPercent : defaultDividendTaxPercent
        }));
        setPortfolioDefaultDividendTaxPercent(defaultDividendTaxPercent);
        setDividendTaxSettings(settings);
    }

    const handleShowDividendTaxSetings = () => {
        console.log('dts', dividendTaxSettings)
        setDividendTaxSettingsCopy(_.cloneDeep(dividendTaxSettings));
        setPortfolioDefaultDividendTaxPercentCopy(portfolioDefaultDividendTaxPercent);
        setShowDividendTaxSetings(true);
    }

    const handleIsSpecialDividendTaxChanged = (e, index) => {
        const newSettings = [...dividendTaxSettingsCopy];
        newSettings[index].isSpecialDividendTax = e.target.checked;
        if (!e.target.checked) {
            newSettings[index].dividendTaxPercent = portfolios[0].defaultDividendTaxPercent;
        }
        setDividendTaxSettingsCopy(newSettings);
    }

    const handleDefaultDividendTaxChanged = (e) => {
        let value = +e.target.value;
        const newSettings = [...dividendTaxSettingsCopy];
        for (let ns of newSettings) {
            if (!ns.isSpecialDividendTax) {
                ns.dividendTaxPercent = value;
            }
        }

        setPortfolioDefaultDividendTaxPercentCopy(value);
        setDividendTaxSettingsCopy(newSettings);
    }

    const handleDividendTaxPercentChanged = (e, index) => {
        const newSettings = [...dividendTaxSettingsCopy];
        newSettings[index].dividendTaxPercent = +e.target.value;
        setDividendTaxSettingsCopy(newSettings);
    }

    const saveSpecialDividendTaxes = async () => {
        setShowDividendTaxSetings(false);
        setIsLoading(true);
        await fetch('api/account/updateDividendTaxes', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + cookies.jwt
            },
            body: JSON.stringify({
                portfolioId: portfolios[0].id,
                defaultDividendTaxPercent: portfolioDefaultDividendTaxPercentCopy,
                dividendTaxDtos: dividendTaxSettingsCopy.filter(ds => ds.isSpecialDividendTax).map(ds => ({
                    companyTicker: ds.ticker,
                    dividendTaxPercent: ds.dividendTaxPercent
                }))
            })
        });
        setDividendTaxSettings(dividendTaxSettingsCopy);
        setPortfolioDefaultDividendTaxPercent(portfolioDefaultDividendTaxPercentCopy);

        let newPortfolioHoldings = [...portfolioHoldings];
        let dividends = await loadDividends(newPortfolioHoldings);
        for (let ph of newPortfolioHoldings) {
            ph.dividends = dividends[ph.ticker]
        }
        setPortfolioHoldings(newPortfolioHoldings);

        setIsLoading(false);
    }

    const saveAddCash = async () => {
        setIsLoading(true);
        await fetch('api/account/addUpdateCashTransaction', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + cookies.jwt
            },
            body: JSON.stringify({
                id: curCashTransactionId,
                portfolioId: addCashPortfolioId,
                currencyId: addCashCurrencyId,
                amount: addCashIsAdd ? addCashAmount : -addCashAmount,
                date: addCashDate
            })
        });
        clearAndCloseAddCash();
        const [cashTransactions] = await Promise.all([loadCashTransactions(), loadDividends(portfolioHoldings)]);
        setCashTransactions(cashTransactions);
        setIsLoading(false);
    }

    const clearAndCloseAddCash = () => {
        setShowAddCash(false);
        setAddCashPortfolioId(portfolios[0].id)
        setAddCashAmount(0);
        setAddCashIsAdd(true);
        setCurCashTransactionId(null);
    }

    const getCashAmount = (currencyId) => {
        let transactions = cashTransations.filter(t => t.currency.id === currencyId);
        let sum = transactions.reduce((res, cur) => res + cur.amount, 0);
        return sum;
    }

    let addHoldingsButton = <Button variant='success' onClick={handleAddHoldings}>Add Holdings</Button>
    let addCashButton = <Button variant='success' onClick={() => setShowAddCash(true)}>Add Cash</Button>

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : <div>
            <div className='statementHeader'>
                {portfolios.length === 1 && (
                    <div className='d-flex'>
                        <h1>{portfolios[0].name}</h1>
                        <Button variant='outline-warning' className='mx-2' onClick={() => setShowPortfilioEditor(true)}>Edit</Button>
                        <Button variant='outline-warning' className='mx-2' onClick={handleShowDividendTaxSetings}>Dividend Tax Settings</Button>
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
                            <select value={selectedCurrencyId} onChange={(e) => handleCurrencyChanged(+e.target.value)}>
                                {allCurrencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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

                    <h5>Cash</h5>
                    {allCurrencies.map(c => (
                        <div className='d-flex' key={c.id}>
                            <div>{`${c.name} (${c.symbol})`}</div>
                            <div className='ml-auto'>{getCashAmount(c.id)}</div>
                        </div>
                    ))}
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

                                    data: Object.keys(mktValues).map(date => getDateValue(mktValues[date])),
                                }
                            ],

                        }}
                        options={{
                            scales: {
                                xAxes: [{
                                    type: 'time',
                                    distribution: 'linear',

                                }]
                            },
                            plugins: {
                                datalabels: {
                                    display: false
                                }
                            }
                        }}
                    />
                </div>

                <div className='col-sm-4'>
                    <Line
                        data={{
                            labels: Object.keys(overallPL),
                            datasets: [
                                {
                                    label: 'Overall P&L',
                                    backgroundColor: `rgba(0, 110, 30, 1)`,
                                    borderColor: `rgba(0, 110, 30, 1)`,

                                    pointBorderColor: 'rgba(0,0,0,1)',
                                    pointBackgroundColor: 'rgba(156, 255, 174,1)',
                                    pointRadius: 2.5,
                                    pointBorderWidth: 1,

                                    pointHoverRadius: 5,
                                    pointHoverBorderWidth: 2,

                                    data: Object.keys(overallPL).map(date => getDateValue(overallPL[date])),
                                }
                            ],

                        }}
                        options={{
                            scales: {
                                xAxes: [{
                                    type: 'time',
                                    distribution: 'linear',

                                }]
                            },
                            plugins: {
                                datalabels: {
                                    display: false
                                }
                            }
                        }}
                    />
                </div>
            </div>

            <Tabs defaultActiveKey="holdings">
                <Tab eventKey="holdings" title="Holdings">
                    <div className='mt-2'>{addHoldingsButton}{addCashButton}</div>
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
                                    <td>{item.companyName}</td>
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
                                        {item.dividends !== undefined ? (getSumDividends(item.dividends)).toFixed(2) : <em>Loading...</em>}
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
                                        {item.dividends !== undefined ? (getSumDividends(item.dividends)).toFixed(2) : <em>Loading...</em>}
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

                <Tab eventKey="transactionHistory" title="Transaction History">
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
                                <th className='centered'>Currency</th>
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
                                    <td className='centered'>{t.company.currency}</td>
                                    <td className='centered'>{t.comment}</td>
                                    <td className='centered'>
                                        <Button variant='outline-warning mr-1'
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

                <Tab eventKey="cashTransactionHistory" title="Cash Transaction History">
                    <Table className='table-sm' bordered hover variant='light'>
                        <thead>
                            <tr>
                                <th className='centered'>Date</th>
                                <th className='centered'>Amount</th>
                                <th className='centered'>Currency</th>
                                <th className='centered'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cashTransations.map(t =>
                                <tr key={t.id}>
                                    <td className='centered'>{t.date.substring(0, 10)}</td>
                                    <td className='centered'>{t.amount}</td>
                                    <td className='centered'>{t.currency.symbol}</td>
                                    <td className='centered'>
                                        <Button variant='outline-warning mr-1'
                                            onClick={() => handleEditCashTransaction(t)}>Edit</Button>
                                        <Button variant='outline-danger ml-1'
                                            onClick={() => handleDeleteCashTransaction(t)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>)}
                        </tbody>
                    </Table>
                </Tab>


                <Tab eventKey="dividendHistory" title="Dividend History">
                    <Table className='table-sm' bordered hover variant='light'>
                        <thead>
                            <tr>
                                <th className='centered'>Date</th>
                                <th className='centered'>Symbol</th>
                                <th>Name</th>
                                <th className='centered'>Amount</th>
                                <th className='centered'>Currency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getPortfolioDividendHistory().map((divItem, index) =>
                                <tr key={index}>
                                    <td className='centered'>{divItem.date.substring(0, 10)}</td>
                                    <td className='centered'>{divItem.ticker}</td>
                                    <td>{divItem.shortName}</td>
                                    <td className='centered'>{(divItem.value).toFixed(2)}</td>
                                    <td className='centered'>{divItem.currency}</td>
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
                                    layout: {
                                        padding: {
                                            top: 25,
                                            bottom: 25,
                                        }
                                    },
                                    legend: {
                                        display: false
                                    },
                                    plugins: {
                                        datalabels: {
                                            color: 'black',
                                            anchor: 'end',
                                            align: 'end',
                                            display: 'auto',
                                            formatter: (value, ctx) => {
                                                let dataArr = ctx.chart.data.datasets[0].data;
                                                let sum = dataArr.reduce((sum, cur) => sum + +cur, 0);
                                                let label = ctx.chart.data.labels[ctx.dataIndex];
                                                let percentage = (+value * 100 / sum);
                                                return `${label}: ${percentage.toFixed(2)}%`;
                                            },
                                        }
                                    },

                                    tooltips: {
                                        callbacks: {
                                            label: function (tooltipItem, data) {
                                                //get the concerned dataset
                                                var dataset = data.datasets[tooltipItem.datasetIndex];
                                                //calculate the total of this data set
                                                var total = dataset.data.reduce((sum, cur) => sum + +cur, 0);
                                                var curValue = +dataset.data[tooltipItem.index];
                                                var percent = +(curValue / total * 100).toFixed(2);
                                                return `${curValue}${getCurrencyById(selectedCurrencyId).symbol} (${percent}%)`;
                                            },
                                            title: function (tooltipItem, data) {
                                                return data.labels[tooltipItem[0].index];
                                            }
                                        }
                                    },

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
                                    layout: {
                                        padding: {
                                            top: 25,
                                            bottom: 25,
                                        }
                                    },
                                    legend: {
                                        display: false
                                    },
                                    plugins: {
                                        datalabels: {
                                            color: 'black',
                                            anchor: 'end',
                                            align: 'end',
                                            display: 'auto',
                                            formatter: (value, ctx) => {
                                                let dataArr = ctx.chart.data.datasets[0].data;
                                                let sum = dataArr.reduce((sum, cur) => sum + +cur, 0);
                                                let label = ctx.chart.data.labels[ctx.dataIndex];
                                                let percentage = (+value * 100 / sum);
                                                return `${label}: ${percentage.toFixed(2)}%`;
                                            },
                                        }
                                    },

                                    tooltips: {
                                        callbacks: {
                                            label: function (tooltipItem, data) {
                                                //get the concerned dataset
                                                var dataset = data.datasets[tooltipItem.datasetIndex];
                                                //calculate the total of this data set
                                                var total = dataset.data.reduce((sum, cur) => sum + +cur, 0);
                                                var curValue = +dataset.data[tooltipItem.index];
                                                var percent = +(curValue / total * 100).toFixed(2);
                                                return `${curValue}${getCurrencyById(selectedCurrencyId).symbol} (${percent}%)`;
                                            },
                                            title: function (tooltipItem, data) {
                                                return data.labels[tooltipItem[0].index];
                                            }
                                        }
                                    },

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
                                    layout: {
                                        padding: {
                                            top: 25,
                                            bottom: 25,
                                        }
                                    },
                                    legend: {
                                        display: false
                                    },
                                    plugins: {
                                        datalabels: {
                                            color: 'black',
                                            anchor: 'end',
                                            align: 'end',
                                            display: 'auto',
                                            formatter: (value, ctx) => {
                                                let dataArr = ctx.chart.data.datasets[0].data;
                                                let sum = dataArr.reduce((sum, cur) => sum + +cur, 0);
                                                let label = ctx.chart.data.labels[ctx.dataIndex];
                                                let percentage = (+value * 100 / sum);
                                                return `${label}: ${percentage.toFixed(2)}%`;
                                            },
                                        }
                                    },

                                    tooltips: {
                                        callbacks: {
                                            label: function (tooltipItem, data) {
                                                //get the concerned dataset
                                                var dataset = data.datasets[tooltipItem.datasetIndex];
                                                //calculate the total of this data set
                                                var total = dataset.data.reduce((sum, cur) => sum + +cur, 0);
                                                var curValue = +dataset.data[tooltipItem.index];
                                                var percent = +(curValue / total * 100).toFixed(2);
                                                return `${curValue}${getCurrencyById(selectedCurrencyId).symbol} (${percent}%)`;
                                            },
                                            title: function (tooltipItem, data) {
                                                return data.labels[tooltipItem[0].index];
                                            }
                                        }
                                    },

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
                                    layout: {
                                        padding: {
                                            top: 25,
                                            bottom: 25,
                                        }
                                    },
                                    legend: {
                                        display: false
                                    },
                                    plugins: {
                                        datalabels: {
                                            color: 'black',
                                            anchor: 'end',
                                            align: 'end',
                                            display: 'auto',
                                            formatter: (value, ctx) => {
                                                let dataArr = ctx.chart.data.datasets[0].data;
                                                let sum = dataArr.reduce((sum, cur) => sum + +cur, 0);
                                                let label = ctx.chart.data.labels[ctx.dataIndex];
                                                let percentage = (+value * 100 / sum);
                                                return `${label}: ${percentage.toFixed(2)}%`;
                                            },
                                        }
                                    },

                                    tooltips: {
                                        callbacks: {
                                            label: function (tooltipItem, data) {
                                                //get the concerned dataset
                                                var dataset = data.datasets[tooltipItem.datasetIndex];
                                                //calculate the total of this data set
                                                var total = dataset.data.reduce((sum, cur) => sum + +cur, 0);
                                                var curValue = +dataset.data[tooltipItem.index];
                                                var percent = +(curValue / total * 100).toFixed(2);
                                                return `${curValue}${getCurrencyById(selectedCurrencyId).symbol} (${percent}%)`;
                                            },
                                            title: function (tooltipItem, data) {
                                                return data.labels[tooltipItem[0].index];
                                            }
                                        }
                                    },

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
                            <Form.Label>Portfolio</Form.Label>
                            <Form.Control as='select' value={addHoldingsPortfolioId} onChange={(e) => setAddHoldingsPortfolioId(e.target.value)}>
                                {allPortfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Control>
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
                                                    <Button variant='outline-warning mr-1'
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
                    defaultDividendTaxPercent={portfolios[0].defaultDividendTaxPercent}
                />
            }

            {portfolios && portfolios.length === 1 &&

                <Modal show={showDividendTaxSettings} onHide={() => setShowDividendTaxSetings(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Dividend Tax Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group as={Row}>
                            <Form.Label column sm="6">Default Dividend Tax (%)</Form.Label>
                            <Col sm="6">
                                <Form.Control type='number' step='any'
                                    value={portfolioDefaultDividendTaxPercentCopy}
                                    onChange={handleDefaultDividendTaxChanged} />
                            </Col>
                        </Form.Group>

                        <Table className='table-sm' bordered hover variant='light'>
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th className='centered'>Special Dividend Tax</th>
                                    <th className='centered'>Dividend Tax (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dividendTaxSettingsCopy.map((item, index) => (
                                    <tr key={item.ticker}>
                                        <td>{`${item.name} (${item.ticker})`}</td>
                                        <td className='centered'>
                                            <Form.Check type='checkbox'
                                                checked={item.isSpecialDividendTax}
                                                onChange={(e) => handleIsSpecialDividendTaxChanged(e, index)}>
                                            </Form.Check>
                                        </td>
                                        <td className='centered'>
                                            <Form.Control type='number' step='any' disabled={!item.isSpecialDividendTax}
                                                value={item.dividendTaxPercent}
                                                onChange={(e) => handleDividendTaxPercentChanged(e, index)}>
                                            </Form.Control>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDividendTaxSetings(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary"
                            onClick={() => saveSpecialDividendTaxes()}>
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>
            }

            <Modal show={showAddCash} onHide={clearAndCloseAddCash}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Cash</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form.Group>
                        <Form.Label>Portfolio</Form.Label>
                        <Form.Control as='select' value={addCashPortfolioId} onChange={(e) => setAddCashPortfolioId(e.target.value)}>
                            {allPortfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Currency</Form.Label>
                        <Form.Control as='select' value={addCashCurrencyId} onChange={(e) => setAddCashCurrencyId(e.target.value)}>
                            {allCurrencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Amount</Form.Label>
                        <Form.Control type='number' step='any' min={0}
                            value={addCashAmount} onChange={(e) => setAddCashAmount(e.target.value)}>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Date</Form.Label>
                        <Form.Control type='date'
                            value={addCashDate} onChange={(e) => setAddCashDate(e.target.value)} />
                    </Form.Group>

                    <Form.Group className='d-flex'>
                        <Form.Label>Type</Form.Label>
                        <div className='ml-auto'>
                            <ToggleButtonGroup type='radio' name='isAdd'
                                value={addCashIsAdd} onChange={(v) => setAddCashIsAdd(v)}>
                                <ToggleButton value={true} variant='outline-success'>Deposit</ToggleButton>
                                <ToggleButton value={false} variant='outline-danger'>Withdrawal</ToggleButton>
                            </ToggleButtonGroup>
                        </div>
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={clearAndCloseAddCash}>
                        Cancel
                        </Button>
                    <Button variant="primary"
                        onClick={() => saveAddCash()}>
                        Ok
                        </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}