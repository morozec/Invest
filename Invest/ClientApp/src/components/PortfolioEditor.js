import React, { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap';

export function PortfolioEditor(props) {

    const { show, handleClose, handleSave, name, defaultCommissionPercent, defaultDividendTaxPercent } = props;
    const [portfolioName, setPortfolioName] = useState(name ? name : 'New Portfilio');    
    const [portfolioDefaultCommissionPercent, setPortfolioDefaultCommissionPercent] = useState(
        defaultCommissionPercent ? defaultCommissionPercent : 0);
    const [portfolioDefaultDividendTaxPercent, setPortfolioDefaultDividendTaxPercent] = useState(
        defaultDividendTaxPercent ? defaultDividendTaxPercent : 0);

    useEffect(() => {
        setPortfolioName(name ? name : 'New Portfilio');
        setPortfolioDefaultCommissionPercent(defaultCommissionPercent ? defaultCommissionPercent : 0);
        setPortfolioDefaultDividendTaxPercent(defaultDividendTaxPercent ? defaultDividendTaxPercent : 0);

    }, [show, name, defaultCommissionPercent, defaultDividendTaxPercent])

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
                        <Form.Label>Default Commission (%)</Form.Label>
                        <Form.Control type='number' step='any'
                            value={portfolioDefaultCommissionPercent} onChange={(e) => setPortfolioDefaultCommissionPercent(+e.target.value)} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Default Dividend Tax (%)</Form.Label>
                        <Form.Control type='number' step='any'
                            value={portfolioDefaultDividendTaxPercent} onChange={(e) => setPortfolioDefaultDividendTaxPercent(+e.target.value)} />
                    </Form.Group>                       
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary"
                    onClick={() => handleSave(portfolioName, portfolioDefaultCommissionPercent, portfolioDefaultDividendTaxPercent)}
                    disabled={portfolioName === ''}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    )
}