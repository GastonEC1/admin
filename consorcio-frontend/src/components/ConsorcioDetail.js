import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Alert, Button, Badge, ListGroup } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa'; 

function ConsorcioDetail() {
    const { id } = useParams();
    const [consorcio, setConsorcio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteInquilinoSuccess, setDeleteInquilinoSuccess] = useState('');
    const [deleteInquilinoError, setDeleteInquilinoError] = useState('');

    // ¡VERIFICA ESTA URL! Debe ser la de tu puerto 5000 de Codespaces + /api/consorcios
    const backendUrl = 'https://plhsk4j3-5000.brs.devtunnels.ms/api/consorcios';
    const inquilinosBackendUrl = 'https://plhsk4j3-5000.brs.devtunnels.ms/api/inquilinos';
    const activosBackendUrl = 'https://plhsk4j3-5000.brs.devtunnels.ms/api/activos'; 

    useEffect(() => {
        const fetchConsorcio = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${backendUrl}/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setConsorcio(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los detalles del consorcio.');
                setLoading(false);
                console.error('Error fetching consorcio details:', err); // Log más detallado
            }
        };
        fetchConsorcio();
    }, [id]);

    const handleDeleteInquilino = async (inquilinoId) => {
        setDeleteInquilinoSuccess('');
        setDeleteInquilinoError('');
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${inquilinosBackendUrl}/${inquilinoId}`, {
                headers: { 'x-auth-token': token }
            });
            setDeleteInquilinoSuccess('Inquilino eliminado con éxito.');
            setConsorcio(prevConsorcio => ({
                ...prevConsorcio,
                inquilinos: prevConsorcio.inquilinos.filter(inquilino => inquilino._id !== inquilinoId)
            }));
        } catch (err) {
            setDeleteInquilinoError('Error al eliminar el inquilino. Inténtalo de nuevo.');
            console.error('Error al eliminar inquilino:', err);
        }
    };

    const handleDeleteActivo = async (activoId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${activosBackendUrl}/${activoId}`, {
                headers: { 'x-auth-token': token }
            });
            setConsorcio(prevConsorcio => ({
                ...prevConsorcio,
                activos: prevConsorcio.activos.filter(activo => activo._id !== activoId)
            }));
            return { success: true, message: 'Activo eliminado con éxito.' }; 
        } catch (err) {
            console.error('Error al eliminar activo:', err);
            return { success: false, message: 'Error al eliminar el activo. Inténtalo de nuevo.' }; 
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

    const getUpcomingMaintenanceAlerts = () => {
        if (!consorcio || !consorcio.activos) {
            return [];
        }

        const today = new Date();
        today.setHours(0,0,0,0); 

        return consorcio.activos.filter(activo => {
            if (!activo.proximoMantenimiento) {
                return false; 
            }
            const maintenanceDate = new Date(activo.proximoMantenimiento);
            maintenanceDate.setHours(0,0,0,0); 

            const diffTime = maintenanceDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays <= 15; 
        }).sort((a, b) => {
            const dateA = new Date(a.proximoMantenimiento).getTime();
            const dateB = new Date(b.proximoMantenimiento).getTime();
            return dateA - dateB;
        });
    };

    const formatFecha = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };


    if (loading) {
        return <Container className="mt-5 text-center"><h2>Cargando...</h2></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    if (!consorcio) {
        return <Container className="mt-5"><Alert variant="info">Consorcio no encontrado.</Alert></Container>;
    }

    const upcomingMaintenanceAlerts = getUpcomingMaintenanceAlerts(); 


    return (
        <Container className="mt-5">
            <Link to="/consorcios" className="btn btn-secondary mb-3">
                Volver a Consorcios
            </Link>

            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Header as="h2">{consorcio.nombre}</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                <strong>Dirección:</strong> {consorcio.direccion}<br/>
                                <strong>Pisos:</strong> {consorcio.pisos}<br/>
                                <strong>Unidades:</strong> {consorcio.unidades}<br/>
                                {/* Información del Portero */}
                                <hr /> {/* Separador visual */}
                                <h5>Información del Portero:</h5>
                                <strong>Nombre:</strong> {consorcio.nombrePortero || 'N/A'}<br/>
                                <strong>Teléfono:</strong> {consorcio.telefonoPortero || 'N/A'}<br/>
                                <strong>Email:</strong> {consorcio.emailPortero || 'N/A'}<br/>
                                {/* Horario del Portero eliminado */}
                            </Card.Text>
                            <Link to={`/edit-consorcio/${consorcio._id}`} className="btn btn-warning mt-3">
                                <FaEdit /> Editar Consorcio
                            </Link>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h3>Inquilinos</h3>
                            <Link to={`/add-inquilino/${consorcio._id}`}> 
                                <Button variant="primary">+ Agregar Inquilino</Button>
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            {deleteInquilinoSuccess && <Alert variant="success">{deleteInquilinoSuccess}</Alert>}
                            {deleteInquilinoError && <Alert variant="danger">{deleteInquilinoError}</Alert>}
                            {consorcio.inquilinos && consorcio.inquilinos.length > 0 ? (
                                <Table striped bordered hover responsive className="mt-3">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Email</th>
                                            <th>Unidad</th>
                                            <th>Tipo de Unidad</th> 
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consorcio.inquilinos.map(inquilino => (
                                            <tr key={inquilino._id}>
                                                <td>
                                                    <Link to={`/inquilinos/${inquilino._id}`}>
                                                        {inquilino.nombre}
                                                    </Link>
                                                </td>
                                                <td>{inquilino.email}</td>
                                                <td>{inquilino.unidad}</td>
                                                <td>{inquilino.tipoUnidad}</td>
                                                <td>
                                                    <Link to={`/edit-inquilino/${inquilino._id}`} className="btn btn-warning btn-sm me-2">
                                                        <FaEdit /> Editar
                                                    </Link>
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm" 
                                                        onClick={() => handleDeleteInquilino(inquilino._id)}
                                                    >
                                                        <FaTrash /> Eliminar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-muted mt-3">No hay inquilinos para este consorcio.</p>
                            )}
                        </Card.Body>
                    </Card>
                    
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h5 className="card-title">Historial de Gastos</h5>
                            <p className="text-muted">
                                No hay datos de gastos en esta demo.
                            </p>
                        </Card.Body>
                    </Card>

                </Col>

                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h3>Activos</h3>
                            <Link to={`/add-activo/${consorcio._id}`}>
                                <Button variant="primary">+ Agregar Activo</Button>
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            {consorcio.activos && consorcio.activos.length > 0 ? (
                                <Table striped bordered hover responsive className="mt-3">
                                    <thead>
                                        <tr>
                                            <th>Activo y Estado</th> 
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consorcio.activos.map(activo => {
                                            const status = getMaintenanceStatus(activo.proximoMantenimiento);
                                            return (
                                                <tr key={activo._id}>
                                                    <td>
                                                        <Link to={`/activos/${activo._id}`} className="text-decoration-none text-dark me-2">
                                                            {activo.nombre}
                                                        </Link>
                                                        <Badge bg={status.color}>{status.text}</Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-muted mt-3">No hay activos para este consorcio.</p>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm">
                        <Card.Body>
                            <h5 className="card-title">Alertas de Mantenimiento</h5>
                            {upcomingMaintenanceAlerts.length > 0 ? (
                                <ListGroup variant="flush"> 
                                    {upcomingMaintenanceAlerts.map(activo => {
                                        const status = getMaintenanceStatus(activo.proximoMantenimiento);
                                        return (
                                            <ListGroup.Item key={activo._id} className="d-flex justify-content-between align-items-center">
                                                <Link to={`/activos/${activo._id}`} className="text-decoration-none text-dark">
                                                    {activo.nombre}
                                                </Link>
                                                <Badge bg={status.color}>{status.text}</Badge>
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            ) : (
                                <p className="text-muted">No hay alertas de mantenimiento próximas o vencidas.</p>
                            )}
                        </Card.Body>
                    </Card>

                </Col>
            </Row>
        </Container>
    );
}

export default ConsorcioDetail;