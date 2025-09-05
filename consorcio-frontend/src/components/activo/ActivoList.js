import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Spinner,
  Alert,
  Table,
  Badge,
  Card,
} from "react-bootstrap";
import { FaArrowLeft, FaTools, FaInfoCircle } from "react-icons/fa";

function ActivosList({ API_BASE_URL, userRole }) {
  const { consorcioId } = useParams();
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchActivos = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        setLoading(false);
        navigate("/login");
        return;
      }
      if (!consorcioId) {
        setError("ID de consorcio no proporcionado en la URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/activos?consorcioId=${consorcioId}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        setActivos(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Tu sesión ha expirado. Por favor, inicia sesión.");
          navigate("/login");
        } else {
          setError(
            err.response?.data?.msg || "Error al cargar los activos."
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchActivos();
  }, [API_BASE_URL, consorcioId, navigate, token]);

  const getMaintenanceStatus = (proximoMantenimientoDate, estado) => {
    if (estado === "En Reparacion" || estado === "Fuera de Servicio") {
        return { color: estado === "En Reparacion" ? "warning" : "danger", text: estado };
    }
    if (estado === "Pendiente de Mantenimiento") {
        return { color: "warning", text: "Pendiente" };
    }
    if (!proximoMantenimientoDate) {
        return { color: "secondary", text: "No programado" };
    }

    const today = new Date();
    const maintenanceDate = new Date(proximoMantenimientoDate);
    maintenanceDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = maintenanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { color: "danger", text: `Vencido` };
    } else if (diffDays <= 15) {
        return { color: "danger", text: `Vence en ${diffDays} días` };
    } else if (diffDays <= 30) {
        return { color: "warning", text: `Vence en ${diffDays} días` };
    } else {
        return { color: "success", text: "OK" };
    }
  };


  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status" className="text-primary" />
        <p className="mt-2 text-muted">Cargando activos...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          {error}{" "}
          <Button variant="link" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Button
        variant="outline-secondary"
        onClick={() => navigate(-1)}
        className="mb-4 rounded-pill"
      >
        <FaArrowLeft className="me-2" /> Volver
      </Button>

      <Card className="shadow-lg border-0 rounded-4">
        <Card.Header
          as="h2"
          className="bg-primary text-white p-3 d-flex justify-content-between align-items-center rounded-top-4"
        >
          <FaTools className="me-2" />
          Listado de Activos
          <Button
            as={Link}
            to={`/add-activo/${consorcioId}`}
            variant="light"
            size="sm"
            title="Añadir Activo"
            className="rounded-pill"
          >
            Añadir Activo
          </Button>
        </Card.Header>
        <Card.Body className="p-4">
          {activos.length === 0 ? (
            <Alert variant="info" className="text-center">
              No hay activos registrados para este consorcio.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="mt-3 text-center align-middle">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Próximo Mantenimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {activos.map((activo) => (
                    <tr key={activo._id}>
                      <td>{activo.nombre}</td>
                      <td>{activo.tipo}</td>
                      <td>
                        <Badge
                          bg={
                            getMaintenanceStatus(
                              activo.proximoMantenimiento,
                              activo.estado
                            ).color
                          }
                        >
                          {
                            getMaintenanceStatus(
                              activo.proximoMantenimiento,
                              activo.estado
                            ).text
                          }
                        </Badge>
                      </td>
                      <td>
                        {activo.proximoMantenimiento
                          ? new Date(
                              activo.proximoMantenimiento
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <Link
                          to={`/activos/${activo._id}`}
                          className="btn btn-outline-primary btn-sm rounded-pill"
                          title="Ver detalles"
                        >
                          <FaInfoCircle /> Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ActivosList;