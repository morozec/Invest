import React, { useState, useEffect, useCallback } from 'react'
import { Button, ToggleButtonGroup, ToggleButton, Modal, Form, Table } from 'react-bootstrap';

export function Portfolio(props) {
    const { userData } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [portfolio, setPortfolio] = useState(null);
    const [showNewDialog, setShowNewDialog] = useState(false);

    const [addHoldingsType, setAddHoldingsType] = useState('Buy');
    const [addHoldingsSymbol, setAddHoldingsSymbol] = useState('');
    const [addHoldingsPrice, setAddHoldingsPrice] = useState(0);
    const [addHoldingsQuantity, setAddHoldingsQuantity] = useState(1);
    const [addHoldingsCommission, setAddHoldingsCommission] = useState(0);
    const [addHoldingsDate, setAddHoldingsDate] = useState(new Date().toISOString().substring(0, 10));

    const portfolioId = props.location.state.id

    const handleClose = () => setShowNewDialog(false);
    const handleShow = () => setShowNewDialog(true);

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
        console.log(portfolio);
        return portfolio;
    }, [userData]);

    const addHoldings = async (name) => {
        console.log(addHoldingsDate, new Date(addHoldingsDate));
        let response = await fetch('api/account/addTransaction', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + userData.token
            },
            body: JSON.stringify({
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
            let portfolio = await loadPortfolio();
            setPortfolio(portfolio);
            setIsLoading(false);

            let pricedPortfolio = [...portfolio];
            let promises = pricedPortfolio.map(item => loadPrice(item));
            await Promise.all(promises);
            setPortfolio(pricedPortfolio);
        })()
    }, [loadPortfolio])

    const handleAddHoldings = () => {
        (async () => {
            setIsLoading(true);
            await addHoldings();
            let portfolio = await loadPortfolio();
            setPortfolio(portfolio);
            setIsLoading(false);
            handleClose();
        })();
    }

    const getAvgPrice = (item) => item.avgPrice.toFixed(2);

    const getDaysChangePlusPercent = (item) => `${item.price.regularMarketChange.fmt} (${item.price.regularMarketChangePercent.fmt})`

    const getMarketValue = (item) => item.price.regularMarketPrice.raw * item.quantity;

    const getDaysPL = (item) => item.price.regularMarketChange.raw * item.quantity;
    const getDaysPLPlusPerncet = (item) => `${getDaysPL(item).toFixed(2)} (${item.price.regularMarketChangePercent.fmt})`;

    const getUnrealizedPL = (item) => (item.price.regularMarketPrice.raw - item.avgPrice) * item.quantity;
    const getUnrealizedPLPercent = (item) => `${(getUnrealizedPL(item) / item.amount * 100).toFixed(2)}%`;
    const getUnrealizedPLPlusPercent = (item) => `${getUnrealizedPL(item).toFixed(2)} (${getUnrealizedPLPercent(item)})`


    let addHoldingsButton = <Button variant='success' onClick={handleShow}>Add Holdings</Button>

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : <div>
            <div className='statementHeader'>
                <h1>name TODO!!!</h1>
            </div>
            {addHoldingsButton}
            <Table className='table-sm' bordered hover variant='light'>
                <caption>Holdings</caption>
                <thead>
                    <tr>
                        <th className='centered'>Symbol</th>
                        <th>Name</th>
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
                    {portfolio.map(item =>
                        <tr key={item.ticker}>
                            <td className='centered'>{item.ticker}</td>
                            <td>{item.price ? item.price.shortName : <em>Loading...</em>}</td>
                            <td className='centered'>{item.price ? item.price.regularMarketPrice.fmt : <em>Loading...</em>}</td>
                            <td className='centered'>{item.price ? getDaysChangePlusPercent(item) : <em>Loading...</em>}</td>
                            <td className='centered'>{item.price ? getMarketValue(item) : <em>Loading...</em>}</td>
                            <td className='centered'>{getAvgPrice(item)}</td>
                            <td className='centered'>{item.quantity}</td>
                            <td className='centered'>{item.amount}</td>
                            <td className='centered'>{item.price ? getDaysPLPlusPerncet(item) : <em>Loading...</em>}</td>
                            <td className='centered'>{item.price ? getUnrealizedPLPlusPercent(item) : <em>Loading...</em>}</td>
                        </tr>)}
                </tbody>
            </Table>
        </div>


    return (
        <div>

            {content}

            <Modal show={showNewDialog} onHide={handleClose}>
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
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddHoldings} disabled={addHoldingsSymbol === ''}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}