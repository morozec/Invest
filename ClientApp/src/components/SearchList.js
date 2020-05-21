import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, ListGroup } from 'react-bootstrap';
import LinkButton from '../LinkButton';

export function SearchList() {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const useQuery = () => new URLSearchParams(useLocation().search);
    const query = useQuery();
    const search = query.get('q');


    const getCompanyByTicker = async (ticker) => {
        const response = await fetch(`api/simfin/id/${ticker}`);
        const data = await response.json();
        return data;
    }
    const getCompanyByName = async (name) => {
        const response = await fetch(`api/simfin/name/${name}`);
        const data = await response.json();
        return data;
    }

    useEffect(() => {
        setIsLoading(true);
        const promises = [getCompanyByTicker(search), getCompanyByName(search)];
        Promise.all(promises).then(result => {
            let companies = [...result[0], ...result[1]];
            console.log(companies);
            setCompanies(companies);
            setIsLoading(false);
        })
    }, [search])

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : <ListGroup>
            {companies.map((c, i) =>
                <ListGroup.Item key={i} action as={Link}
                    to={{
                        pathname: '/stock',
                        search: `t=${c.ticker}`,
                        state: {
                            simId: c.simId,
                            name: c.name
                        }
                    }}>
                    <div className='companyItem'>
                        <div>{c.ticker}</div>
                        <div>{c.name}</div>
                    </div>
                    
                </ListGroup.Item>

                // <LinkButton key={i}
                //     to={{
                //         pathname: '/stock',
                //         search: `t=${c.ticker}`,
                //         state: {
                //             simId: c.simId,
                //             name: c.name
                //         }
                //     }}>
                //     {c.name}
                // </LinkButton>
            )}
        </ListGroup>



    return (
        <Container>
            {content}
        </Container>
    )
}