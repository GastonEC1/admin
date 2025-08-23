import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';

function InquilinoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inquilino, setInquilino] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const backendUrl = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api/inquilinos'; 
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchInquilino = async () => {
            try {
                const response = await axios.get(`${backendUrl}/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setInquilino(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los detalles del inquilino.');
                setLoading(false);
                console.error('Error fetching inquilino details:', err);
            }
        };
        fetchInquilino();
    }, [id, token, backendUrl]);

    const handleDeleteInquilino = async () => {
        setDeleteSuccess('');
        setDeleteError('');
        // --- AQUÍ ESTÁ LA ALERTA DE CONFIRMACIÓN ---
        if (window.confirm('¿Estás seguro de que quieres eliminar este inquilino? Esta acción no se puede deshacer.')) {
            try {
                await axios.delete(`${backendUrl}/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setDeleteSuccess('Inquilino eliminado con éxito.');
                const consorcioId = inquilino?.consorcio?._id || inquilino?.consorcio;
                if (consorcioId) {
                    navigate(`/consorcios/${consorcioId}`);
                } else {
                    navigate('/consorcios');
                }
            } catch (err) {
                setDeleteError('Error al eliminar el inquilino. Inténtalo de nuevo.');
                console.error('Error deleting inquilino:', err);
            }
        }
    };

    if (loading) {
        return <Container className="mt-5 text-center"><h2>Cargando...</h2></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    if (!inquilino) {
        return <Container className="mt-5"><Alert variant="info">Inquilino no encontrado.</Alert></Container>;
    }

    return (
        <Container className="mt-5">
            {inquilino.consorcio && inquilino.consorcio._id ? (
                <Link to={`/consorcios/${inquilino.consorcio._id}`} className="btn btn-secondary mb-3">
                    Volver al Consorcio
                </Link>
            ) : (
                <Link to="/consorcios" className="btn btn-secondary mb-3">
                    Volver a Consorcios
                </Link>
            )}
            
            <Card>
                <Card.Header as="h2">{inquilino.nombre}</Card.Header>
                <Card.Body>
                    {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}
                    {deleteError && <Alert variant="danger">{deleteError}</Alert>}
                    <Card.Text>
                        <strong>Email:</strong> {inquilino.email}<br/>
                        <strong>Teléfono:</strong> {inquilino.telefono || 'N/A'}<br/>
                        <strong>Unidad:</strong> {inquilino.unidad}<br/>
                        <strong>Tipo de Unidad:</strong> {inquilino.tipoUnidad || 'N/A'}<br/>
                        <strong>Consorcio:</strong> {inquilino.consorcio ? inquilino.consorcio.nombre : 'N/A'}
                    </Card.Text>
                    <div className="mt-3">
                        <Link to={`/edit-inquilino/${inquilino._id}`} className="btn btn-warning me-2">
                            <FaEdit /> Editar Inquilino
                        </Link>
                        <Button variant="danger" onClick={handleDeleteInquilino}>
                            <FaTrash /> Eliminar Inquilino
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default InquilinoDetail;
