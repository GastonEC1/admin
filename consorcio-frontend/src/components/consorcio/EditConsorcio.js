import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";

function EditConsorcio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [pisos, setPisos] = useState("");
  const [unidades, setUnidades] = useState("");

  const [nombrePortero, setNombrePortero] = useState("");
  const [telefonoPortero, setTelefonoPortero] = useState("");
  const [emailPortero, setEmailPortero] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const backendUrl = "https://prueba-3-8t74.onrender.com/api/consorcios";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchConsorcio = async () => {
      try {
        const response = await axios.get(`${backendUrl}/${id}`, {
          headers: { "x-auth-token": token },
        });
        const consorcioData = response.data;
        setNombre(consorcioData.nombre);
        setDireccion(consorcioData.direccion);
        setPisos(consorcioData.pisos);
        setUnidades(consorcioData.unidades);

        setNombrePortero(consorcioData.nombrePortero || "");
        setTelefonoPortero(consorcioData.telefonoPortero || "");
        setEmailPortero(consorcioData.emailPortero || "");

        setLoading(false);
      } catch (err) {
        setErrorMessage("Error al cargar los datos del consorcio.");
        setLoading(false);
        console.error(err);
      }
    };
    fetchConsorcio();
  }, [id, token, backendUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const updatedConsorcio = {
        nombre,
        direccion,
        pisos,
        unidades,
        nombrePortero,
        telefonoPortero,
        emailPortero,
      };

      await axios.put(`${backendUrl}/${id}`, updatedConsorcio, {
        headers: { "x-auth-token": token },
      });

      setSuccessMessage("Consorcio actualizado con éxito.");
      navigate(`/consorcios/${id}`); // Volver a los detalles del consorcio
    } catch (err) {
      setErrorMessage(
        "Error al actualizar el consorcio. Por favor, revisa los datos."
      );
      console.error(err.response ? err.response.data : err.message);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <h2>Cargando Consorcio...</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Editar Consorcio</h2>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Form onSubmit={handleSubmit} className="mt-3">
        <Form.Group className="mb-3" controlId="formNombre">
          <Form.Label>Nombre del Consorcio</Form.Label>
          <Form.Control
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDireccion">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </Form.Group>

        <Row>
          <Col>
            <Form.Group className="mb-3" controlId="formPisos">
              <Form.Label>Pisos</Form.Label>
              <Form.Control
                type="number"
                value={pisos}
                onChange={(e) => setPisos(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="formUnidades">
              <Form.Label>Unidades</Form.Label>
              <Form.Control
                type="number"
                value={unidades}
                onChange={(e) => setUnidades(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Sección de Información del Portero */}
        <h4 className="mt-4">Información del Portero</h4>
        <Form.Group className="mb-3" controlId="formNombrePortero">
          <Form.Label>Nombre del Portero</Form.Label>
          <Form.Control
            type="text"
            value={nombrePortero}
            onChange={(e) => setNombrePortero(e.target.value)}
          />
        </Form.Group>

        <Row>
          <Col>
            <Form.Group className="mb-3" controlId="formTelefonoPortero">
              <Form.Label>Teléfono del Portero</Form.Label>
              <Form.Control
                type="text"
                value={telefonoPortero}
                onChange={(e) => setTelefonoPortero(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="formEmailPortero">
              <Form.Label>Email del Portero</Form.Label>
              <Form.Control
                type="email"
                value={emailPortero}
                onChange={(e) => setEmailPortero(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit" className="w-100 mt-3">
          Actualizar Consorcio
        </Button>
        <Button
          variant="secondary"
          className="w-100 mt-2"
          onClick={() => navigate(`/consorcios/${id}`)}
        >
          Cancelar
        </Button>
      </Form>
    </Container>
  );
}

export default EditConsorcio;
