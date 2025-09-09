import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { FaSignOutAlt, FaUserPlus, FaBuilding, FaMapMarkedAlt } from 'react-icons/fa';

function AppNavbar({ onLogout, userName, userRole }) {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-lg sticky-top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-white">
                    Gestión Consorcios
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" >
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/consorcios" className="text-white hover:text-white">
                            <FaBuilding className="me-1" /> Consorcios
                        </Nav.Link>
                        {userRole === 'admin' && (
                            <Nav.Link as={Link} to="/register" className="text-white hover:text-white">
                                <FaUserPlus className="me-1" /> Registrar Usuario
                            </Nav.Link>
                        )}
                        {userRole === 'admin' && (
                            <Nav.Link as={Link} to="/login-map" className="text-white hover:text-white">
                                <FaMapMarkedAlt className='me-1' /> Mapa de Inicios de Sesión
                            </Nav.Link>
                        )}
                    </Nav>

                    <Nav>
                        <Navbar.Text className="me-3 text-white">
                            Bienvenido, <strong className="text-white">{userName}</strong> ({userRole || 'sin rol'})
                        </Navbar.Text>
                        <Button variant="outline-light" onClick={onLogout} className="rounded-pill">
                            <FaSignOutAlt className="me-2" /> Cerrar Sesión
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default AppNavbar;
