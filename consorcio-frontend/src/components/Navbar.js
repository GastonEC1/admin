import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaBuilding, FaSignOutAlt } from 'react-icons/fa';

function AppNavbar({ onLogout }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={LinkContainer} to="/">
          <Nav.Link>Gestión de Consorcios</Nav.Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/consorcios">
              <Nav.Link><FaBuilding /> Consorcios</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav>
            <Button variant="outline-light" onClick={onLogout}>
              <FaSignOutAlt /> Salir
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;