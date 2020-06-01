import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function WatchList(props) {
    const { userData } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
   
    const loadCompanies = useCallback(() => {
        if (userData === null) return;
        setIsLoading(true);

        fetch('api/account/watchList', {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                'Authorization': 'Bearer ' + userData.access_token
            }
        })
            .then(response => response.json())
            .then(companies => setCompanies(companies))
            .catch(err => console.error(err))
            .finally(() => {
                setIsLoading(false);
            })
    }, [userData]);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies])

    const handleDeleteFromWatchListClick = (ticker) => {
        setIsLoading(true);
        fetch('api/account/deleteFromWatchList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userData.access_token
            },
            body: JSON.stringify({ ticker })
        }).then(response => {
            if (response.ok){
                loadCompanies();
            }else{
                console.error('error while deleting company from watch list')
            }
        }).finally(() => {
            setIsLoading(false);
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
                            <td><Button variant='outline-danger'
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