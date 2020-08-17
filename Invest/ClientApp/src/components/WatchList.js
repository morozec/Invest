import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchWithCredentials } from '../JwtHelper';

export function WatchList(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [companies, setCompanies] = useState([]);

   
    const loadCompanies = useCallback(() => {
        setIsLoading(true);

        const loadPrice = async (company) => {
            let response = await fetch(`api/yahoofinance/price/${company.ticker}`, {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                }
            });
            let result = await response.json();
            company.price = result.regularMarketPrice.raw;
        }

        (async () => {
            let response = await fetchWithCredentials('api/account/watchList', {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                }
            });
            let companies = await response.json();            
            setCompanies(companies);
            setIsLoading(false);

            let pricedCompanies = [...companies];
            let promises = pricedCompanies.map(c => loadPrice(c));
            await Promise.all(promises);
            setCompanies(pricedCompanies);
        })();

    }, []);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies])

    const handleDeleteFromWatchListClick = (ticker) => {
        setIsLoading(true);
        fetchWithCredentials('api/account/deleteFromWatchList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticker })
        }).then(response => {
            if (response.ok) {
                loadCompanies();
            } else {
                console.error('error while deleting company from watch list');
                setIsLoading(false);
            }
        })
    }

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : companies.length === 0
            ? <p>Watch list is empty</p>
            : <Table className='table-sm' bordered hover variant='light'>
                <caption>Watch List</caption>
                <thead>
                    <tr>
                        <th className='centered'>Ticker</th>
                        <th>Name</th>
                        <th className='centered'>Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map(c =>
                        <tr key={c.ticker}>
                            <td className='centered'>
                                <Link to={{
                                    pathname: '/stock',
                                    search: `t=${c.ticker}`,
                                }}>
                                    {c.ticker}
                                </Link>
                            </td>
                            <td>{c.shortName}</td>
                            <td className='centered'>{c.price !== undefined ? c.price : <em>Loading...</em>}</td>
                            <td className='centered'><Button variant='outline-danger'
                                onClick={() => handleDeleteFromWatchListClick(c.ticker)}>Delete</Button></td>
                        </tr>)}
                </tbody>
            </Table>

    return (
        <div>
            {content}
        </div>
    )
}