import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, ListGroup, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaUserPlus, FaBuilding, FaArrowLeft, FaEdit, FaTrash, FaInfoCircle, FaMoneyBillWave, FaTools } from 'react-icons/fa'; // Importar iconos

// ¡IMPORTANTE! VERIFICA ESTA URL. Debe ser la URL de tu backend en Codespaces, terminando en /api
const API_BASE_URL = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api'; 

function ConsorcioDetail() {
    const { id } = useParams();
    const [consorcio, setConsorcio] = useState(null);
    const [inquilinos, setInquilinos] = useState([]);
    const [activos, setActivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null); // Para mensajes de eliminación
    const navigate = useNavigate();

    const userRole = localStorage.getItem('userRole'); // Obtener el rol del usuario

    useEffect(() => {
        fetchConsorcioDetails();
    }, [id]);

    const fetchConsorcioDetails = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        try {
            const consorcioResponse = await axios.get(`${API_BASE_URL}/consorcios/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setConsorcio(consorcioResponse.data);

            const inquilinosResponse = await axios.get(`${API_BASE_URL}/inquilinos?consorcioId=${id}`, {
                headers: { 'x-auth-token': token }
            });
            setInquilinos(inquilinosResponse.data);

            const activosResponse = await axios.get(`${API_BASE_URL}/activos?consorcioId=${id}`, {
                headers: { 'x-auth-token': token }
            });
            setActivos(activosResponse.data);

        } catch (err) {
            console.error('Error al obtener detalles del consorcio:', err);
            setError(err.response?.data?.msg || 'Error al cargar los detalles del consorcio.');
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteInquilino = async (inquilinoId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este inquilino?')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No estás autenticado para realizar esta acción.');
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/inquilinos/${inquilinoId}`, {
                headers: { 'x-auth-token': token }
            });
            setDeleteMessage('Inquilino eliminado exitosamente.');
            fetchConsorcioDetails(); // Recargar los detalles para actualizar la lista de inquilinos
            setTimeout(() => setDeleteMessage(null), 3000);
        } catch (err) {
            console.error('Error al eliminar inquilino:', err);
            setError(err.response?.data?.msg || 'Error al eliminar el inquilino.');
            if (err.response && err.response.status === 401) {
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                setError('No tienes permisos para eliminar inquilinos.');
            }
        }
    };

    const handleDeleteActivo = async (activoId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este activo?')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No estás autenticado para realizar esta acción.');
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/activos/${activoId}`, {
                headers: { 'x-auth-token': token }
            });
            setDeleteMessage('Activo eliminado exitosamente.');
            fetchConsorcioDetails(); // Recargar los detalles para actualizar la lista de activos
            setTimeout(() => setDeleteMessage(null), 3000);
        } catch (err) {
            console.error('Error al eliminar activo:', err);
            setError(err.response?.data?.msg || 'Error al eliminar el activo.');
            if (err.response && err.response.status === 401) {
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                setError('No tienes permisos para eliminar activos.');
            }
        }
    };

    const getMaintenanceStatus = (proximoMantenimientoDate) => {
        if (!proximoMantenimientoDate) {
            return { color: 'secondary', text: 'No programado' };
        }

        const today = new Date();
        const maintenanceDate = new Date(proximoMantenimientoDate);
        maintenanceDate.setHours(0,0,0,0); 
        today.setHours(0,0,0,0); 

        const diffTime = maintenanceDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) { 
            return { color: 'danger', text: 'Vencido' };
        } else if (diffDays <= 0) { 
            return { color: 'danger', text: 'Vence hoy' };
        } else if (diffDays <= 15) { 
            return { color: 'danger', text: `Vence en ${diffDays} días` }; 
        } else if (diffDays <= 30) { 
            return { color: 'warning', text: `Vence en ${diffDays} días` }; 
        } else { 
            return { color: 'success', text: 'OK' }; 
        }
    };

    const formatFecha = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando detalles del consorcio...</span>
                </Spinner>
                <p className="mt-2">Cargando detalles del consorcio...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    {error} <Button variant="link" onClick={() => navigate('/consorcios')}>Volver a Consorcios</Button>
                </Alert>
            </Container>
        );
    }

    if (!consorcio) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    Consorcio no encontrado. <Button variant="link" onClick={() => navigate('/consorcios')}>Volver a Consorcios</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <Button variant="secondary" onClick={() => navigate('/consorcios')} className="mb-4">
                <FaArrowLeft className="me-2" /> Volver a Consorcios
            </Button>
            
            {deleteMessage && <Alert variant="success">{deleteMessage}</Alert>}

            <Card className="shadow-lg mb-5 border-0">
                <Card.Header as="h2" className="text-center bg-primary text-white p-3">
                    {consorcio.nombre}
                    {(userRole === 'admin' || userRole === 'employee') && (
                        <Link to={`/edit-consorcio/${consorcio._id}`} className="btn btn-warning btn-sm float-end" title="Editar Consorcio">
                            <FaEdit /> Editar
                        </Link>
                    )}
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <ListGroup variant="flush">
                                <ListGroup.Item><strong>Dirección:</strong> {consorcio.direccion}</ListGroup.Item>
                                <ListGroup.Item><strong>Código Postal:</strong> {consorcio.codigoPostal}</ListGroup.Item>
                                <ListGroup.Item><strong>Provincia:</strong> {consorcio.provincia}</ListGroup.Item>
                                <ListGroup.Item><strong>Pisos:</strong> {consorcio.pisos}</ListGroup.Item>
                                <ListGroup.Item><strong>Unidades:</strong> {consorcio.unidades}</ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col md={6}>
                            <ListGroup variant="flush">
                                <ListGroup.Item><strong>Administrador:</strong> {consorcio.administrador}</ListGroup.Item>
                                <ListGroup.Item><strong>CUIT:</strong> {consorcio.cuit}</ListGroup.Item>
                                <ListGroup.Item><strong>Teléfono:</strong> {consorcio.telefono}</ListGroup.Item>
                                <ListGroup.Item><strong>Email:</strong> {consorcio.email || 'N/A'}</ListGroup.Item>
                            </ListGroup>
                        </Col>
                    </Row>
                    <hr className="my-3" />
                    <h5 className="mb-3">Información del Portero:</h5>
                    <Card.Text>
                        <strong>Nombre:</strong> {consorcio.nombrePortero || 'N/A'}<br/>
                        <strong>Teléfono:</strong> {consorcio.telefonoPortero || 'N/A'}<br/>
                        <strong>Email:</strong> {consorcio.emailPortero || 'N/A'}<br/>
                    </Card.Text>
                </Card.Body>
            </Card>

            <Row className="mt-4">
                <Col md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header as="h3" className="bg-info text-white d-flex justify-content-between align-items-center">
                            Inquilinos
                            {(userRole === 'admin' || userRole === 'employee') && (
                                <Button as={Link} to={`/add-inquilino/${consorcio._id}`} variant="light" size="sm" title="Añadir Inquilino">
                                    <FaUserPlus /> Añadir
                                </Button>
                            )}
                        </Card.Header>
                        <ListGroup variant="flush">
                            {inquilinos.length === 0 ? (
                                <ListGroup.Item className="text-muted text-center">No hay inquilinos registrados para este consorcio.</ListGroup.Item>
                            ) : (
                                inquilinos.map(inquilino => (
                                    <ListGroup.Item key={inquilino._id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            {inquilino.nombre} ({inquilino.unidad})
                                        </div>
                                        <div>
                                            <Button as={Link} to={`/inquilinos/${inquilino._id}`} variant="outline-primary" size="sm" className="me-2" title="Ver detalles del inquilino">
                                                <FaInfoCircle />
                                            </Button>
                                            {(userRole === 'admin' || userRole === 'employee') && (
                                                <>
                                                    <Button as={Link} to={`/edit-inquilino/${inquilino._id}`} variant="outline-warning" size="sm" className="me-2" title="Editar inquilino">
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteInquilino(inquilino._id)} title="Eliminar inquilino">
                                                        <FaTrash />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                ))
                            )}
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header as="h3" className="bg-success text-white d-flex justify-content-between align-items-center">
                            Activos
                            {(userRole === 'admin' || userRole === 'employee') && (
                                <Button as={Link} to={`/add-activo/${consorcio._id}`} variant="light" size="sm" title="Añadir Activo">
                                    <FaTools /> Añadir
                                </Button>
                            )}
                        </Card.Header>
                        <ListGroup variant="flush">
                            {activos.length === 0 ? (
                                <ListGroup.Item className="text-muted text-center">No hay activos registrados para este consorcio.</ListGroup.Item>
                            ) : (
                                activos.map(activo => (
                                    <ListGroup.Item key={activo._id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            {activo.nombre} ({activo.tipo})
                                        </div>
                                        <div>
                                            <Button as={Link} to={`/activos/${activo._id}`} variant="outline-primary" size="sm" className="me-2" title="Ver detalles del activo">
                                                <FaInfoCircle />
                                            </Button>
                                            {(userRole === 'admin' || userRole === 'employee') && (
                                                <>
                                                    <Button as={Link} to={`/edit-activo/${activo._id}`} variant="outline-warning" size="sm" className="me-2" title="Editar activo">
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteActivo(activo._id)} title="Eliminar activo">
                                                        <FaTrash />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                ))
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>

            {/* Sección para añadir pagos al consorcio */}
            {(userRole === 'admin' || userRole === 'employee') && (
                <Row className="mt-5">
                    <Col>
                        <Card className="shadow-sm border-0">
                            <Card.Header as="h3" className="bg-secondary text-white d-flex justify-content-between align-items-center">
                                Gestión de Pagos
                            </Card.Header>
                            <Card.Body className="text-center">
                                <p>Registra un nuevo pago asociado a este consorcio.</p>
                                <Button as={Link} to={`/add-pago/${consorcio._id}`} variant="dark" size="lg">
                                    <FaMoneyBillWave className="me-2" /> Registrar Nuevo Pago
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

        </Container>
    );
}

export default ConsorcioDetail;
