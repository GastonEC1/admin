import React, { useState } from "react";
import { Form, Button, Container, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddConsorcio() {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [pisos, setPisos] = useState("");
  const [unidades, setUnidades] = useState("");
  const [nombrePortero, setNombrePortero] = useState("");
  const [telefonoPortero, setTelefonoPortero] = useState("");
  const [emailPortero, setEmailPortero] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const backendUrl = "https://prueba-3-8t74.onrender.com/api/consorcios";
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const newConsorcio = {
        nombre,
        direccion,
        pisos,
        unidades,
        nombrePortero,
        telefonoPortero,
        emailPortero,
      };

      await axios.post(backendUrl, newConsorcio, {
        headers: { "x-auth-token": token },
      });

      setSuccessMessage("Consorcio creado con éxito.");
      // Limpiar los campos del formulario
      setNombre("");
      setDireccion("");
      setPisos("");
      setUnidades("");
      setNombrePortero("");
      setTelefonoPortero("");
      setEmailPortero("");

      navigate("/consorcios");
    } catch (err) {
      setErrorMessage(
        "Error al crear el consorcio. Por favor, revisa los datos."
      );
      console.error(
        "Error al enviar el formulario:",
        err.response ? err.response.data : err.message
      );
    }
  };

  return (
    <Container className="mt-5">
      <h2>Agregar Nuevo Consorcio</h2>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Form onSubmit={handleSubmit} className="mt-3">
        <Form.Group className="mb-3" controlId="formNombre">
          <Form.Label>Nombre del Consorcio</Form.Label>
          <Form.Control
            type="text"
            placeholder="Edificio Las Palmas"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDireccion">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            placeholder="Av. del Libertador 1234"
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
                placeholder="10"
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
                placeholder="20"
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
            placeholder="Carlos López"
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
                placeholder="11-5555-1234"
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
                placeholder="carlos.portero@example.com"
                value={emailPortero}
                onChange={(e) => setEmailPortero(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" className="w-100 mt-3">
          Crear Consorcio
        </Button>
        <Button
          variant="secondary"
          className="w-100 mt-2"
          onClick={() => navigate("/consorcios")}
        >
          Cancelar
        </Button>
      </Form>
    </Container>
  );
}

export default AddConsorcio;
