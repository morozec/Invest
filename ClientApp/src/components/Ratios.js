import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';

export function Ratios(props) {
    const [ratios, setRatios] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isActive } = props;


    useEffect(() => {
        if (!isActive) return;
        if (ratios) return;

        const ibmId = 69543;
        setIsLoading(true);

        const getData = async (companyId) => {
            const response = await fetch(`api/simfin/ratios/${companyId}`);
            const data = await response.json();
            return data;
        }

        getData(ibmId).then(result => {
            setRatios(result);
            setIsLoading(false);
        })

    }, [isActive, ratios])


    let content;

    if (isLoading) {
        content = <p><em>Loading...</em></p>;
    } else {

        let tableRows = ratios.filter(r => r.value !== null).map(r =>
            <tr key={r.indicatorId}>
                <td>{r.indicatorName}</td>
                <td>{r.value}</td>
            </tr>)

        content = (
            <Table className='content-table' bordered hover variant='light'>
                <tbody>
                    {tableRows}
                </tbody>
            </Table>
        )
    }

    return (
        <div>
            <div className='statementHeader'>
                <h1>IBM Ratios</h1>
            </div>
            {content}
        </div>
    )
}

