import { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaSignInAlt } from 'react-icons/fa';

const BACKEND_BASE_URL = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev'; 

const AuthForm = ({ onAuthSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
       

        try {
            const LOGIN_ENDPOINT_PATH = '/api/auth/login';
           
            const response = await fetch(`${BACKEND_BASE_URL}${LOGIN_ENDPOINT_PATH}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            
            const data = await response.json();
           

            if (!response.ok) {
               
                throw new Error(data.msg || 'Error en el inicio de sesión.');
            }

           
            if (data.token && data.nombre) {
                
                localStorage.setItem('authToken', data.token);
                onAuthSuccess(data.token);
                

            } else {
               
                throw new Error('Token o nombre de usuario faltantes en la respuesta.');
            }

        } catch (err) {
           
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                setError('No se pudo conectar con el servidor. Por favor, verifica que tu backend esté corriendo y que la URL de la API sea correcta. Puede ser un problema de CORS.');
            } else if (err instanceof SyntaxError) {
                setError(`Error al procesar la respuesta del servidor. Asegúrate de que el servidor siempre envíe JSON válido. Mensaje: ${err.message}`);
            } else {
                setError(err.message || 'Ocurrió un error inesperado al iniciar sesión.');
            }
        } finally {
            setLoading(false);
            
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6} lg={4}>
                    <Card className="shadow-lg border-0">
                        <Card.Header as="h3" className="text-center bg-dark text-white p-3">
                            <FaSignInAlt className="me-2" /> Iniciar Sesión
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Correo Electrónico</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Ingresa tu email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        aria-label="Correo Electrónico"
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
                                        aria-label="Contraseña"
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 mt-3"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : 'Iniciar Sesión'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AuthForm;
