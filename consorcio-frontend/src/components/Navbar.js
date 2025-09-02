import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { FaSignOutAlt, FaUserPlus, FaBuilding } from 'react-icons/fa'; // Importar iconos necesarios

function AppNavbar({ onLogout, userName, userRole }) {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-lg">
            <Container>
                <Navbar.Brand as={Link} to="/">Gestión Consorcios</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/consorcios">
                            <FaBuilding className="me-1" /> Consorcios
                        </Nav.Link>
                        

                        {userRole === 'admin' && (
                            <Nav.Link as={Link} to="/register">
                                <FaUserPlus className="me-1" /> Registrar Usuario
                            </Nav.Link>
                        )}
                        {userRole === 'admin' && (
                            <Nav.Link as={Link} to="/login-map">
                                <FaUserPlus className="me-1" /> Mapa de Inicios de Sesión
                            </Nav.Link>
                        )}
                    </Nav>
                    <Nav>
                        <Navbar.Text className="me-3 text-white-50">
                            Bienvenido, <strong className="text-white">{userName}</strong> ({userRole || 'sin rol'})
                        </Navbar.Text>
                        <Button variant="outline-light" onClick={onLogout}>
                            <FaSignOutAlt className="me-2" /> Cerrar Sesión
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default AppNavbar;
