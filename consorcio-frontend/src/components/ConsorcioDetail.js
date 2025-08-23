import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Alert, Button, Badge, ListGroup, Form } from 'react-bootstrap'; // Importa Form
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa'; // Importa FaSearch

function ConsorcioDetail() {
    const { id } = useParams();
    const [consorcio, setConsorcio] = useState(null);
    const [pagos, setPagos] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteInquilinoSuccess, setDeleteInquilinoSuccess] = useState('');
    const [deleteInquilinoError, setDeleteInquilinoError] = useState('');
    const [deleteActivoSuccess, setDeleteActivoSuccess] = useState(''); 
    const [deleteActivoError, setDeleteActivoError] = useState('');     

    // Estados para los buscadores
    const [inquilinoSearchTerm, setInquilinoSearchTerm] = useState('');
    const [pagoStartDate, setPagoStartDate] = useState('');
    const [pagoEndDate, setPagoEndDate] = useState('');

    const backendUrl = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api'; // ¡Actualiza con la URL de tu Codespace!
    const consorciosBackendUrl = `${backendUrl}/consorcios`;
    const inquilinosBackendUrl = `${backendUrl}/inquilinos`;
    const activosBackendUrl = `${backendUrl}/activos`; 
    const pagosBackendUrl = `${backendUrl}/pagos`; 

    const token = localStorage.getItem('token');

    const fetchConsorcioAndPagos = async () => {
        try {
            // Obtener detalles del consorcio
            const consorcioResponse = await axios.get(`${consorciosBackendUrl}/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setConsorcio(consorcioResponse.data);

            // Obtener pagos del consorcio
            const pagosResponse = await axios.get(`${pagosBackendUrl}?consorcioId=${id}`, {
                headers: { 'x-auth-token': token }
            });
            setPagos(pagosResponse.data);

            setLoading(false);
        } catch (err) {
            setError('Error al cargar los detalles del consorcio o sus pagos.');
            setLoading(false);
            console.error('Error fetching consorcio or payments details:', err);
        }
    };

    useEffect(() => {
        fetchConsorcioAndPagos();
    }, [id]);

    const handleDeleteInquilino = async (inquilinoId) => {
        setDeleteInquilinoSuccess('');
        setDeleteInquilinoError('');
        if (window.confirm('¿Estás seguro de que quieres eliminar este inquilino? Esta acción no se puede deshacer.')) {
            try {
                await axios.delete(`${inquilinosBackendUrl}/${inquilinoId}`, {
                    headers: { 'x-auth-token': token }
                });
                setDeleteInquilinoSuccess('Inquilino eliminado con éxito.');
                // Refresca los datos para que la lista de inquilinos se actualice
                fetchConsorcioAndPagos(); 
            } catch (err) {
                setDeleteInquilinoError('Error al eliminar el inquilino. Inténtalo de nuevo.');
                console.error('Error al eliminar inquilino:', err);
            }
        }
    };

    const handleDeleteActivo = async (activoId) => {
        setDeleteActivoSuccess('');
        setDeleteActivoError('');
        if (window.confirm('¿Estás seguro de que quieres eliminar este activo? Esta acción no se puede deshacer.')) {
            try {
                await axios.delete(`${activosBackendUrl}/${activoId}`, {
                    headers: { 'x-auth-token': token }
                });
                setDeleteActivoSuccess('Activo eliminado con éxito.');
                // Refresca los datos para que la lista de activos se actualice
                fetchConsorcioAndPagos(); 
            } catch (err) {
                setDeleteActivoError('Error al eliminar el activo. Inténtalo de nuevo.');
                console.error('Error al eliminar activo:', err);
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

    // --- Lógica de filtrado para Inquilinos ---
    const filteredInquilinos = consorcio?.inquilinos?.filter(inquilino => 
        inquilino.nombre.toLowerCase().includes(inquilinoSearchTerm.toLowerCase()) ||
        inquilino.unidad.toLowerCase().includes(inquilinoSearchTerm.toLowerCase())
    ) || [];

    // --- Lógica de filtrado para Pagos ---
    const filteredPagos = pagos.filter(pago => {
        const pagoDate = new Date(pago.fechaPago);
        pagoDate.setHours(0,0,0,0); // Normalizar a medianoche para comparación

        let startDate = null;
        if (pagoStartDate) {
            startDate = new Date(pagoStartDate);
            startDate.setHours(0,0,0,0);
        }

        let endDate = null;
        if (pagoEndDate) {
            endDate = new Date(pagoEndDate);
            endDate.setHours(23,59,59,999); // Final del día
        }

        const matchesStartDate = startDate ? pagoDate >= startDate : true;
        const matchesEndDate = endDate ? pagoDate <= endDate : true;

        return matchesStartDate && matchesEndDate;
    });


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
                <Col md={7}>
                    <Card className="mb-4">
                        <Card.Header as="h2">{consorcio.nombre}</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                <strong>Dirección:</strong> {consorcio.direccion}<br/>
                                <strong>Pisos:</strong> {consorcio.pisos}<br/>
                                <strong>Unidades:</strong> {consorcio.unidades}<br/>
                                <hr /> 
                                <h5>Información del Portero:</h5>
                                <strong>Nombre:</strong> {consorcio.nombrePortero || 'N/A'}<br/>
                                <strong>Teléfono:</strong> {consorcio.telefonoPortero || 'N/A'}<br/>
                                <strong>Email:</strong> {consorcio.emailPortero || 'N/A'}<br/>
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
                            
                            {/* Buscador de Inquilinos */}
                            <Form.Group className="mb-3">
                                <Form.Label className="visually-hidden">Buscar Inquilino</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text"><FaSearch /></span>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Buscar por nombre o unidad..." 
                                        value={inquilinoSearchTerm} 
                                        onChange={(e) => setInquilinoSearchTerm(e.target.value)} 
                                    />
                                    {inquilinoSearchTerm && (
                                        <Button variant="outline-secondary" onClick={() => setInquilinoSearchTerm('')}>X</Button>
                                    )}
                                </div>
                            </Form.Group>

                            {filteredInquilinos.length > 0 ? (
                                <Table striped bordered hover responsive className="mt-3">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Unidad</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInquilinos.map(inquilino => (
                                            <tr key={inquilino._id}>
                                                <td>
                                                    <Link to={`/inquilinos/${inquilino._id}`}>
                                                        {inquilino.nombre}
                                                    </Link>
                                                </td>
                                                <td>{inquilino.unidad}</td>
                                                <td>
                                                    <Link to={`/edit-inquilino/${inquilino._id}`} className="btn btn-warning btn-sm me-2">
                                                        <FaEdit /> 
                                                    </Link>
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm" 
                                                        onClick={() => handleDeleteInquilino(inquilino._id)}
                                                    >
                                                        <FaTrash /> 
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-muted mt-3">No hay inquilinos para este consorcio que coincidan con la búsqueda.</p>
                            )}
                        </Card.Body>
                    </Card>
                    
                    {/* Nueva Sección: Historial de Pagos */}
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h3>Historial de Pagos</h3>
                            <Link to={`/add-pago/${consorcio._id}`}>
                                <Button variant="success">+ Registrar Pago</Button>
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            {/* Buscador de Pagos por Fechas */}
                            <Form.Group className="mb-3">
                                <Form.Label>Filtrar Pagos por Fecha</Form.Label>
                                <div className="d-flex mb-2">
                                    <Form.Control 
                                        type="date" 
                                        value={pagoStartDate} 
                                        onChange={(e) => setPagoStartDate(e.target.value)} 
                                        className="me-2"
                                        title="Fecha de inicio"
                                    />
                                    <Form.Control 
                                        type="date" 
                                        value={pagoEndDate} 
                                        onChange={(e) => setPagoEndDate(e.target.value)} 
                                        className="me-2"
                                        title="Fecha de fin"
                                    />
                                    {(pagoStartDate || pagoEndDate) && (
                                        <Button variant="outline-secondary" onClick={() => { setPagoStartDate(''); setPagoEndDate(''); }}>X</Button>
                                    )}
                                </div>
                            </Form.Group>

                            {filteredPagos.length > 0 ? (
                                <Table striped bordered hover responsive className="mt-3">
                                    <thead>
                                        <tr>
                                            <th>Período</th>
                                            <th>Inquilino</th>
                                            <th>Monto</th>
                                            <th>Fecha de Pago</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPagos.map(pago => (
                                            <tr key={pago._id}>
                                                <td>{pago.periodo}</td>
                                                <td>
                                                    <Link to={`/inquilinos/${pago.inquilino._id}`}>
                                                        {pago.inquilino.nombre} ({pago.inquilino.unidad})
                                                    </Link>
                                                </td>
                                                <td>${pago.monto.toFixed(2)}</td>
                                                <td>{formatFecha(pago.fechaPago)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-muted">No hay pagos registrados para este consorcio que coincidan con los filtros.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={5}>
                    <Card className="mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h3>Activos</h3>
                            <Link to={`/add-activo/${consorcio._id}`}>
                                <Button variant="primary">+ Agregar Activo</Button>
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            {deleteActivoSuccess && <Alert variant="success">{deleteActivoSuccess}</Alert>}
                            {deleteActivoError && <Alert variant="danger">{deleteActivoError}</Alert>}
                            {consorcio.activos && consorcio.activos.length > 0 ? (
                                <Table striped bordered hover responsive className="mt-3">
                                    <thead>
                                        <tr>
                                            <th>Activo</th> 
                                            <th>Estado</th> 
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
                                                    </td>
                                                    <td>
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