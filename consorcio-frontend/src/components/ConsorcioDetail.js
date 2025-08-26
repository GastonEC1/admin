import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, ListGroup, Button, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { FaUserPlus, FaBuilding, FaArrowLeft, FaEdit, FaTrash, FaInfoCircle, FaMoneyBillWave, FaTools } from 'react-icons/fa';

// API_BASE_URL y userRole se reciben como props desde App.js
function ConsorcioDetail({ API_BASE_URL, userRole }) {
    const { id } = useParams();
    const [consorcio, setConsorcio] = useState(null);
    const [inquilinos, setInquilinos] = useState([]);
    const [activos, setActivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null);
    const navigate = useNavigate();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemTypeToDelete, setItemTypeToDelete] = useState('');

    const fetchConsorcioDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        setDeleteMessage(null);

        const token = localStorage.getItem('authToken');

        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión.');
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            // Se asume que API_BASE_URL no termina en /api
            const consorcioResponse = await axios.get(`${API_BASE_URL}/api/consorcios/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setConsorcio(consorcioResponse.data);

            const inquilinosResponse = await axios.get(`${API_BASE_URL}/api/inquilinos?consorcioId=${id}`, {
                headers: { 'x-auth-token': token }
            });
            setInquilinos(inquilinosResponse.data);

            const activosResponse = await axios.get(`${API_BASE_URL}/api/activos?consorcioId=${id}`, {
                headers: { 'x-auth-token': token }
            });
            setActivos(activosResponse.data);

        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Tu sesión ha expirado o no tienes permiso. Por favor, inicia sesión.');
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                setError('No tienes los permisos necesarios para ver este consorcio.');
            } else {
                setError(err.response?.data?.msg || 'Error al cargar los detalles del consorcio.');
            }
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, id, navigate]);

    useEffect(() => {
        fetchConsorcioDetails();
    }, [fetchConsorcioDetails]);

    const handleDeleteClick = (item, type) => {
        setItemToDelete(item);
        setItemTypeToDelete(type);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete || !itemTypeToDelete) return;

        try {
            const token = localStorage.getItem('authToken');
            let endpoint = '';
            let successMessage = '';

            switch (itemTypeToDelete) {
                case 'inquilino':
                    endpoint = `${API_BASE_URL}/api/inquilinos/${itemToDelete._id}`;
                    successMessage = 'Inquilino eliminado exitosamente.';
                    break;
                case 'activo':
                    endpoint = `${API_BASE_URL}/api/activos/${itemToDelete._id}`;
                    successMessage = 'Activo eliminado exitosamente.';
                    break;
                default:
                    throw new Error('Tipo de ítem desconocido para eliminar.');
            }

            await axios.delete(endpoint, {
                headers: { 'x-auth-token': token }
            });

            setDeleteMessage(successMessage);
            fetchConsorcioDetails();
            setTimeout(() => setDeleteMessage(null), 3000);
        } catch (err) {
            setError(err.response?.data?.msg || `Error al eliminar el ${itemTypeToDelete}.`);
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
            setItemTypeToDelete('');
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
        } else if (diffDays === 0) {
            return { color: 'danger', text: 'Vence hoy' };
        } else if (diffDays <= 15) {
            return { color: 'danger', text: `Vence en ${diffDays} días` };
        } else if (diffDays <= 30) {
            return { color: 'warning', text: `Vence en ${diffDays} días` };
        } else {
            return { color: 'success', text: 'OK' };
        }
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

            {/* Fila principal para dividir en dos grandes secciones */}
            <Row className="g-4">
                {/* Columna Izquierda (8/12 - Información del Consorcio, Inquilinos y Gestión de Pagos) */}
                <Col md={8}>
                    {/* Tarjeta de Información del Consorcio - Color de encabezado cambiado */}
                    <Card className="shadow-lg mb-4 border-0">
                        <Card.Header as="h2" className="text-center bg-light text-dark p-3">
                            Información del consorcio
                            {(userRole === 'admin' || userRole === 'employee') && (
                                <Link to={`/edit-consorcio/${consorcio._id}`} className="btn btn-outline-secondary btn-sm float-end" title="Editar Consorcio">
                                    <FaEdit /> Editar
                                </Link>
                            )}
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item><strong>Nombre:</strong> {consorcio.nombre}</ListGroup.Item>
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

                    {/* Tarjeta de Inquilinos - Color de encabezado cambiado */}
                    <Card className="shadow-sm border-0 mb-4 h-auto">
                        <Card.Header as="h3" className="bg-light text-dark d-flex justify-content-between align-items-center">
                            Inquilino
                            {(userRole === 'admin' || userRole === 'employee') && (
                                <Button as={Link} to={`/add-inquilino/${consorcio._id}`} variant="outline-secondary" size="sm" title="Añadir Inquilino">
                                    <FaUserPlus /> Añadir
                                </Button>
                            )}
                        </Card.Header>
                        <ListGroup variant="flush">
                            {inquilinos.length === 0 ? (
                                <ListGroup.Item className="text-muted text-center py-3">No hay inquilinos registrados para este consorcio.</ListGroup.Item>
                            ) : (
                                inquilinos.map(inquilino => (
                                    <ListGroup.Item key={inquilino._id} className="d-flex justify-content-between align-items-center py-2">
                                        <div>
                                            {inquilino.nombre} ({inquilino.unidad})
                                        </div>
                                        <div>
                                            <Button as={Link} to={`/inquilinos/${inquilino._id}`} variant="outline-primary" size="sm" className="me-2" title="Ver detalles del inquilino">
                                                <FaInfoCircle />
                                            </Button>
                                            {(userRole === 'admin' || userRole === 'employee') && (
                                                <>
                                                    <Button as={Link} to={`/edit-inquilino/${inquilino._id}`} variant="outline-secondary" size="sm" className="me-2" title="Editar inquilino">
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(inquilino, 'inquilino')} title="Eliminar inquilino">
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

                    {/* Sección para añadir pagos al consorcio (Gastos) - Color de encabezado cambiado */}
                    {(userRole === 'admin' || userRole === 'employee') && (
                        <Card className="shadow-sm border-0 h-auto">
                            <Card.Header as="h3" className="bg-light text-dark d-flex justify-content-between align-items-center">
                                Gastos
                            </Card.Header>
                            <Card.Body className="text-center py-4">
                                <p>Registra un nuevo pago asociado a este consorcio.</p>
                                <Button as={Link} to={`/add-pago/${consorcio._id}`} variant="dark" size="lg">
                                    <FaMoneyBillWave className="me-2" /> Registrar Nuevo Pago
                                </Button>
                            </Card.Body>
                        </Card>
                    )}
                </Col>

                {/* Columna Derecha (4/12 - Activos y Alertas de Activos) */}
                <Col md={4}>
                    {/* Tarjeta de Activos - Color de encabezado cambiado */}
                    <Card className="shadow-sm border-0 mb-4 h-auto">
                        <Card.Header as="h3" className="bg-light text-dark d-flex justify-content-between align-items-center">
                            Activos
                            {(userRole === 'admin' || userRole === 'employee') && (
                                <Button as={Link} to={`/add-activo/${consorcio._id}`} variant="outline-secondary" size="sm" title="Añadir Activo">
                                    <FaTools /> Añadir
                                </Button>
                            )}
                        </Card.Header>
                        <ListGroup variant="flush">
                            {activos.length === 0 ? (
                                <ListGroup.Item className="text-muted text-center py-3">No hay activos registrados para este consorcio.</ListGroup.Item>
                            ) : (
                                activos.map(activo => (
                                    <ListGroup.Item key={activo._id} className="d-flex justify-content-between align-items-center py-2">
                                        <div className="d-flex align-items-center flex-wrap">
                                            {/* *** CAMBIO CLAVE AQUÍ: El nombre del activo es ahora un enlace directo a su detalle *** */}
                                            <Link to={`/activos/${activo._id}`} className="text-decoration-none text-dark fw-bold me-2">
                                                {activo.nombre} ({activo.tipo})
                                            </Link>
                                            {/* Se eliminó el botón de "Ver detalles" */}
                                        </div>
                                        <div>
                                            {(userRole === 'admin' || userRole === 'employee') && (
                                                <>
                                                    <Button as={Link} to={`/edit-activo/${activo._id}`} variant="outline-secondary" size="sm" className="me-2" title="Editar activo">
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(activo, 'activo')} title="Eliminar activo">
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

                    {/* Tarjeta para Alertas de Mantenimiento - Color de encabezado cambiado */}
                    <Card className="shadow-sm border-0 h-auto">
                        <Card.Header as="h3" className="bg-light text-dark p-3">
                            Alerta de activo
                        </Card.Header>
                        <ListGroup variant="flush">
                            {activos.filter(activo => getMaintenanceStatus(activo.proximoMantenimiento).color === 'danger' || getMaintenanceStatus(activo.proximoMantenimiento).color === 'warning').length === 0 ? (
                                <ListGroup.Item className="text-muted text-center py-3">No hay alertas de mantenimiento pendientes.</ListGroup.Item>
                            ) : (
                                activos
                                    .filter(activo => {
                                        const status = getMaintenanceStatus(activo.proximoMantenimiento);
                                        return status.color === 'danger' || status.color === 'warning';
                                    })
                                    .map(activo => {
                                        const status = getMaintenanceStatus(activo.proximoMantenimiento);
                                        return (
                                            <ListGroup.Item key={activo._id} className="d-flex justify-content-between align-items-center py-2">
                                                <span>{activo.nombre}:</span>
                                                <Badge bg={status.color} className="ms-auto">
                                                    {status.text}
                                                </Badge>
                                            </ListGroup.Item>
                                        );
                                    })
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>

            {/* Modal de Confirmación de Eliminación */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que deseas eliminar este {itemTypeToDelete}? Esta acción es irreversible.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ConsorcioDetail;