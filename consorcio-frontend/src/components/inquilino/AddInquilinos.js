import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function AddInquilino() {
  const { consorcioId } = useParams(); // Obtener el ID del consorcio de la URL
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [unidad, setUnidad] = useState("");
  const [tipoUnidad, setTipoUnidad] = useState("Departamento"); // Nuevo estado, con valor por defecto
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const backendUrl = "https://gestion-3kgo.onrender.com/api";
  const token = localStorage.getItem("token");

  const [consorcioNombre, setConsorcioNombre] = useState("");
  useEffect(() => {
    const fetchConsorcioName = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/consorcios/${consorcioId}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        setConsorcioNombre(response.data.nombre);
      } catch (err) {
        console.error("Error al cargar el nombre del consorcio:", err);
        setConsorcioNombre("Consorcio Desconocido");
      }
    };
    if (consorcioId) {
      fetchConsorcioName();
    }
  }, [consorcioId, backendUrl, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // El ID del consorcio ahora viene de useParams
      const newInquilino = {
        nombre,
        apellido,
        email,
        telefono,
        unidad,
        tipoUnidad,
        consorcio: consorcioId,
      };

      await axios.post(`${backendUrl}/inquilinos`, newInquilino, {
        headers: { "x-auth-token": token },
      });

      setSuccessMessage("Inquilino creado y asociado con éxito.");
      setNombre("");
      setApellido("");
      setEmail("");
      setTelefono("");
      setUnidad("");
      setTipoUnidad("Departamento");

      navigate(`/consorcios/${consorcioId}`);
    } catch (err) {
      setErrorMessage(
        "Error al crear el inquilino. Por favor, revisa los datos."
      );
      console.error(
        "Error al enviar el formulario:",
        err.response ? err.response.data : err.message
      );
    }
  };

  return (
    <Container className="mt-5">
      <h2>Agregar Nuevo Inquilino</h2>
      {consorcioId && (
        <Alert variant="info" className="mb-3">
          Añadiendo inquilino al consorcio:{" "}
          <strong>{consorcioNombre || "Cargando..."}</strong>
        </Alert>
      )}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Form onSubmit={handleSubmit} className="mt-3">
        <Form.Group className="mb-3" controlId="formNombre">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Juan"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formApellido">
          <Form.Label>Apellido</Form.Label>
          <Form.Control
            type="text"
            placeholder="Perez"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="juan.perez@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formTelefono">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            placeholder="11-2233-4455"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formUnidad">
          <Form.Label>Unidad</Form.Label>
          <Form.Control
            type="text"
            placeholder="3B"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formTipoUnidad">
          <Form.Label>Tipo de Unidad</Form.Label>
          <Form.Select
            value={tipoUnidad}
            onChange={(e) => setTipoUnidad(e.target.value)}
            required
          >
            <option value="Departamento">Departamento</option>
            <option value="Oficina">Oficina</option>
            <option value="Local">Local</option>
            <option value="Otro">Otro</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 mt-3">
          Crear Inquilino
        </Button>
        <Button
          variant="secondary"
          className="w-100 mt-2"
          onClick={() => navigate(`/consorcios/${consorcioId}`)}
        >
          Cancelar
        </Button>
      </Form>
    </Container>
  );
}

export default AddInquilino;
