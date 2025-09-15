import React, { useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa'; // Importar iconos

// ¡IMPORTANTE! VERIFICA ESTA URL. Debe ser la URL de tu backend en Codespaces, terminando en /api
const API_BASE_URL = 'https://prueba-3-8t74.onrender.com/api'; 

function RegisterForm() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('employee'); // Rol por defecto al registrar
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        const token = localStorage.getItem('authToken'); // Necesitamos el token del admin logueado

        if (!token) {
            setError('Debes iniciar sesión como administrador para registrar nuevos usuarios.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, 
                { nombre, email, password, rol },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setMessage(response.data.msg || 'Usuario registrado exitosamente.');
            // Limpiar formulario después del registro exitoso
            setNombre('');
            setEmail('');
            setPassword('');
            setRol('employee'); // Resetear a rol por defecto
        } catch (err) {
            console.error('Registro de usuario error:', err);
            setError(err.response?.data?.msg || 'Error al registrar usuario. Verifica la información.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-lg border-0">
                        <Card.Header as="h3" className="text-center bg-primary text-white p-3">
                            <FaUserPlus className="me-2" /> Registrar Nuevo Usuario
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                                {message && <Alert variant="success" className="text-center">{message}</Alert>}

                                <Form.Group className="mb-3" controlId="formNombre">
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Ingresa el nombre del usuario" 
                                        value={nombre} 
                                        onChange={(e) => setNombre(e.target.value)} 
                                        required 
                                        aria-label="Nombre del usuario"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Correo Electrónico</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder="Ingresa el email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        aria-label="Correo Electrónico"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Contraseña" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                        aria-label="Contraseña"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formRol">
                                    <Form.Label>Rol</Form.Label>
                                    <Form.Control 
                                        as="select" 
                                        value={rol} 
                                        onChange={(e) => setRol(e.target.value)} 
                                        aria-label="Rol del usuario"
                                    >
                                        <option value="admin">Administrador</option>
                                        <option value="employee">Empleado</option>
                                        <option value="owner">Propietario</option>
                                    </Form.Control>
                                </Form.Group>
                                
                                <Button 
                                    variant="success" 
                                    type="submit" 
                                    className="w-100 mt-3" 
                                    disabled={loading}
                                >
                                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : 'Registrar Usuario'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default RegisterForm;
