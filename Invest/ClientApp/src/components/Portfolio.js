import React, { useState, useEffect, useCallback } from 'react'
import { Button, ToggleButtonGroup, ToggleButton, Modal, Form, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import 'chartjs-plugin-colorschemes';

export function Portfolio(props) {
    const { userData } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [portfolioName, setPortfolioName] = useState(null);
    const [portfolioHoldings, setPortfolioHoldings] = useState(null);
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [showHoldingsDialog, setShowHoldingsDialog] = useState(false);

    const [addHoldingsType, setAddHoldingsType] = useState('Buy');
    const [addHoldingsSymbol, setAddHoldingsSymbol] = useState('');
    const [addHoldingsPrice, setAddHoldingsPrice] = useState(0);
    const [addHoldingsQuantity, setAddHoldingsQuantity] = useState(1);
    const [addHoldingsCommission, setAddHoldingsCommission] = useState(0);
    const [addHoldingsDate, setAddHoldingsDate] = useState(getYYYYMMDDDate(new Date()));

    const [trascationsTicker, setTransactionsTicker] = useState('');
    const [transactions, setTransactions] = useState(null);
    const [curTransactionId, setCurTransactionId] = useState(null);

    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [currencyRates, setCurrencyRates] = useState({})

    const { portfolioId } = useParams();

    const currencies = ['USD', 'RUB', 'EUR'];


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
        for (let result of results){
            const {from, to, rate} = result;
            rates[from][to] = rate;
            rates[to][from] = 1 / rate;
        }

        console.log(rates);
        return rates;
    }, [])

    // useEffect(() => {
    //     loadCurrencyRates();
    // }, [loadCurrencyRates])

    const handleNewClose = () => {
        setShowNewDialog(false);
        setAddHoldingsSymbol('');
        setCurTransactionId(null);
    }
    const handleNewShow = (id = null) => {
        setShowNewDialog(true);
        setAddHoldingsSymbol(trascationsTicker);
        if (id !== null) setCurTransactionId(id);
    }

    const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);

    const handleHoldingsClose = () => {
        setShowHoldingsDialog(false);
        setTransactionsTicker('');
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

    const loadPortfolio = useCallback(async () => {
        if (userData === null) return;

        let response = await fetch(`api/account/portfolio/${portfolioId}`, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                'Authorization': 'Bearer ' + userData.token
            },
        });
        let portfolio = await response.json();
        console.log('portfolio', portfolio);
        return portfolio;
    }, [userData]);

    const addUpdateHoldings = async (id) => {
        console.log(addHoldingsDate, new Date(addHoldingsDate));
        let response = await fetch('api/account/addUpdateTransaction', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + userData.token
            },
            body: JSON.stringify({
                id: id,
                portfolioId: portfolioId,
                companyTicker: addHoldingsSymbol,
                quantity: addHoldingsQuantity,
                price: addHoldingsPrice,
                commission: addHoldingsCommission,
                date: addHoldingsDate,
                type: addHoldingsType
            })
        });
    }


    useEffect(() => {
        (async () => {
            setIsLoading(true);
            let promises = [loadPortfolio(), loadCurrencyRates()];
            const [portfolio, rates] = await Promise.all(promises);
            setPortfolioName(portfolio.name);
            setPortfolioHoldings(portfolio.holdings);
            setCurrencyRates(rates);
            setIsLoading(false);

            let pricedHoldings = [...portfolio.holdings];
            promises = pricedHoldings.map(item => loadPrice(item));
            await Promise.all(promises);
            setPortfolioHoldings(pricedHoldings);
        })()
    }, [loadPortfolio, loadCurrencyRates])

    const handleAddUpdateHoldings = () => {
        (async () => {

            let id = curTransactionId;
            handleNewClose();

            if (showHoldingsDialog) {
                setIsTransactionsLoading(true);
                await addUpdateHoldings(id);
                let transactions = await loadTransactions(trascationsTicker);
                setTransactions(transactions);
                setIsTransactionsLoading(false);


                let portfolio = await loadPortfolio();
                setPortfolioName(portfolio.name);
                setPortfolioHoldings(portfolio.holdings);

                let pricedHoldings = [...portfolio.holdings];
                let promises = pricedHoldings.map(item => loadPrice(item));
                await Promise.all(promises);
                setPortfolioHoldings(pricedHoldings);

                return;
            }

            setIsLoading(true);
            await addUpdateHoldings(id);
            let portfolio = await loadPortfolio();
            setPortfolioName(portfolio.name);
            setPortfolioHoldings(portfolio.holdings);
            setIsLoading(false);

            let pricedHoldings = [...portfolio.holdings];
            let promises = pricedHoldings.map(item => loadPrice(item));
            await Promise.all(promises);
            setPortfolioHoldings(pricedHoldings);
        })();
    }

    const loadTransactions = async (ticker) => {
        let response = await fetch(`api/account/portfolio/${portfolioId}/${ticker}`, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                'Authorization': 'Bearer ' + userData.token
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
            setTransactionsTicker(item.ticker);
            let transactions = await loadTransactions(item.ticker);
            setTransactions(transactions);
            setIsTransactionsLoading(false);
        })()
    }

    const handleEditTransaction = (t) => {
        handleNewShow(t.id);

        setAddHoldingsType(t.transactionType.type)
        setAddHoldingsPrice(t.price);
        setAddHoldingsQuantity(t.quantity);
        setAddHoldingsCommission(t.commission);
        setAddHoldingsDate(t.date.substring(0, 10))
    }

    const handleDeleteTransaction = async (t) => {
        console.log(t);
        setIsTransactionsLoading(true);
        let response = await fetch(`api/account/deleteTransaction`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + userData.token
            },
            body: JSON.stringify({ id: t.id })
        });
        let transactions = await loadTransactions(trascationsTicker);
        setTransactions(transactions);
        setIsTransactionsLoading(false);


        let portfolio = await loadPortfolio();
        setPortfolioName(portfolio.name);
        setPortfolioHoldings(portfolio.holdings);

        let pricedHoldings = [...portfolio.holdings];
        let promises = pricedHoldings.map(item => loadPrice(item));
        await Promise.all(promises);
        setPortfolioHoldings(pricedHoldings);
    }

    const getAvgPrice = (item) => item.avgPrice.toFixed(2);

    const getDaysChangePlusPercent = (item) => `${item.price.regularMarketChange.fmt} (${item.price.regularMarketChangePercent.fmt})`

    const getMarketValue = (item) => (item.price.regularMarketPrice.raw * item.quantity).toFixed(2);

    const getDaysPL = (item) => item.price.regularMarketChange.raw * item.quantity;
    const getDaysPLPlusPerncet = (item) => `${getDaysPL(item).toFixed(2)} (${item.price.regularMarketChangePercent.fmt})`;

    const getUnrealizedPL = (item) => item.price.regularMarketPrice.raw * item.quantity - item.amount;
    const getUnrealizedPLPercent = (item) => `${(getUnrealizedPL(item) / item.amount * 100).toFixed(2)}%`;
    const getUnrealizedPLPlusPercent = (item) => `${getUnrealizedPL(item).toFixed(2)} (${getUnrealizedPLPercent(item)})`

    const handleCurrencyChanged = (e) => {
        setSelectedCurrency(e.target.value);
    }


    const getSelectedCurrencyValue = (value, valueCurrency) => {
        return (value * currencyRates[valueCurrency][selectedCurrency]).toFixed(2);
    }


    let addHoldingsButton = <Button variant='success' onClick={() => handleNewShow()}>Add Holdings</Button>

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : <div>
            <div className='statementHeader'>
                <h1>{portfolioName}</h1>
            </div>

            <div className='portfilioSettings'>
                {addHoldingsButton}
                <Form>
                    <Form.Group>
                        <Form.Label>Currency</Form.Label>
                        <Form.Control as='select' onChange={handleCurrencyChanged}>
                            {currencies.map(c =>
                                <option key={c}>{c}</option>
                            )}
                        </Form.Control>
                    </Form.Group>
                </Form>
            </div>

            <Table className='table-sm portfolioTable' bordered hover variant='light'>
                <caption>Holdings</caption>
                <thead>
                    <tr>
                        <th className='centered'>Symbol</th>
                        <th>Name</th>
                        <th className='centered'>Currency</th>
                        <th className='centered'>Price</th>
                        <th className='centered'>Day's Price Change</th>
                        <th className='centered'>Mkt Value</th>
                        <th className='centered'>Avg Price</th>
                        <th className='centered'>Quantity</th>
                        <th className='centered'>Amount</th>
                        <th className='centered'>{"Day's P&L"}</th>
                        <th className='centered'>{"Unrealized P&L"}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {portfolioHoldings.map(item =>
                        <tr key={item.ticker} className='pointer' onClick={() => handleShowTransactions(item)}>
                            <td className='centered'>{item.ticker}</td>
                            <td>{item.price ? item.price.shortName : <em>Loading...</em>}</td>
                            <td className='centered'>{item.price ? item.price.currency : <em>Loading...</em>}</td>
                            <td className='centered'>{item.price ? item.price.regularMarketPrice.fmt : <em>Loading...</em>}</td>
                            <td className={`centered ${item.price && item.price.regularMarketChange.raw > 0
                                ? 'up'
                                : item.price && item.price.regularMarketChange.raw < 0
                                    ? 'down'
                                    : ''}`}>
                                {item.price ? getDaysChangePlusPercent(item) : <em>Loading...</em>}
                            </td>
                            <td className='centered'>{item.price ? getMarketValue(item) : <em>Loading...</em>}</td>
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
                        </tr>)}
                </tbody>
            </Table>

            <Doughnut data={{
                labels: portfolioHoldings.map(p => p.ticker),
                datasets: [{
                    data: portfolioHoldings.map(p => p.price 
                        ? getSelectedCurrencyValue(p.price.regularMarketPrice.raw * p.quantity, p.price.currency)
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
                            <Form.Control type='text' placeholder="Enter company symbol"
                                value={addHoldingsSymbol} onChange={(e) => setAddHoldingsSymbol(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Price</Form.Label>
                            <Form.Control type='number' min={0} step='any'
                                value={addHoldingsPrice} onChange={(e) => setAddHoldingsPrice(e.target.value)} />
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleNewClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddUpdateHoldings} disabled={addHoldingsSymbol === ''}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showHoldingsDialog} onHide={handleHoldingsClose} className='transactionsModal'>
                <Modal.Header closeButton>
                    <Modal.Title>{`${trascationsTicker} Holdings`}</Modal.Title>
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
                                                <td className='centered fit'>
                                                    <Button variant='outline-warning mr-1' onClick={() => handleEditTransaction(t)}>Edit</Button>
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
        </div>
    )
}