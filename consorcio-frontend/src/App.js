import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import axios from 'axios';
import AppNavbar from './components/Navbar.js';
import AuthForm from './components/AuthForm.js';
import RegisterForm from './components/usuarios/RegisterForm.jsx';
import Consorcios from './components/consorcio/Consorcios.js';
import ConsorcioDetail from './components/consorcio/ConsorcioDetail.js';
import AddConsorcio from './components/consorcio/AddConsorcio.js';
import AddInquilino from './components/inquilino/AddInquilinos.js';
import EditInquilino from './components/inquilino/EditInquilino.js';
import InquilinoDetail from './components/inquilino/InquilinoDetail.js';
import AddActivo from './components/activo/AddActivo.js';
import ActivoDetail from './components/activo/ActivoDetail.js';
import EditActivo from './components/activo/EditActivos.js';
import EditConsorcio from './components/consorcio/EditConsorcio.js';
import LoginMap from './components/usuarios/LoginMap.jsx';
import ActivoList from './components/activo/ActivoList.js';
import AdminDashboard from './components/usuarios/AdminDashboard.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import EditUserForm from './components/usuarios/EditUserForm.jsx';

const API_BASE_URL = 'https://prueba-3-8t74.onrender.com';

// Componente ProtectedRoute fuera de AppContent para mejor organización y reutilización
const ProtectedRoute = ({ children, roles, isAuthenticated, userRole, authLoading }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate('/login', { replace: true });
            } else if (roles && roles.length > 0 && !roles.includes(userRole)) {
                // Redirigir si el rol del usuario no está permitido
                navigate('/consorcios', { replace: true });
            }
        }
    }, [authLoading, isAuthenticated, userRole, navigate, roles]);

    if (authLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando autenticación...</span>
                </Spinner>
            </Container>
        );
    }

    // Renderiza el componente hijo solo si la autenticación y los roles son correctos
    return isAuthenticated && (!roles || roles.includes(userRole)) ? children : null;
};


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
                            <Route path="/register"element={<ProtectedRoute roles={['admin']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><RegisterForm API_BASE_URL={API_BASE_URL} /></ProtectedRoute> }/>

                            <Route path="/" element={<ProtectedRoute roles={['admin', 'employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><Consorcios API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/consorcios" element={<ProtectedRoute roles={['admin', 'employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><Consorcios API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/consorcios/:id" element={<ProtectedRoute roles={['admin', 'employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><ConsorcioDetail API_BASE_URL={API_BASE_URL} userRole={userRole} userName={userName} /></ProtectedRoute>} />
                            <Route path="/add-consorcio" element={<ProtectedRoute roles={['admin','employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><AddConsorcio API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/edit-consorcio/:id" element={<ProtectedRoute roles={['admin','employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><EditConsorcio API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

                            <Route path="/add-inquilino/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><AddInquilino API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/inquilinos/:id" element={<ProtectedRoute roles={['admin', 'employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><InquilinoDetail API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/edit-inquilino/:id" element={<ProtectedRoute roles={['admin', 'employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><EditInquilino API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

                            <Route path="/add-activo/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><AddActivo API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/activos/:id" element={<ProtectedRoute roles={['admin', 'employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><ActivoDetail API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path="/edit-activo/:id" element={<ProtectedRoute roles={['admin', 'employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><EditActivo API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                            <Route path='/activo-list' element={<ProtectedRoute roles={['admin', 'employee']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><ActivoList API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
    
                            
                            <Route path='/login-map' element={<ProtectedRoute roles={['admin']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><LoginMap authToken={authToken} /></ProtectedRoute>}/>
                            
                            <Route path="*" element={<ProtectedRoute roles={['admin']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><Consorcios API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

                            <Route path="/admin" element={<ProtectedRoute roles={['admin']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><AdminDashboard /></ProtectedRoute>} />
                            <Route path='/edit-user/:id' element={<ProtectedRoute roles={['admin']} isAuthenticated={isAuthenticated} userRole={userRole} authLoading={authLoading}><EditUserForm /></ProtectedRoute>} />
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
