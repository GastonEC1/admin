import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';

const FaSignOutAlt = () => <span>&#x27A1;</span>;
const FaUserPlus = () => <span>&#x1F464;</span>;
const FaBuilding = () => <span>&#x1F3E2;</span>;
const FaMapMarkedAlt = () => <span>&#x1F5FA;</span>;
const FaUserCog = () => <span>&#x2699;</span>;

function AppNavbar({ onLogout, userName, userRole }) {
    return (
        <Navbar bg="light" variant="light" expand="lg" className="border-bottom sticky-top shadow-sm">
            <style jsx>{`
                .nav-link-custom {
                    position: relative;
                    transition: all 0.3s ease;
                }
                .nav-link-custom:hover {
                    color: var(--bs-primary) !important;
                    text-decoration: underline;
                    transform: translateY(-2px);
                }
                .nav-link-custom .fa-icon {
                    margin-right: 0.25rem;
                }
            `}</style>
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-primary">
                    Gestión Consorcios
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" >
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/consorcios" className="text-dark nav-link-custom">
                            <FaBuilding className="me-1 fa-icon" /> Consorcios
                        </Nav.Link>
                        {userRole === 'admin' && (
                            <Nav.Link as={Link} to="/register" className="text-dark nav-link-custom">
                                <FaUserPlus className="me-1 fa-icon" /> Registrar Usuario
                            </Nav.Link>
                        )}
                        {
                            userRole === 'admin' && (
                                <Nav.Link as={Link} to="/admin" className="text-dark nav-link-custom">
                                    <FaUserCog className="me-1 fa-icon" /> Panel Admin
                                </Nav.Link>
                            )
                        }
                        {userRole === 'admin' && (
                            <Nav.Link as={Link} to="/login-map" className="text-dark nav-link-custom">
                                <FaMapMarkedAlt className='me-1 fa-icon' /> Mapa de Inicios de Sesión
                            </Nav.Link>
                        )}
                        
                    </Nav>

                    <Nav>
                        <Navbar.Text className="me-3 text-secondary">
                            Bienvenido, <strong className="text-dark">{userName}</strong> ({userRole || 'sin rol'})
                        </Navbar.Text>
                        <Button variant="outline-primary" onClick={onLogout} className="rounded-pill">
                            <FaSignOutAlt className="me-2" /> Cerrar Sesión
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default AppNavbar;
