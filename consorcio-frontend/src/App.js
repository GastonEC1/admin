import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavbar from './components/Navbar';
import AuthForm from './components/AuthForm';
import Consorcios from './components/Consorcios';
import ConsorcioDetail from './components/ConsorcioDetail';
import AddConsorcio from './components/AddConsorcio';
import AddInquilino from './components/AddInquilinos'; 
import EditInquilino from './components/EditInquilino';   
import 'bootstrap/dist/css/bootstrap.min.css';
import EditActivo from './components/EditActivos';
import ActivoDetail from './components/ActivoDetail';
import AddActivo from './components/AddActivo';
import EditConsorcio from './components/EditConsorcio'
import InquilinoDetail from './components/InquilinoDetail';
import AddPago from './components/AddPago';

function App() {
    // CAMBIA ESTO A 'false' CUANDO HABILITES EL LOGIN REALMENTE
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    const handleAuth = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            {isAuthenticated ? (
                <>
                    <AppNavbar onLogout={handleLogout} />
                    <Container>
                        <Routes>
                            <Route path="/" element={<Consorcios />} />
                            <Route path="/consorcios" element={<Consorcios />} />
                            <Route path="/consorcios/:id" element={<ConsorcioDetail />} />
                            <Route path="/add-consorcio" element={<AddConsorcio />} />
                            <Route path="/edit-inquilino/:id" element={<EditInquilino />} />
                            <Route path="/edit-activo/:id" element={<EditActivo></EditActivo>}/>
                            <Route path="/activos/:id" element={<ActivoDetail/>}/>
                            <Route path="/add-inquilino/:consorcioId" element={<AddInquilino/>} />
                            <Route path="/inquilinos/:id" element={<InquilinoDetail />} /> 
                            <Route path="/add-activo/:consorcioId" element={<AddActivo />} />
                            <Route path="/edit-consorcio/:id" element={<EditConsorcio/>}/>
                            <Route path="/add-pago/:consorcioId" element={<AddPago />} />
                        </Routes>
                    </Container>
                </>
            ) : (
                <AuthForm onAuth={handleAuth} />
            )}
        </Router>
    );
}

export default App;