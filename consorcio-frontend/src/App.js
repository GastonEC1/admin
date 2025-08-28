import React, { useState, useEffect } from 'react';
    import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
    import { Container, Spinner } from 'react-bootstrap';
    import axios from 'axios';

    // Importaciones de componentes
    // ¡Importante! Asegúrate de que los nombres de archivo en src/components/
    // coincidan EXACTAMENTE con estas importaciones (ej. Navbar.js, AuthForm.js, RegisterForm.jsx)
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

    import 'bootstrap/dist/css/bootstrap.min.css';
    import './index.css';

    const API_BASE_URL = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev';

    function AppContent() {
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [userRole, setUserRole] = useState(null);
        const [userName, setUserName] = useState('Invitado');
        const [authLoading, setAuthLoading] = useState(true);
        const navigate = useNavigate();

        useEffect(() => {
            const checkAuth = async () => {
                setAuthLoading(true);
                const token = localStorage.getItem('authToken');
                console.log(`[AppContent useEffect - checkAuth] INICIO. Path: ${window.location.pathname}`);
                console.log(`[AppContent useEffect - checkAuth] Token en localStorage: ${token ? 'Encontrado' : 'No encontrado'}`);

                if (token) {
                    try {
                        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                            headers: { 'x-auth-token': token }
                        });
                        console.log('[AppContent useEffect - checkAuth] Respuesta de /api/auth/me:', response.data);
                        setIsAuthenticated(true);
                        setUserRole(response.data.rol);
                        setUserName(response.data.nombre);
                        localStorage.setItem('userRole', response.data.rol);
                        localStorage.setItem('userName', response.data.nombre);
                        console.log(`[AppContent useEffect - checkAuth] Autenticado como: ${response.data.rol} (${response.data.nombre})`);

                        if (window.location.pathname === '/login') {
                            console.log('[AppContent useEffect - checkAuth] Usuario autenticado en /login, redirigiendo a /consorcios.');
                            navigate('/consorcios', { replace: true });
                        }
                    } catch (err) {
                        console.error('[AppContent useEffect - checkAuth] ERROR: Token inválido o expirado al verificar. Mensaje:', err.message);
                        handleLogout(); // Esta función ya redirige a /login
                    }
                } else { // Usuario NO está autenticado
                    setIsAuthenticated(false);
                    setUserRole(null);
                    setUserName('Invitado');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userName');
                    console.log('[AppContent useEffect - checkAuth] No se encontró token, usuario no autenticado.');

                    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') { // No redirigir si está en /register
                        console.log('[AppContent useEffect - checkAuth] No autenticado y no en /login o /register, redirigiendo a /login.');
                        navigate('/login', { replace: true });
                    }
                }
                setAuthLoading(false);
                console.log(`[AppContent useEffect - checkAuth] FIN. isAuthenticated: ${isAuthenticated}, userRole: ${userRole}, authLoading: ${authLoading}`);
            };
            checkAuth();
        }, [navigate, isAuthenticated, userRole]);

        const handleAuthSuccess = async (token) => {
            localStorage.setItem('authToken', token);
            console.log('[handleAuthSuccess] Login exitoso, token guardado. Verificando usuario...');
            try {
                const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                    headers: { 'x-auth-token': token }
                });
                console.log('[handleAuthSuccess] Datos de usuario obtenidos después de login:', response.data);
                setIsAuthenticated(true);
                setUserRole(response.data.rol);
                setUserName(response.data.nombre);
                localStorage.setItem('userName', response.data.nombre);
                localStorage.setItem('userRole', response.data.rol);
                console.log(`[handleAuthSuccess] Usuario logueado: ${response.data.rol} (${response.data.nombre}). Redirigiendo a /consorcios.`);
                navigate('/consorcios', { replace: true });
            } catch (err) {
                console.error('[handleAuthSuccess] ERROR: Error al obtener datos de usuario después del login. Mensaje:', err.message);
                handleLogout();
                navigate('/login', { replace: true });
            }
        };

        const handleLogout = () => {
            console.log('[handleLogout] Cerrando sesión de usuario.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            setIsAuthenticated(false);
            setUserRole(null);
            setUserName('Invitado');
            navigate('/login', { replace: true });
        };

        const ProtectedRoute = ({ children, roles }) => {
            const currentPath = window.location.pathname;
            console.log(`[ProtectedRoute] INICIO. Path: ${currentPath}, AuthLoading: ${authLoading}, IsAuthenticated: ${isAuthenticated}, UserRole: ${userRole}, Roles Requeridos: ${roles ? roles.join(', ') : 'Ninguno'}`);

            if (authLoading) {
                console.log('[ProtectedRoute] AuthLoading es true, mostrando spinner de carga.');
                return (
                    <Container className="text-center mt-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando autenticación...</span>
                        </Spinner>
                    </Container>
                );
            }

            if (!isAuthenticated) {
                console.log(`[ProtectedRoute] Usuario NO autenticado en ${currentPath}, redirigiendo a /login.`);
                navigate('/login', { replace: true });
                return null; // No renderiza nada si no está autenticado
            }

            if (userRole === 'admin') {
                console.log(`[ProtectedRoute] Usuario es 'admin', permitiendo acceso a ${currentPath}.`);
                return children;
            }

            if (roles && roles.length > 0 && !roles.includes(userRole)) {
                console.warn(`[ProtectedRoute] Acceso denegado para el rol '${userRole}' en ${currentPath}. Roles permitidos: [${roles.join(', ')}]. Redirigiendo a /consorcios.`);
                navigate('/consorcios', { replace: true });
                return null; // No renderiza nada si no tiene el rol
            }

            console.log(`[ProtectedRoute] Usuario con rol '${userRole}' tiene acceso a ${currentPath}.`);
            return children;
        };

        // Spinner global mientras se carga la autenticación inicial
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
                        <AppNavbar onLogout={handleLogout} userName={userName} userRole={userRole} />
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

                                <Route path="/" element={<ProtectedRoute roles={['admin', 'propietario']}><Consorcios API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                                <Route path="/consorcios" element={<ProtectedRoute roles={['admin', 'propietario']}><Consorcios API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                                <Route path="/consorcios/:id" element={<ProtectedRoute roles={['admin', 'propietario']}><ConsorcioDetail API_BASE_URL={API_BASE_URL} userRole={userRole} userName={userName} /></ProtectedRoute>} />
                                <Route path="/add-consorcio" element={<ProtectedRoute roles={['admin']}><AddConsorcio API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                                <Route path="/edit-consorcio/:id" element={<ProtectedRoute roles={['admin']}><EditConsorcio API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

                                <Route path="/add-inquilino/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']}><AddInquilino API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                                <Route path="/inquilinos/:id" element={<ProtectedRoute roles={['admin', 'employee', 'propietario']}><InquilinoDetail API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                                <Route path="/edit-inquilino/:id" element={<ProtectedRoute roles={['admin', 'employee']}><EditInquilino API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

                                <Route path="/add-activo/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']}><AddActivo API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                                <Route path="/activos/:id" element={<ProtectedRoute roles={['admin', 'employee', 'propietario']}><ActivoDetail API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
                                <Route path="/edit-activo/:id" element={<ProtectedRoute roles={['admin', 'employee']}><EditActivo API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

                                <Route path="/add-pago/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']}><AddPago API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

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