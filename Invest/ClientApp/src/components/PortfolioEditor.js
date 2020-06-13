import React, { useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap';

export function PortfolioEditor(props) {

    const { show, handleClose, handleSave, name, currency } = props;
    const [portfolioName, setPortfolioName] = useState(name ? name : 'New Portfilio');
    const currencies = ['USD', 'RUB', 'EUR'];
    const [portfolioCurrency, setPortfolioCurrency] = useState(currency ? currency : currencies[0]);

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>New Portfolio</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Portfolio name</Form.Label>
                        <Form.Control type='text' placeholder="Enter portfolio name"
                            value={portfolioName} onChange={(e) => setPortfolioName(e.target.value)} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Currency</Form.Label>
                        <Form.Control as='select' value={portfolioCurrency} onChange={(e) => setPortfolioCurrency(e.target.value)}>
                            {currencies.map(c => <option key={c}>{c}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary"
                    onClick={() => handleSave(portfolioName, portfolioCurrency)}
                    disabled={portfolioName === ''}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    )
}