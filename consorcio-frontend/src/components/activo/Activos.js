import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Alert } from 'react-bootstrap';

function Activos() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // URL corregida a /api/activos (en plural)
    const backendUrl = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api/activos';
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
              <th>Marca</th>
              <th>Modelo</th>
              <th>Ubicación</th>
              <th>Consorcio</th>
            </tr>
          </thead>
          <tbody>
            {activos.map(activo => (
              <tr key={activo._id}>
                <td>{activo.nombre}</td>
                <td>{activo.marca}</td>
                <td>{activo.modelo}</td>
                <td>{activo.ubicacion}</td>
                <td>{activo.consorcio ? activo.consorcio.nombre : 'N/A'}</td>
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