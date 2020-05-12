import React, {useState} from 'react';
import { Container, Navbar, Nav, Form, FormControl } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';
import LinkButton from '../LinkButton';

export function NavMenu() {
  const [ticker, setTicker] = useState('')

  return (
    <header>
      <Navbar bg='dark' variant='dark' expand="sm" className='mb-3'>
        <Container>
          <Navbar.Brand as={Link} to="/">Moroz-Invest</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/counter">Counter</Nav.Link>
              <Nav.Link as={Link} to="/yahoo">Yahoo</Nav.Link>

              <Form inline>
                <FormControl type="text" placeholder="Search" className="mr-sm-2" value={ticker} onChange={e => setTicker(e.target.value)} />
                <LinkButton to={`/stock?t=${ticker}`} variant="outline-success">Search</LinkButton>
              </Form>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

    </header>
  );

}
