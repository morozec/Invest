import React, { useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap';

export function PortfolioEditor(props) {

    const { show, handleClose, handleSave, name } = props;
    const [portfolioName, setPortfolioName] = useState(name ? name : 'New Portfilio');    

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
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary"
                    onClick={() => handleSave(portfolioName)}
                    disabled={portfolioName === ''}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    )
}