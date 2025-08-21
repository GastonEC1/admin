import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';

function InquilinoDetail() {
    const { id } = useParams();
    const [inquilino, setInquilino] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const backendUrl = 'https://plhsk4j3-5000.brs.devtunnels.ms/api/inquilinos';
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
                console.error(err);
            }
        };
        fetchInquilino();
    }, [id, token, backendUrl]);

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
                    <Card.Text>
                        <strong>Email:</strong> {inquilino.email}<br/>
                        <strong>Teléfono:</strong> {inquilino.telefono || 'No especificado'}<br/>
                        <strong>Unidad:</strong> {inquilino.unidad}<br/>
                        <strong>Tipo de Unidad:</strong> {inquilino.tipoUnidad || 'No especificado'}<br/> 
                        <strong>Consorcio:</strong> {inquilino.consorcio ? inquilino.consorcio.nombre : 'N/A'}
                    </Card.Text>
                    <Link to={`/edit-inquilino/${inquilino._id}`} className="btn btn-warning mt-3">
                        <FaEdit /> Editar Inquilino
                    </Link>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default InquilinoDetail;