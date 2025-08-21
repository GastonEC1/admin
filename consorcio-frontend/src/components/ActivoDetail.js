import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEnvelope } from 'react-icons/fa'; // Importa FaEnvelope

function ActivoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activo, setActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState(''); 
    const [deleteError, setDeleteError] = useState('');     
    const [emailStatus, setEmailStatus] = useState(''); // Estado para mensajes de envío de email

    // ¡VERIFICA ESTA URL para el backend de tu API!
    const backendBaseUrl = 'https://plhsk4j3-5000.brs.devtunnels.ms/api';
    const activosBackendUrl = `${backendBaseUrl}/activos`;
    const emailBackendUrl = `${backendBaseUrl}/email/send-maintenance-notification`; // URL para enviar notificaciones
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchActivo = async () => {
            try {
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

    // --- Nueva función para enviar notificación por email ---
    const handleSendEmailNotification = async () => {
        setEmailStatus(''); // Limpiar mensajes previos
        if (!activo || !activo.consorcio || !activo.ultimoCostoMantenimiento || !activo.fechaUltimoMantenimiento) {
            setEmailStatus({ type: 'danger', message: 'No se puede enviar la notificación. Faltan datos de consorcio, costo o fecha de último mantenimiento del activo.' });
            return;
        }

        try {
            await axios.post(emailBackendUrl, {
                consorcioId: activo.consorcio._id,
                activoId: activo._id,
                costoMantenimiento: activo.ultimoCostoMantenimiento,
                fechaMantenimiento: activo.fechaUltimoMantenimiento
            }, {
                headers: { 'x-auth-token': token }
            });
            setEmailStatus({ type: 'success', message: 'Notificación de mantenimiento enviada (simulada) con éxito a los inquilinos. Revisa la consola del servidor.' });
        } catch (err) {
            console.error('Error al enviar notificación por email:', err.response ? err.response.data : err.message);
            setEmailStatus({ type: 'danger', message: `Error al enviar notificación: ${err.response?.data?.msg || err.message}` });
        }
    };
    // --- Fin de la nueva función ---

    if (loading) {
        return <Container className="mt-5 text-center"><h2>Cargando...</h2></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    if (!activo) {
        return <Container className="mt-5"><Alert variant="info">Activo no encontrado.</Alert></Container>;
    }

    // Función para formatear fechas para mostrar
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
                    {emailStatus && <Alert variant={emailStatus.type}>{emailStatus.message}</Alert>} {/* Mensajes de email */}

                    <Card.Text>
                        <strong>Marca:</strong> {activo.marca || 'N/A'}<br/>
                        <strong>Modelo:</strong> {activo.modelo || 'N/A'}<br/>
                        <strong>Ubicación:</strong> {activo.ubicacion || 'N/A'}<br/>
                        <strong>Descripción:</strong> {activo.descripcion || 'N/A'}<br/>
                        <strong>Fecha de Instalación:</strong> {formatFecha(activo.fechaInstalacion)}<br/>
                        <strong>Próximo Mantenimiento:</strong> {formatFecha(activo.proximoMantenimiento)}<br/>
                        <strong>Frecuencia de Mantenimiento:</strong> {activo.frecuenciaMantenimiento || 'N/A'}<br/>
                        <strong>Estado:</strong> {activo.estado || 'N/A'}<br/>
                        <hr/> {/* Separador */}
                        <h5>Último Mantenimiento y Costo:</h5>
                        <strong>Costo:</strong> ${activo.ultimoCostoMantenimiento?.toFixed(2) || '0.00'}<br/> {/* Nuevo campo */}
                        <strong>Fecha:</strong> {formatFecha(activo.fechaUltimoMantenimiento)}<br/> {/* Nuevo campo */}
                        <strong>Consorcio:</strong> {activo.consorcio ? activo.consorcio.nombre : 'N/A'}
                    </Card.Text>
                    <div className="mt-3">
                        <Link to={`/edit-activo/${activo._id}`} className="btn btn-warning me-2">
                            <FaEdit /> Editar Activo
                        </Link>
                        <Button variant="danger" onClick={handleDeleteActivo} className="me-2">
                            <FaTrash /> Eliminar Activo
                        </Button>
                        <Button variant="info" onClick={handleSendEmailNotification}>
                            <FaEnvelope /> Enviar Notificación de Mantenimiento y Cobro
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default ActivoDetail;