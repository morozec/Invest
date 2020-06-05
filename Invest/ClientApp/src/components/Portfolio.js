import React, { useState, useEffect, useCallback } from 'react'
import { Button, ToggleButtonGroup, ToggleButton, Modal, Form } from 'react-bootstrap';

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
        setPortfolio(portfolio);
    }, [userData]);

    const addHoldings = async (name) => {
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
                data: addHoldingsDate,
                type: addHoldingsType
            })
        });
    }


    useEffect(() => {
        setIsLoading(true);
        loadPortfolio().then(() => setIsLoading(false));
    }, [loadPortfolio])

    const handleAddHoldings = () => {
        (async () => {
            setIsLoading(true);
            await addHoldings();
            await loadPortfolio();
            setIsLoading(false);
            handleClose();
        })();
    }


    let addHoldingsButton = <Button variant='success' onClick={handleShow}>Add Holdings</Button>

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : <div>
            <div className='statementHeader'>
                <h1>{portfolio.name}</h1>
            </div>
            {addHoldingsButton}
            {/* <Table className='table-sm' bordered hover variant='light'>
                <caption>Portfolios</caption>
                <thead>
                    <tr>
                        <th>Portfolio Name</th>
                        <th className='centered'>Market Value</th>
                        <th className='centered'>Day Change</th>
                        <th className='centered'>Day Change %</th>
                        <th className='centered'>Total Change</th>
                        <th className='centered'>Total Change %</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {portfolios.map(p =>
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td className='centered'>{p.marketValue !== undefined ? p.marketValue : <em>Loading...</em>}</td>
                            <td className='centered'>{p.dayChange !== undefined ? p.dayChange : <em>Loading...</em>}</td>
                            <td className='centered'>{p.dayChangePercent !== undefined ? p.dayChangePercent : <em>Loading...</em>}</td>
                            <td className='centered'>{p.totalChange !== undefined ? p.totalChange : <em>Loading...</em>}</td>
                            <td className='centered'>{p.totalChangePercent !== undefined ? p.totalChangePercent : <em>Loading...</em>}</td>
                            <td className='centered'><Button variant='outline-danger'
                                onClick={() => handleDeletePortfolio(p.id)}>Delete</Button></td>
                        </tr>)}
                </tbody>
            </Table> */}
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