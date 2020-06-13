import React, { useState, useEffect, useCallback } from 'react'
import { Button, Modal, Table, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { PortfolioEditor } from './PortfolioEditor';

export function PortfoliosList(props) {
    const [cookies] = useCookies(['jwt']);
    const [isLoading, setIsLoading] = useState(true);
    const [portfolios, setPortfolios] = useState([]);
    const [showNewDialog, setShowNewDialog] = useState(false);

    const handleClose = () => {setShowNewDialog(false);}
    const handleShow = () => setShowNewDialog(true);

    const loadPortfolios = useCallback(async () => {
        if (!cookies.jwt) return;

        let response = await fetch('api/account/portfolios', {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                'Authorization': 'Bearer ' + cookies.jwt
            }
        });
        let portfolios = await response.json();
        setPortfolios(portfolios);

    }, [cookies.jwt]);

    const addPortfolio = async (name, currency) => {
        let response = await fetch('api/account/addUpdatePortfolio', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + cookies.jwt
            },
            body: JSON.stringify({ name, currency })
        });
    }

    const deletePortfolio = async (id) => {
        let response = await fetch('api/account/deletePortfolio', {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Authorization': 'Bearer ' + cookies.jwt
            },
            body: JSON.stringify({ id })
        });
    }

    useEffect(() => {
        setIsLoading(true);
        loadPortfolios().then(() => setIsLoading(false));
    }, [loadPortfolios])

    const handleAddPortfolio = (name, currency) => {
        (async () => {
            setIsLoading(true);
            await addPortfolio(name, currency);
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
                {addButton}
            </div>
            : <div>
                {addButton}
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
                            <tr key={p.id} className='pointer'>
                                <td> <Link to={{ pathname: `/portfolio/${p.id}` }}> {p.name} </Link></td>
                                <td className='centered'>{p.marketValue !== undefined ? p.marketValue : <em>Loading...</em>}</td>
                                <td className='centered'>{p.dayChange !== undefined ? p.dayChange : <em>Loading...</em>}</td>
                                <td className='centered'>{p.dayChangePercent !== undefined ? p.dayChangePercent : <em>Loading...</em>}</td>
                                <td className='centered'>{p.totalChange !== undefined ? p.totalChange : <em>Loading...</em>}</td>
                                <td className='centered'>{p.totalChangePercent !== undefined ? p.totalChangePercent : <em>Loading...</em>}</td>
                                <td className='centered'>                                   
                                    <Button variant='outline-danger' className='ml-1'
                                        onClick={() => handleDeletePortfolio(p.id)}>Delete</Button>
                                </td>
                            </tr>)}
                    </tbody>
                </Table>
            </div>

    return (
        <div>
            {content}
            <PortfolioEditor show={showNewDialog} handleClose={handleClose} handleSave={handleAddPortfolio} />
        </div>
    )
}