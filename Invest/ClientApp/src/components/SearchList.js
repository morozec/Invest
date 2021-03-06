import React, { useEffect, useState } from 'react';
import { useLocation, withRouter } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';

function SearchList(props) {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const useQuery = () => new URLSearchParams(useLocation().search);
    const query = useQuery();
    const search = query.get('q');

    useEffect(() => {
        const getCompanyFromDb = async (searchText) => {
            const response = await fetch(`api/search/${searchText}`);
            const data = await response.json();
            return data;
        }

        setIsLoading(true);
        getCompanyFromDb(search).then(result => {
            setCompanies(result);
            setIsLoading(false);
        })
    }, [search])

    const handleRowClick = (ticker) => {
        props.history.push(`/stock?t=${ticker}`)
    }

    let content = isLoading
        ? <p><em>Loading...</em></p>
       
        : <Table bordered hover striped variant='light'>
            <thead>
                <tr>
                    <th>Ticker</th>
                    <th>Name</th>
                    <th>Exchange</th>
                </tr>
            </thead>
            <tbody>
                {companies.map(c =>
                    <tr key={c.ticker} onClick = {() => handleRowClick(c.ticker)} className='pointer'>
                        <td>{c.ticker}</td>
                        <td>{c.shortName}</td>
                        <td>{c.exchange}</td>
                    </tr>
                )}
            </tbody>
        </Table>

    return (
        <Container>
            {content}
        </Container>
    )
}

export default withRouter(SearchList);