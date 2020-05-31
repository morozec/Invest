import React, { useState } from 'react';
import { Container, Navbar, Nav, Form, Button } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';
import './NavMenu.css';
import LinkButton from '../LinkButton';
import { DebounceInput } from 'react-debounce-input';

function NavMenu(props) {
  const [ticker, setTicker] = useState('')
  const [companies, setCompanies] = useState([])
  const { comparingCompanies } = props;

  const getCompanyFromDb = async (searchText) => {
    const response = await fetch(`api/search/${searchText}`);
    const data = await response.json();
    return data;
  }

  const handleSearchChange = (e) => {

    let t = e.target.value;
    setTicker(t);
    if (t === '') return;

    let selectedOption = document.querySelector(`#stocks option[value="${t}"]`);
    if (selectedOption !== null) {
      let ticker = selectedOption.dataset.ticker;
      const exchange = selectedOption.dataset.exchange;
      if (exchange === 'MOEX') ticker += '.ME';
      console.log('value to send', ticker);
      props.history.push({
        pathname: '/stock',
        search: `t=${ticker}`,
      });
    } else {
      console.log('update list', t);
      // const promises = [getCompanyByTicker(t), getCompanyByName(t)];
      // Promise.all(promises).then(result => {
      //   let companies = [];
      //   let id = -1;
      //   if (result[0].length > 0) {
      //     companies.push(result[0][0]);
      //     id = result[0][0].simId;
      //   }
      //   let i = 0;
      //   while (companies.length < 10 && i < result[1].length) {
      //     if (result[1][i].simId !== id) {
      //       companies.push(result[1][i]);
      //     }
      //     i++;
      //   }
      //   console.log(companies);
      //   setCompanies(companies);
      // })
      getCompanyFromDb(t).then(result => {
        let companies = result.slice(0, 10);
        console.log(companies);
        setCompanies(companies);
      })
    }
  }

  return (
    <header>
      <Navbar bg='dark' variant='dark' expand="sm" className='mb-3'>
        <Container>
          <Navbar.Brand as={Link} to="/">Moroz-Invest</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              <LinkButton to='/comparing' variant="outline-success" disabled={comparingCompanies.length < 2}>
                Comparing ({comparingCompanies.length})
              </LinkButton>
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/counter">Counter</Nav.Link>
              <Nav.Link as={Link} to="/yahoo">Yahoo</Nav.Link>

              <Form inline>
                {/* <FormControl type="text" placeholder="Search" className="mr-sm-2" value={ticker} onChange={handleSearchChange} /> */}
                <DebounceInput
                  debounceTimeout={500}
                  onChange={handleSearchChange}
                  placeholder='Search'
                  list='stocks'
                  className='mr-sm-2 form-control' />

                <datalist id='stocks'>
                  {companies.map((c, i) =>
                    <option key={i}
                      value={`${c.shortName} (${c.ticker}) - ${c.exchange}`}
                      data-ticker={c.ticker}
                      data-name={c.shortName}
                      data-exchange={c.exchange}
                    >
                    </option>)}
                </datalist>

                <LinkButton to={`/search?q=${ticker}`} variant="outline-success" disabled={ticker === ''}>Search</LinkButton>
              </Form>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

    </header>
  );

}

export default withRouter(NavMenu);