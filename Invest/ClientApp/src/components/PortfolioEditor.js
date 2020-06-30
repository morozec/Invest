import React, { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap';

export function PortfolioEditor(props) {

    const { show, handleClose, handleSave, name, defaultCommissionPercent } = props;
    const [portfolioName, setPortfolioName] = useState(name ? name : 'New Portfilio');    
    const [portfolioDefaultCommissionPercent, setPortfolioDefaultCommissionPercent] = useState(
        defaultCommissionPercent ? defaultCommissionPercent : 0);

    useEffect(() => {
        setPortfolioName(name ? name : 'New Portfilio');
        setPortfolioDefaultCommissionPercent(defaultCommissionPercent ? defaultCommissionPercent : 0);

    }, [show, name, defaultCommissionPercent])

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
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary"
                    onClick={() => handleSave(portfolioName, portfolioDefaultCommissionPercent)}
                    disabled={portfolioName === ''}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    )
}