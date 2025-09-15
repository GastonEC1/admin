import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Activos() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const backendUrl = 'https://prueba-3-8t74.onrender.com/api/activos';
    const token = localStorage.getItem('token');

    axios.get(backendUrl, {
      headers: { 'x-auth-token': token }
    })
    .then(response => {
      if (Array.isArray(response.data)) {
        setActivos(response.data);
      } else {
        console.error('La API no devolvió un array para activos:', response.data);
        setActivos([]);
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Hubo un error al cargar los activos:', error);
      setError('Error al cargar los activos. Por favor, revisa la conexión.');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" className="mb-3" />
        <h2>Cargando Activos...</h2>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Lista de Activos ({activos.length})</h2>
      {activos.length > 0 ? (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Consorcio</th>
              <th>Ubicación</th>
              <th>Marca</th>
              <th>Modelo</th>
            </tr>
          </thead>
          <tbody>
            {activos.map(activo => (
              <tr key={activo._id}>
                <td>
                  <Link to={`/activos/${activo._id}`}>
                    {activo.nombre}
                  </Link>
                </td>
                <td>{activo.tipo || 'N/A'}</td>
                <td>{activo.consorcio ? activo.consorcio.nombre : 'N/A'}</td>
                <td>{activo.ubicacion}</td>
                <td>{activo.marca || 'N/A'}</td>
                <td>{activo.modelo || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info" className="mt-3">
          No hay activos para mostrar.
        </Alert>
      )}
    </Container>
  );
}

export default Activos;