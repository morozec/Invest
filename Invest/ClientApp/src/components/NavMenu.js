import React, { useState, useEffect, Component } from 'react';
import { Container, Navbar, Nav, Form, Button, NavDropdown } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';
import './NavMenu.css';
import LinkButton from '../LinkButton';
import Select, { createFilter } from 'react-select';
import {MenuList} from './helpers/MenuList'




function NavMenu(props) {
  const { companies, comparingCompanies, userData, setUserData } = props;

  

  const handleLogout = () => {
    setUserData(null);
    props.history.push('/');
  }

  const handleCompanyChanged = (selectedCompany) => {
    props.history.push(`/stock?t=${selectedCompany.ticker}`);
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
              {userData && <NavDropdown title={userData.email}>
                <NavDropdown.Item as={Link} to='/watchList'>Watch List</NavDropdown.Item>
                <NavDropdown.Item as={Link} to='/portfolios'>Portfolios</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as='button' onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>}
              {!userData && <Nav.Link as={Link} to={{ pathname: '/login', state: { type: 'login' } }}>Login</Nav.Link>}
              {!userData && <Nav.Link as={Link} to={{ pathname: '/login', state: { type: 'register' } }}>Register</Nav.Link>}


              <Form inline className='searchForm'>
                <Select
                  className='searchFormSelect'
                  options={companies}
                  onChange={handleCompanyChanged}

                  getOptionLabel={company => `${company.exchange} : ${company.ticker} - ${company.shortName}`}
                  getOptionValue={company => company.ticker}

                  filterOption={createFilter({ ignoreAccents: false })} // this makes all the difference!
                  components={{ MenuList }}
                />
              </Form>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

    </header>
  );

}

export default withRouter(NavMenu);