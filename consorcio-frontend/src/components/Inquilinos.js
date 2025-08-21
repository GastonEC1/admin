import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Alert } from 'react-bootstrap';

function Inquilinos() {
  const [inquilinos, setInquilinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const backendUrl = 'https://plhsk4j3-5000.brs.devtunnels.ms/api/inquilinos';
    const token = localStorage.getItem('token');

    axios.get(backendUrl, {
      headers: { 'x-auth-token': token }
    })
    .then(response => {
      if (Array.isArray(response.data)) {
        setInquilinos(response.data);
      } else {
        console.error('La API no devolvió un array para inquilinos:', response.data);
        setInquilinos([]);
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Hubo un error al cargar los inquilinos:', error);
      setError('Error al cargar los inquilinos. Por favor, revisa la conexión.');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <h2>Cargando Inquilinos...</h2>
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
      <h2>Lista de Inquilinos ({inquilinos.length})</h2>
      {inquilinos.length > 0 ? (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Unidad</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Consorcio</th>
            </tr>
          </thead>
          <tbody>
            {inquilinos.map(inquilino => (
              <tr key={inquilino._id}>
                <td>{inquilino.nombre}</td>
                <td>{inquilino.unidad}</td>
                <td>{inquilino.telefono}</td>
                <td>{inquilino.email}</td>
                <td>{inquilino.consorcio ? inquilino.consorcio.nombre : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info" className="mt-3">
          No hay inquilinos para mostrar.
        </Alert>
      )}
    </Container>
  );
}

export default Inquilinos;