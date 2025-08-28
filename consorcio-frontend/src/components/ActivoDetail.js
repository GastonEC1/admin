import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Alert, Button, Modal, Form, Spinner, Row, Col, ListGroup } from 'react-bootstrap'; // Se añadió ListGroup
import { FaEdit, FaTrash, FaEnvelope, FaTools, FaArrowLeft, FaCalendarAlt, FaMoneyBillWave, FaInfoCircle, FaRegDotCircle, FaClipboardList } from 'react-icons/fa';

function ActivoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activo, setActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [emailStatus, setEmailStatus] = useState(null);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

    const backendBaseUrl = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api';
    const activosBackendUrl = `${backendBaseUrl}/activos`;
    const emailBackendUrl = `${backendBaseUrl}/email/send-maintenance-notification`;
    const token = localStorage.getItem('token');

    const fetchActivo = async () => {
        setLoading(true);
        setError('');
        setDeleteSuccess('');
        setDeleteError('');
        setEmailStatus(null);
        try {
            const response = await axios.get(`${activosBackendUrl}/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setActivo(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar los detalles del activo. Por favor, intente de nuevo.');
            setLoading(false);
            console.error('Error fetching activo details:', err);
        }
    };

    useEffect(() => {
        fetchActivo();
    }, [id, token, activosBackendUrl]);

    const handleDeleteActivoClick = () => {
        setShowDeleteConfirmModal(true);
    };

    const confirmDeleteActivo = async () => {
        setShowDeleteConfirmModal(false);
        setDeleteSuccess('');
        setDeleteError('');

        try {
            await axios.delete(`${activosBackendUrl}/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setDeleteSuccess('Activo eliminado con éxito.');
            const consorcioId = activo?.consorcio?._id || activo?.consorcio;
            if (consorcioId) {
                navigate(`/consorcios/${consorcioId}`);
            } else {
                navigate('/consorcios');
            }
        } catch (err) {
            setDeleteError('Error al eliminar el activo. Inténtalo de nuevo.');
            console.error('Error deleting activo:', err);
        }
    };

    const handleOpenEmailModal = () => {
        setEmailStatus(null);

        if (!activo) {
            setEmailStatus({ type: 'danger', message: 'No se puede preparar la notificación. Los datos del activo no están cargados.' });
            return;
        }
        if (!activo.consorcio) {
            setEmailStatus({ type: 'danger', message: 'No se puede preparar la notificación. El activo no está asociado a un consorcio.' });
            return;
        }
        if (activo.ultimoCostoMantenimiento === undefined || activo.ultimoCostoMantenimiento === null) {
            setEmailStatus({ type: 'danger', message: 'No se puede preparar la notificación. Falta el costo del último mantenimiento del activo.' });
            return;
        }

        if (!activo.consorcio.inquilinos || activo.consorcio.inquilinos.length === 0) {
            setEmailStatus({ type: 'danger', message: 'El consorcio asociado no tiene inquilinos para enviar notificaciones.' });
            return;
        }

        const fechaUltimoMantenimiento = activo.fechaUltimoMantenimiento ? formatFecha(activo.fechaUltimoMantenimiento) : 'N/A';
        const costoFormateado = activo.ultimoCostoMantenimiento ? formatCurrency(activo.ultimoCostoMantenimiento) : 'N/A';

        const subject = `Notificación de Mantenimiento - ${activo.consorcio.nombre} - ${activo.nombre}`;
        const body = `
Estimado/a Inquilino/a,

Le informamos que se ha realizado el mantenimiento del activo "${activo.nombre}" (Ubicación: ${activo.ubicacion}) en el consorcio "${activo.consorcio.nombre}".
${activo.descripcion ? `Descripción del activo: ${activo.descripcion}` : ''}

Fecha de Último Mantenimiento: ${fechaUltimoMantenimiento}
Costo Asociado: ${costoFormateado}

Este costo se incluirá en sus próximas expensas. Para más detalles, por favor, revise el historial de gastos.

Atentamente,
La Administración del Consorcio "${activo.consorcio.nombre}"
`;
        setEmailSubject(subject);
        setEmailBody(body);
        setShowEmailModal(true);
    };

    const handleCloseEmailModal = () => {
        setShowEmailModal(false);
        setEmailSubject('');
        setEmailBody('');
        setSendingEmail(false);
    };

    const handleSendEditedEmail = async () => {
        setSendingEmail(true);
        setEmailStatus(null);

        try {
            await axios.post(emailBackendUrl, {
                consorcioId: activo.consorcio._id,
                activoId: activo._id,
                costoMantenimiento: activo.ultimoCostoMantenimiento,
                fechaMantenimiento: activo.fechaUltimoMantenimiento,
                editedSubject: emailSubject,
                editedBody: emailBody
            }, {
                headers: { 'x-auth-token': token }
            });
            setEmailStatus({ type: 'success', message: 'Notificación de mantenimiento enviada con éxito a los inquilinos del consorcio.' });
            handleCloseEmailModal();
        } catch (err) {
            console.error('Error al enviar notificación por email:', err.response ? err.response.data : err.message);
            setEmailStatus({ type: 'danger', message: `Error al enviar notificación: ${err.response?.data?.msg || err.message}` });
        } finally {
            setSendingEmail(false);
        }
    };

    const formatFecha = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return 'N/A';
        return parseFloat(amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" className="mb-3" />
                <h2>Cargando detalles del activo...</h2>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="secondary" onClick={() => navigate(-1)}><FaArrowLeft className="me-2" /> Volver</Button>
            </Container>
        );
    }

    if (!activo) {
        return (
            <Container className="mt-5">
                <Alert variant="info">Activo no encontrado.</Alert>
                <Button variant="secondary" onClick={() => navigate('/consorcios')}><FaArrowLeft className="me-2" /> Volver a Consorcios</Button>
            </Container>
        );
    }

    // Prepara la descripción como una lista
    const descriptionItems = activo.descripcion 
        ? activo.descripcion.split('\n').filter(item => item.trim() !== '') // Divide por salto de línea y filtra ítems vacíos
        : [];

    return (
        <Container className="my-5">
            {activo.consorcio && activo.consorcio._id ? (
                <Link to={`/consorcios/${activo.consorcio._id}`} className="btn btn-secondary mb-4">
                    <FaArrowLeft className="me-2" /> Volver al Consorcio
                </Link>
            ) : (
                <Link to="/consorcios" className="btn btn-secondary mb-4">
                    <FaArrowLeft className="me-2" /> Volver a Consorcios
                </Link>
            )}

            <h1 className="mb-2 text-primary">{activo.nombre} <small className="text-muted fs-4">({activo.tipo || 'N/A'})</small></h1>
            {activo.consorcio && (
                <p className="lead text-muted mb-4">Perteneciente al consorcio: <Link to={`/consorcios/${activo.consorcio._id}`} className="text-decoration-none">{activo.consorcio.nombre}</Link></p>
            )}

            <Card className="shadow-lg">
                <Card.Header as="h2" className="bg-light text-dark p-3 d-flex align-items-center">
                    <FaTools className="me-3 text-secondary" size="1.8em" /> Detalles del Activo
                </Card.Header>
                <Card.Body>
                    {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}
                    {deleteError && <Alert variant="danger">{deleteError}</Alert>}
                    {emailStatus && <Alert variant={emailStatus.type}>{emailStatus.message}</Alert>}

                    {/* Sección de Datos Generales */}
                    <h5 className="mb-3 text-primary"><FaInfoCircle className="me-2" /> Información General</h5>
                    <Row className="mb-3">
                        <Col md={6} className="mb-2"><strong>Marca:</strong> {activo.marca || 'N/A'}</Col>
                        <Col md={6} className="mb-2"><strong>Modelo:</strong> {activo.modelo || 'N/A'}</Col>
                        <Col md={6} className="mb-2"><strong>Ubicación:</strong> {activo.ubicacion || 'N/A'}</Col>
                        <Col md={6} className="mb-2"><strong>Estado:</strong> {activo.estado || 'N/A'}</Col>
                    </Row>
                    
                    {/* Sección de Descripción mejorada */}
                    <h5 className="mb-3 mt-4 text-primary"><FaClipboardList className="me-2" /> Descripción Detallada</h5>
                    <Card className="mb-4 bg-light shadow-sm border-secondary-subtle">
                        <Card.Body className="text-dark">
                            {descriptionItems.length > 0 ? (
                                <ListGroup variant="flush">
                                    {descriptionItems.map((item, index) => (
                                        <ListGroup.Item key={index} className="bg-transparent border-0 py-1 px-0 text-break">
                                            <FaRegDotCircle className="text-success me-2" size="0.8em" /> {item.trim()}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <p className="text-muted mb-0">No se ha proporcionado una descripción detallada para este activo.</p>
                            )}
                        </Card.Body>
                    </Card>

                    <hr className="my-4" />

                    {/* Sección de Fechas y Mantenimiento */}
                    <h5 className="mb-3 text-primary"><FaCalendarAlt className="me-2" /> Historial y Programación</h5>
                    <Row className="mb-3">
                        <Col md={6} className="mb-2"><strong>Fecha de Instalación:</strong> {formatFecha(activo.fechaInstalacion)}</Col>
                        <Col md={6} className="mb-2"><strong>Frecuencia de Mantenimiento:</strong> {activo.frecuenciaMantenimiento || 'N/A'}</Col>
                        <Col md={6} className="mb-2"><strong>Último Mantenimiento:</strong> {formatFecha(activo.fechaUltimoMantenimiento)}</Col>
                        <Col md={6} className="mb-2"><strong>Próximo Mantenimiento:</strong> {formatFecha(activo.proximoMantenimiento)}</Col>
                    </Row>
                    
                    <hr className="my-4" />

                    {/* Botones de Acción */}
                    <div className="d-flex flex-wrap gap-2">
                        <Link to={`/edit-activo/${activo._id}`} className="btn btn-warning">
                            <FaEdit className="me-2" /> Editar Activo
                        </Link>
                        <Button variant="danger" onClick={handleDeleteActivoClick}>
                            <FaTrash className="me-2" /> Eliminar Activo
                        </Button>
                        <Button variant="info" onClick={handleOpenEmailModal}>
                            <FaEnvelope className="me-2" /> Notificar Mantenimiento
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal de Confirmación de Eliminación */}
            <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que deseas eliminar el activo "<strong>{activo.nombre}</strong>"? Esta acción es irreversible.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteActivo}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal para editar y enviar el correo */}
            <Modal show={showEmailModal} onHide={handleCloseEmailModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Previsualizar y Editar Notificación de Mantenimiento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Asunto del Correo</Form.Label>
                            <Form.Control
                                type="text"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cuerpo del Correo</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={15}
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                style={{ whiteSpace: 'pre-wrap' }}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEmailModal}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSendEditedEmail}
                        disabled={sendingEmail}
                    >
                        {sendingEmail ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Enviando...
                            </>
                        ) : 'Enviar Correo'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ActivoDetail;