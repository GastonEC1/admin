import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert } from 'react-bootstrap';

function AuthForm({ onAuth }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const backendUrl = 'https://plhsk4j3-5000.brs.devtunnels.ms';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${backendUrl}/login`, { email, password });
            
            localStorage.setItem('token', response.data.token);
            onAuth();
            
        } catch (err) {
            if (err.response) {
                // El servidor respondió con un código de estado fuera del rango 2xx
                setError(err.response.data.message || 'Error de autenticación. Verifica tus credenciales.');
            } else if (err.request) {
                // La petición se hizo pero no se recibió respuesta
                setError('No se pudo conectar con el servidor. Por favor, asegúrate de que el backend esté funcionando.');
            } else {
                // Algo más causó el error
                setError('Error desconocido. Inténtalo de nuevo.');
            }
        }
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center">Iniciar Sesión</h2>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            <Form onSubmit={handleSubmit} className="mt-3">
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                        type="email" 
                        placeholder="Ingresa tu email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Contraseña" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-2">
                    Iniciar Sesión
                </Button>
            </Form>
        </Container>
    );
}

export default AuthForm;