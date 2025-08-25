import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap'; // Importa Spinner
import axios from 'axios';
import AppNavbar from './components/Navbar.js';
import AuthForm from './components/AuthForm.js'; // El formulario de Login
import RegisterForm from './components/RegisterForm.jsx'; // El formulario de Registro (para administradores)
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
import './index.css'; // Asegúrate de que este archivo exista en 'src/' si lo necesitas

// Puedes usar jwt-decode para obtener el rol directamente del token si lo necesitas en el frontend
// import { jwtDecode } from 'jwt-decode';

// ¡IMPORTANTE! VERIFICA ESTA URL. Debe ser la URL de tu backend en Codespaces, sin /api al final
const API_BASE_URL = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev';

// Importa todos tus componentes con la extensión .jsx
// Asegúrate de que los nombres de archivo en tu carpeta 'src/components/' coincidan EXACTAMENTE
// con estas importaciones (mayúsculas/minúsculas y extensión .jsx).

// Componente App principal que contendrá la lógica de autenticación y rutas
function AppContent() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null); // Para almacenar el rol del usuario
    const [userName, setUserName] = useState('Invitado'); // Para mostrar el nombre en la navbar
    const [authLoading, setAuthLoading] = useState(true); // Nuevo estado para el chequeo inicial de auth
    const navigate = useNavigate(); // useNavigate debe usarse dentro de un componente envuelto en <Router>

    // Efecto para verificar la autenticación al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            setAuthLoading(true); // Inicia la carga de autenticación
            const token = localStorage.getItem('authToken'); // Usar 'authToken'
            if (token) {
                try {
                    // Endpoint para obtener información del usuario autenticado y su rol
                    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                        headers: { 'x-auth-token': token }
                    });
                    setIsAuthenticated(true);
                    setUserRole(response.data.rol); // El rol está en response.data.rol
                    setUserName(response.data.nombre); // El nombre está en response.data.nombre
                    localStorage.setItem('userRole', response.data.rol);
                    localStorage.setItem('userName', response.data.nombre);
                    // Si ya estamos logueados y en /login o /register, redirigir a consorcios
                    if (window.location.pathname === '/login' || window.location.pathname === '/register') {
                        navigate('/consorcios');
                    }
                } catch (err) {
                    console.error('Token inválido o expirado:', err);
                    localStorage.removeItem('authToken'); // Limpiar token inválido
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userRole');
                    setIsAuthenticated(false);
                    setUserRole(null);
                    setUserName('Invitado');
                    // Redirigir al login si el token es inválido
                    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                        navigate('/login');
                    }
                }
            } else {
                setIsAuthenticated(false);
                setUserRole(null);
                setUserName('Invitado');
                // Si no hay token y no estamos en /login o /register, redirigir al login
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    navigate('/login');
                }
            }
            setAuthLoading(false); // Finaliza la carga de autenticación
        };
        checkAuth();
    }, [navigate]); // Añadir navigate a las dependencias para evitar warnings

    // Función para manejar el éxito del login
    const handleAuthSuccess = async (token) => {
        localStorage.setItem('authToken', token); // Guardar el token
        try {
            // Obtener el rol y el nombre del usuario después del login exitoso
            const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            setIsAuthenticated(true);
            setUserRole(response.data.rol);
            setUserName(response.data.nombre);
            localStorage.setItem('userName', response.data.nombre);
            localStorage.setItem('userRole', response.data.rol);
            navigate('/consorcios'); // ✨ ¡Redirigir a consorcios después del login exitoso!
        } catch (err) {
            console.error('Error al obtener datos del usuario después del login:', err);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            setIsAuthenticated(false);
            setUserRole(null);
            setUserName('Invitado');
            navigate('/login');
        }
    };

    // Función para manejar el logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName('Invitado');
        navigate('/login'); // Redirigir al login después del logout
    };

    // Componente auxiliar para rutas protegidas
    const ProtectedRoute = ({ children, roles }) => {
        // Muestra un spinner si la autenticación está cargando
        if (authLoading) {
            return (
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando autenticación...</span>
                    </Spinner>
                </Container>
            );
        }

        // Si no está autenticado, el useEffect ya debería haber redirigido a /login.
        // Esto es una capa de seguridad.
        if (!isAuthenticated) {
            return null; // No renderizar nada, la redirección ya está en curso
        }

        // Si se especifican roles y el usuario no tiene ninguno de ellos, denegar acceso
        if (roles && roles.length > 0 && !roles.includes(userRole)) {
            alert('No tienes permiso para acceder a esta página.'); // Considera un modal custom en producción
            navigate('/consorcios', { replace: true }); // Redirigir a una página accesible
            return null; // No renderizar nada mientras redirige
        }

        return children;
    };

    // Muestra un spinner global mientras la autenticación inicial está cargando
    if (authLoading) {
        return (
            <Container className="text-center mt-5" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando aplicación...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <>
            {/* Si no está autenticado, solo muestra el formulario de login y registro */}
            {!isAuthenticated ? (
                <Routes>
                    <Route path="/login" element={<AuthForm onAuthSuccess={handleAuthSuccess} />} />
                    <Route path="/register" element={<RegisterForm />} /> {/* Ruta para registro de nuevos usuarios */}
                    {/* Cualquier otra ruta no autenticada redirige a login */}
                    <Route path="*" element={<AuthForm onAuthSuccess={handleAuthSuccess} />} />
                </Routes>
            ) : (
                // Si está autenticado, muestra la barra de navegación y las rutas protegidas
                <>
                    <AppNavbar onLogout={handleLogout} userName={userName} userRole={userRole} />
                    <Container fluid className="mt-3">
                        <Routes>
                            {/* Ruta para el registro de usuarios (solo para admins si está protegida) */}
                            <Route
                                path="/register"
                                element={
                                    <ProtectedRoute roles={['admin']}>
                                        <RegisterForm />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Rutas de Inicio y Consorcios - Protegidas */}
                            <Route path="/" element={<ProtectedRoute><Consorcios /></ProtectedRoute>} />
                            <Route path="/consorcios" element={<ProtectedRoute><Consorcios /></ProtectedRoute>} />
                            <Route path="/consorcios/:id" element={<ProtectedRoute><ConsorcioDetail /></ProtectedRoute>} />
                            <Route path="/add-consorcio" element={<ProtectedRoute roles={['admin']}><AddConsorcio /></ProtectedRoute>} />
                            <Route path="/edit-consorcio/:id" element={<ProtectedRoute roles={['admin']}><EditConsorcio /></ProtectedRoute>} />

                            {/* Rutas para Inquilinos - Protegidas */}
                            <Route path="/add-inquilino/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']}><AddInquilino /></ProtectedRoute>} />
                            <Route path="/inquilinos/:id" element={<ProtectedRoute><InquilinoDetail /></ProtectedRoute>} />
                            <Route path="/edit-inquilino/:id" element={<ProtectedRoute roles={['admin', 'employee']}><EditInquilino /></ProtectedRoute>} />

                            {/* Rutas para Activos - Protegidas */}
                            <Route path="/add-activo/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']}><AddActivo /></ProtectedRoute>} />
                            <Route path="/activos/:id" element={<ProtectedRoute><ActivoDetail /></ProtectedRoute>} />
                            <Route path="/edit-activo/:id" element={<ProtectedRoute roles={['admin', 'employee']}><EditActivo /></ProtectedRoute>} />

                            {/* Rutas para Pagos - Protegidas */}
                            <Route path="/add-pago/:consorcioId" element={<ProtectedRoute roles={['admin', 'employee']}><AddPago /></ProtectedRoute>} />

                            {/* Ruta comodín para cualquier otra URL cuando está autenticado */}
                            <Route path="*" element={<ProtectedRoute><Consorcios /></ProtectedRoute>} />
                        </Routes>
                    </Container>
                </>
            )}
        </>
    );
}

// Envolver AppContent en Router para que useNavigate funcione correctamente
function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;