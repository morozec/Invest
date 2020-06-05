import React, { useState, useEffect, useCallback } from 'react'
import { Button, Modal, Table, Form } from 'react-bootstrap'

export function PortfoliosList(props) {
    const { userData } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [portfolios, setPortfolios] = useState([]);
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState('New Portfolio');

    const handleClose = () => setShowNewDialog(false);
    const handleShow = () => setShowNewDialog(true);

    const loadPortfolios = useCallback(async () => {
        if (userData === null) return;

        // const loadPrice = async (company) => {
        //     let response = await fetch(`api/yahoofinance/price/${company.ticker}`, {
        //         method: 'GET',
        //         headers: {
        //             "Accept": "application/json",
        //         }
        //     });
        //     let result = await response.json();
        //     company.price = result.raw;
        // }

      
            let response = await fetch('api/account/portfolios', {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                    'Authorization': 'Bearer ' + userData.token
                }
            });
            let portfolios = await response.json();
            setPortfolios(portfolios);

            // let pricedCompanies = [...companies];
            // let promises = pricedCompanies.map(c => loadPrice(c));
            // await Promise.all(promises);
            // setCompanies(pricedCompanies);

    }, [userData]);

    const addPortfolio = async (name) => {
        let response = await fetch('api/account/addPortfolio', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + userData.token
            },
            body: JSON.stringify({ name })
        });
    }

    const deletePortfolio = async (id) => {
        let response = await fetch('api/account/deletePortfolio', {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + userData.token
            },
            body: JSON.stringify({ id })
        });
    }

    useEffect(() => {
        setIsLoading(true);
        loadPortfolios().then(() => setIsLoading(false));
    }, [loadPortfolios])

    const handleAddPortfolio = () => {
        (async () => {
            setIsLoading(true);
            await addPortfolio(newPortfolioName);
            await loadPortfolios();
            setIsLoading(false);
            handleClose();
        })();
    }

    const handleDeletePortfolio = (id) => {
        (async () => {
            setIsLoading(true);
            await deletePortfolio(id);
            await loadPortfolios();
            setIsLoading(false);
        })();
    }

    let addButton = <Button onClick={handleShow} variant='success'>Add portfolio</Button>

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : portfolios.length === 0
            ? <div>
                <p>Portfolios list is empty</p>
                {addButton}
            </div>
            : <div>
                <Table className='table-sm' bordered hover variant='light'>
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
                </Table>
                {addButton}
            </div>

    return (
        <div>
            {content}

            <Modal show={showNewDialog} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New Portfolio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Portfolio name</Form.Label>
                            <Form.Control type='text' placeholder="Enter portfolio name"
                                value={newPortfolioName} onChange={(e) => setNewPortfolioName(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddPortfolio} disabled={newPortfolioName === ''}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}