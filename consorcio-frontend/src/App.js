import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import axios from 'axios';
import AppNavbar from './components/Navbar.js';
import AuthForm from './components/AuthForm.js';
import RegisterForm from './components/RegisterForm.jsx';
import Consorcios from './components/Consorcios.js';
import ConsorcioDetail from './components/ConsorcioDetail.js';
import AddConsorcio from './components/AddConsorcio.js';
import AddInquilino from './components/AddInquilinos.js';
import EditInquilino from './components/EditInquilino.js';
import InquilinoDetail from './components/InquilinoDetail.js';
import AddActivo from './components/AddActivo.js';
import ActivoDetail from './components/ActivoDetail.js';
import EditActivo from './components/EditActivos.js';
import EditConsorcio from './components/EditConsorcio.js';
import AddPago from './components/AddPago.js';
import LoginMap from './components/LoginMap.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const API_BASE_URL = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev';

function AppContent() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState('Invitado');
    const [authLoading, setAuthLoading] = useState(true);
    const [authToken, setAuthToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            setAuthToken(token);
            
            if (token) {
                try {
                    // ✨ Cambio aquí: Usamos el encabezado Authorization
                    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    setIsAuthenticated(true);
                    setUserRole(response.data.rol);
                    setUserName(response.data.nombre);
                    localStorage.setItem('userRole', response.data.rol);
                    localStorage.setItem('userName', response.data.nombre);
                    
                    if (window.location.pathname === '/login') {
                        navigate('/consorcios', { replace: true });
                    }
                } catch (err) {
                    handleLogout();
                }
            } else {
                handleLogout(false);
            }
            setAuthLoading(false);
        };
        checkAuth();
    }, [navigate]);

    const handleAuthSuccess = async (token) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        try {
            // ✨ Cambio aquí: Usamos el encabezado Authorization
            const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setIsAuthenticated(true);
            setUserRole(response.data.rol);
            setUserName(response.data.nombre);
            localStorage.setItem('userName', response.data.nombre);
            localStorage.setItem('userRole', response.data.rol);
            
            navigate('/consorcios', { replace: true });
        } catch (err) {
            handleLogout();
            navigate('/login', { replace: true });
        }
    };

    const handleLogout = (shouldRedirect = true) => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        setAuthToken(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName('Invitado');
        if (shouldRedirect) {
            navigate('/login', { replace: true });
        }
    };
    
    const ProtectedRoute = ({ children, roles }) => {
        if (authLoading) {
            return (
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando autenticación...</span>
                    </Spinner>
                </Container>
            );
        }

        if (!isAuthenticated) {
            navigate('/login', { replace: true });
            return null;
        }
        
        if (userRole === 'admin') {
            return children;
        }

        if (roles && roles.length > 0 && !roles.includes(userRole)) {
            navigate('/consorcios', { replace: true });
            return null;
        }

        return children;
    };

    if (authLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando aplicación...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <>
            {!isAuthenticated ? (
                <Routes>
                    <Route path="/login" element={<AuthForm onAuthSuccess={handleAuthSuccess} API_BASE_URL={API_BASE_URL} />} />
                    <Route path="*" element={<AuthForm onAuthSuccess={handleAuthSuccess} API_BASE_URL={API_BASE_URL} />} />
                </Routes>
            ) : (
                <>
                    <AppNavbar onLogout={() => handleLogout(true)} userName={userName} userRole={userRole} />
                    <Container fluid className="mt-3">
                        <Routes>
                            <Route
                                path="/register"
                                element={
                                    <ProtectedRoute roles={['admin']}>
                                        <RegisterForm API_BASE_URL={API_BASE_URL} />
                                    </ProtectedRoute>
                                }
                            />

                            <Route path="/" element={<ProtectedRoute roles={['admin', 'propietario','employee']}><Consorcios API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/consorcios" element={<ProtectedRoute roles={['admin', 'propietario','employee']}><Consorcios API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/consorcios/:id" element={<ProtectedRoute roles={['admin', 'propietario','employee']}><ConsorcioDetail API_BASE_URL={API_BASE_URL} userRole={userRole} userName={userName} /></ProtectedRoute>} />
                            <Route path="/add-consorcio" element={<ProtectedRoute roles={['admin','employee']}><AddConsorcio API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/edit-consorcio/:id" element={<ProtectedRoute roles={['admin','employee']}><EditConsorcio API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

                            <Route path="/add-inquilino/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']}><AddInquilino API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/inquilinos/:id" element={<ProtectedRoute roles={['admin', 'employee', 'propietario']}><InquilinoDetail API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/edit-inquilino/:id" element={<ProtectedRoute roles={['admin', 'employee']}><EditInquilino API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

                            <Route path="/add-activo/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']}><AddActivo API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/activos/:id" element={<ProtectedRoute roles={['admin', 'employee', 'propietario']}><ActivoDetail API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/edit-activo/:id" element={<ProtectedRoute roles={['admin', 'employee']}><EditActivo API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

                            <Route path="/add-pago/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']}><AddPago API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            
                            <Route 
                                path='/login-map' 
                                element={
                                    <ProtectedRoute roles={['admin']}>
                                        <LoginMap authToken={authToken} />
                                    </ProtectedRoute>
                                } 
                            />
                            
                            <Route path="*" element={<ProtectedRoute roles={['admin', 'propietario']}><Consorcios API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                        </Routes>
                    </Container>
                </>
            )}
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;