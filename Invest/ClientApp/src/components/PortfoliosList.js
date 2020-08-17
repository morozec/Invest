import React, { useState, useEffect, useCallback } from 'react'
import { Button, Table, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { PortfolioEditor } from './PortfolioEditor';
import {fetchWithCredentials} from './../JwtHelper';

export function PortfoliosList(props) {
    const [cookies, setCookie] = useCookies(['tokensContainer', 'name']);
    const [isLoading, setIsLoading] = useState(false);
    const [portfolios, setPortfolios] = useState([]);
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [selected, setSelected] = useState([])

    const handleClose = () => { setShowNewDialog(false); }
    const handleShow = () => setShowNewDialog(true);


    const loadPortfolios = useCallback(async () => {
        if (!cookies.tokensContainer) return;

        let {response, newTokensContainer} = await fetchWithCredentials(
            'api/account/portfolios',
            {
                method: 'GET',
                headers: {"Accept": "application/json"}
            },
            cookies.tokensContainer,
            setCookie
        );
        console.log('response', response);

        if (newTokensContainer){
            setCookie('tokensContainer', newTokensContainer);
        }
        
        if (response.ok){
            let portfolios = await response.json();
            console.log('portfolios', portfolios);
            setPortfolios(portfolios);
        }

    }, [setCookie]);

    const addPortfolio = async (name, defaultCommissionPercent, addDividendsToCash) => {
        // await fetch('api/account/addUpdatePortfolio', {
        //     method: 'POST',
        //     headers: {
        //         "Content-Type": "application/json;charset=utf-8",
        //         'Authorization': 'Bearer ' + cookies.jwt
        //     },
        //     body: JSON.stringify({ name, currency:'USD', defaultCommissionPercent, addDividendsToCash })
        // });

        await fetchWithCredentials(
            'api/account/addUpdatePortfolio',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ name, currency:'USD', defaultCommissionPercent, addDividendsToCash })
            },
            cookies.tokensContainer,
            setCookie
        );      
    }

    const deletePortfolio = async (id) => {
        await fetch('api/account/deletePortfolio', {
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

    const handleAddPortfolio = (name, defaultCommissionPercent, addDividendsToCash) => {
        (async () => {
            setIsLoading(true);
            await addPortfolio(name, defaultCommissionPercent, addDividendsToCash);
            console.log('tc', cookies.tokensContainer)
            // await loadPortfolios();
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
    let showAggregatedButton =
        selected.length < 2
            ?
            <Button disabled={true} variant='success'
                title='Select 2 or more portfolios to show aggregated'>
                Show aggregated portfolio
            </Button>
            :
            <Button variant='success'
                as={Link} to={{ pathname: `/portfolio/p=${selected.join(',')}` }}>
                Show aggregated portfolio
            </Button>



    const handleSelectionChanged = (p, e) => {
        let newSelected;
        if (e.target.checked) {
            newSelected = [...selected, p.id]
        } else {
            newSelected = selected.filter(s => s !== p.id);
        }
        setSelected(newSelected);
    }

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : portfolios.length === 0
            ? <div>
                {addButton}
            </div>
            : <div>
                {addButton} {showAggregatedButton}
                <Table className='table-sm' bordered hover variant='light'>
                    <caption>Portfolios</caption>
                    <thead>
                        <tr>
                            <th></th>
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
                                <td><Form.Check type="checkbox" checked={selected.includes(p.id)}
                                    onChange={(e) => handleSelectionChanged(p, e)} /> </td>
                                <td> <Link to={{ pathname: `/portfolio/p=${p.id}` }}> {p.name} </Link></td>
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