import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Alert, Button, Modal, Form } from 'react-bootstrap'; // Importa Modal y Form
import { FaEdit, FaTrash, FaEnvelope } from 'react-icons/fa'; 

function ActivoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activo, setActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState(''); 
    const [deleteError, setDeleteError] = useState('');     
    const [emailStatus, setEmailStatus] = useState(''); 

    // Estados para el modal de edición de correo
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false); // Estado para el botón de envío en el modal

    const backendBaseUrl = 'https://plhsk4j3-5000.brs.devtunnels.ms/api';
    const activosBackendUrl = `${backendBaseUrl}/activos`;
    const emailBackendUrl = `${backendBaseUrl}/email/send-maintenance-notification`; 
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchActivo = async () => {
            try {
                // Modificado para poblar también el consorcio y sus inquilinos para la notificación
                const response = await axios.get(`${activosBackendUrl}/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setActivo(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los detalles del activo.');
                setLoading(false);
                console.error('Error fetching activo details:', err);
            }
        };
        fetchActivo();
    }, [id, token, activosBackendUrl]);

    const handleDeleteActivo = async () => {
        setDeleteSuccess(''); 
        setDeleteError('');
        if (window.confirm('¿Estás seguro de que quieres eliminar este activo? Esta acción no se puede deshacer.')) {
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
        }
    };

    // Abre el modal y pre-carga el contenido del correo
    const handleOpenEmailModal = () => {
        setEmailStatus(''); // Limpiar mensajes previos
        
        // Validaciones previas a abrir el modal
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

        // Generar contenido del correo para pre-cargar el modal
        const fechaFormateada = activo.fechaUltimoMantenimiento ? new Date(activo.fechaUltimoMantenimiento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        const costoFormateado = activo.ultimoCostoMantenimiento ? `$${parseFloat(activo.ultimoCostoMantenimiento).toFixed(2)}` : 'N/A';

        const subject = `Notificación de Mantenimiento - ${activo.consorcio.nombre} - ${activo.nombre}`;
        const body = `
Estimado/a Inquilino/a,

Le informamos que se ha realizado el mantenimiento del activo "${activo.nombre}" (Ubicación: ${activo.ubicacion}) en el consorcio "${activo.consorcio.nombre}".
${activo.descripcion ? `Descripción del activo: ${activo.descripcion}` : ''}

Fecha de Mantenimiento: ${fechaFormateada}
Costo Asociado: ${costoFormateado}

Este costo se incluirá en sus próximas expensas. Para más detalles, por favor, revise el historial de gastos.

Atentamente,
La Administración del Consorcio "${activo.consorcio.nombre}"
`;
        setEmailSubject(subject);
        setEmailBody(body);
        setShowEmailModal(true); // Abre el modal
    };

    const handleCloseEmailModal = () => {
        setShowEmailModal(false);
        setEmailSubject('');
        setEmailBody('');
        setSendingEmail(false);
    };

    // Envía el correo después de la edición en el modal
    const handleSendEditedEmail = async () => {
        setSendingEmail(true); // Deshabilita el botón mientras se envía
        setEmailStatus(''); // Limpiar mensajes previos

        try {
            await axios.post(emailBackendUrl, {
                consorcioId: activo.consorcio._id,
                activoId: activo._id, // Se mantiene el activoId para el contexto
                costoMantenimiento: activo.ultimoCostoMantenimiento, // Se envía el costo original para registro si es necesario
                fechaMantenimiento: activo.fechaUltimoMantenimiento, // Se envía la fecha original para registro si es necesario
                // Envía el asunto y cuerpo editados
                editedSubject: emailSubject, 
                editedBody: emailBody
            }, {
                headers: { 'x-auth-token': token }
            });
            setEmailStatus({ type: 'success', message: 'Notificación de mantenimiento enviada con éxito. Revisa la consola del servidor para ver el estado de envío.' });
            handleCloseEmailModal(); // Cierra el modal al finalizar
        } catch (err) {
            console.error('Error al enviar notificación por email:', err.response ? err.response.data : err.message);
            setEmailStatus({ type: 'danger', message: `Error al enviar notificación: ${err.response?.data?.msg || err.message}` });
        } finally {
            setSendingEmail(false); // Vuelve a habilitar el botón
        }
    };

    if (loading) {
        return <Container className="mt-5 text-center"><h2>Cargando...</h2></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    if (!activo) {
        return <Container className="mt-5"><Alert variant="info">Activo no encontrado.</Alert></Container>;
    }

    const formatFecha = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Container className="mt-5">
            {activo.consorcio && activo.consorcio._id ? (
                <Link to={`/consorcios/${activo.consorcio._id}`} className="btn btn-secondary mb-3">
                    Volver al Consorcio
                </Link>
            ) : (
                <Link to="/consorcios" className="btn btn-secondary mb-3">
                    Volver a Consorcios
                </Link>
            )}
            
            <Card>
                <Card.Header as="h2">{activo.nombre}</Card.Header>
                <Card.Body>
                    {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}
                    {deleteError && <Alert variant="danger">{deleteError}</Alert>}
                    {emailStatus && <Alert variant={emailStatus.type}>{emailStatus.message}</Alert>}

                    <Card.Text>
                        <strong>Marca:</strong> {activo.marca || 'N/A'}<br/>
                        <strong>Modelo:</strong> {activo.modelo || 'N/A'}<br/>
                        <strong>Ubicación:</strong> {activo.ubicacion || 'N/A'}<br/>
                        <strong>Descripción:</strong> {activo.descripcion || 'N/A'}<br/>
                        <strong>Fecha de Instalación:</strong> {formatFecha(activo.fechaInstalacion)}<br/>
                        <strong>Próximo Mantenimiento:</strong> {formatFecha(activo.proximoMantenimiento)}<br/>
                        <strong>Frecuencia de Mantenimiento:</strong> {activo.frecuenciaMantenimiento || 'N/A'}<br/>
                        <strong>Estado:</strong> {activo.estado || 'N/A'}<br/>
                        <hr/> 
                    </Card.Text>
                    <div className="mt-3">
                        <Link to={`/edit-activo/${activo._id}`} className="btn btn-warning me-2">
                            <FaEdit /> Editar Activo
                        </Link>
                        <Button variant="danger" onClick={handleDeleteActivo} className="me-2">
                            <FaTrash /> Eliminar Activo
                        </Button>
                        <Button variant="info" onClick={handleOpenEmailModal}> {/* Este botón ahora abre el modal */}
                            <FaEnvelope /> Enviar Notificación de Mantenimiento y Cobro
                        </Button>
                    </div>
                </Card.Body>
            </Card>

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
                                style={{ whiteSpace: 'pre-wrap' }} // Para mantener los saltos de línea
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
                        disabled={sendingEmail} // Deshabilita el botón mientras se envía
                    >
                        {sendingEmail ? 'Enviando...' : 'Enviar Correo'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ActivoDetail;