import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa'; // Asegúrate de importar FaEdit para el botón de editar

function Consorcios() {
    const [consorcios, setConsorcios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ¡VERIFICA ESTA URL! Debe ser la de tu puerto 5000 de Codespaces + /api/consorcios
    const backendUrl = 'https://plhsk4j3-5000.brs.devtunnels.ms/api/consorcios';
    const token = localStorage.getItem('token');

    // Efecto para cargar los consorcios cuando el componente se monta
    useEffect(() => {
        axios.get(backendUrl, {
            headers: { 'x-auth-token': token }
        })
        .then(response => {
            // Asegúrate de que la respuesta sea un array antes de establecer el estado
            if (Array.isArray(response.data)) {
                setConsorcios(response.data);
            } else {
                // Si la respuesta no es un array, inicializa con un array vacío
                console.warn('La API de consorcios no devolvió un array:', response.data);
                setConsorcios([]);
            }
            setLoading(false);
        })
        .catch(error => {
            setError('Error al cargar los consorcios. Por favor, revisa la conexión del backend.');
            setLoading(false);
            console.error('Error fetching consorcios:', error);
        });
    }, [backendUrl, token]); // Las dependencias aseguran que se recargue si la URL o el token cambian

    // Función para manejar la eliminación de un consorcio
    const handleDelete = async (id) => {
        // Confirmación antes de eliminar para evitar borrados accidentales
        if (window.confirm('¿Estás seguro de que quieres eliminar este consorcio y toda su información asociada (inquilinos, activos)? Esta acción no se puede deshacer.')) {
            try {
                await axios.delete(`${backendUrl}/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                // Si la eliminación es exitosa en el backend, actualiza la lista en el frontend
                setConsorcios(consorcios.filter(cons => cons._id !== id));
                alert('Consorcio eliminado con éxito.'); // Usar alert solo para confirmaciones
            } catch (err) {
                setError('Error al eliminar el consorcio. Inténtalo de nuevo.');
                console.error('Error deleting consorcio:', err.response ? err.response.data : err.message);
            }
        }
    };

    // Muestra un indicador de carga mientras se obtienen los datos
    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <h2>Cargando Consorcios...</h2>
            </Container>
        );
    }

    // Muestra un mensaje de error si la carga falló
    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    // Renderiza la lista de consorcios si no hay errores y ya cargaron
    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Lista de Consorcios ({consorcios.length})</h2>
                {/* Botón para navegar al formulario de agregar consorcio */}
                <Link to="/add-consorcio">
                    <Button variant="primary">+ Agregar Consorcio</Button>
                </Link>
            </div>
            {consorcios.length > 0 ? (
                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Pisos</th>
                            <th>Unidades</th>
                            <th>Acciones</th> {/* Columna para los botones de acción */}
                        </tr>
                    </thead>
                    <tbody>
                        {consorcios.map(consorcio => (
                            <tr key={consorcio._id}>
                                <td>
                                    {/* Enlace para ver los detalles del consorcio */}
                                    <Link to={`/consorcios/${consorcio._id}`}>
                                        {consorcio.nombre}
                                    </Link>
                                </td>
                                <td>{consorcio.direccion}</td>
                                <td>{consorcio.pisos}</td>
                                <td>{consorcio.unidades}</td>
                                <td>
                                    {/* Botón para editar el consorcio */}
                                    <Link to={`/edit-consorcio/${consorcio._id}`} className="btn btn-warning btn-sm me-2">
                                        <FaEdit /> Editar
                                    </Link>
                                    {/* Botón para eliminar el consorcio */}
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => handleDelete(consorcio._id)}
                                    >
                                        <FaTrash /> Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <Alert variant="info" className="mt-3">
                    No hay consorcios para mostrar. Crea uno nuevo para empezar.
                </Alert>
            )}
        </Container>
    );
}

export default Consorcios;