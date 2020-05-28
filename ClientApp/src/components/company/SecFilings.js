import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';

export function SecFilings(props) {
    const { isActive, ticker } = props;
    const [filings, setFilings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isActive) return;
        setIsLoading(true);
        const getData = async () => {
            const response = await fetch(`api/YahooFinance/secFilings/${ticker}`);
            if (response.status === 204) {
                setFilings(null);
            } else {
                const filings = await response.json();
                setFilings(filings);
            }
            setIsLoading(false);
        }
        getData();

    }, [isActive, ticker])

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : filings === null
            ? <p>No SEC filings history</p>
            : <Table className='table-sm' bordered hover variant='light'>
                <thead>
                    <tr>
                        <th className='centered'>Date</th>
                        <th className='centered'>Type</th>
                        <th className='centered'>Title</th>
                        <th className='centered'>Edgar URL</th>
                    </tr>
                </thead>
                <tbody>
                    {filings.map((filing, i) =>
                        <tr key={i}>
                            <td className='centered'>{filing.date}</td>
                            <td className='centered'>{filing.type}</td>
                            <td className='centered'>{filing.title}</td>
                            <td className='centered'><a href={filing.edgarUrl} target="_blank">Link</a></td>
                        </tr>
                    )}
                </tbody>
            </Table>

    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} SEC Filings</h1>
            </div>
            {content}
        </div>
    )
}