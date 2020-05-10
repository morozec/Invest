import React, { Component } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

export class NavMenu extends Component {
  static displayName = NavMenu.name;

  constructor(props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true
    };
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render() {
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
                <Nav.Link as={Link} to="/stock">Stock</Nav.Link>
                <Nav.Link as={Link} to="/stocksimfin">Stock SimFin</Nav.Link>
              </Nav>            
            </Navbar.Collapse>
          </Container>
        </Navbar>
       
      </header>
    );
  }
}
