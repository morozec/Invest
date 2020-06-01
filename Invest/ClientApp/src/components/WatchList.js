import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function WatchList(props) {
    const { userData } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
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
    }, [userData])

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
                        </tr>)}
                </tbody>
            </Table>

    return (
        <div>
            {content}
        </div>
    )
}