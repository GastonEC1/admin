import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Alert,
  Button,
  Card,
  Spinner,
  Form,
  Modal,
  Pagination,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaRegBuilding, FaSearch } from "react-icons/fa";

const normalizeString = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

function Consorcios() {
  const [consorcios, setConsorcios] = useState([]);
  const [filteredConsorcios, setFilteredConsorcios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [consorcioToDelete, setConsorcioToDelete] = useState(null);

  const backendUrl = "https://prueba-3-8t74.onrender.com/api/consorcios";
  const token = localStorage.getItem("token");

  useEffect(() => {
    setLoading(true);
    fetch(backendUrl, {
      headers: { "x-auth-token": token },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setConsorcios(data);
        } else {
          console.warn("La API de consorcios no devolvió un array:", data);
          setConsorcios([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(
          "Error al cargar los consorcios. Por favor, revisa la conexión del backend."
        );
        setLoading(false);
        console.error("Error fetching consorcios:", err);
      });
  }, [backendUrl, token]);

  useEffect(() => {
    const normalizedSearchTerm = normalizeString(searchTerm).trim();

    if (normalizedSearchTerm.length === 0) {
      setFilteredConsorcios(consorcios);
    } else {
      const filtered = consorcios.filter((cons) => {
        const normalizedNombre = normalizeString(cons.nombre);
        const normalizedDireccion = normalizeString(cons.direccion);

        return (
          normalizedNombre.startsWith(normalizedSearchTerm) ||
          normalizedDireccion.startsWith(normalizedSearchTerm)
        );
      });
      setFilteredConsorcios(filtered);
    }

    setCurrentPage(1);
  }, [consorcios, searchTerm]);

  const totalPages = Math.ceil(filteredConsorcios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredConsorcios.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleShowConfirm = (consorcio) => {
    setConsorcioToDelete(consorcio);
    setShowConfirmModal(true);
  };

  const handleCloseConfirm = () => {
    setShowConfirmModal(false);
    setConsorcioToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!consorcioToDelete) return;

    try {
      const response = await fetch(`${backendUrl}/${consorcioToDelete._id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (!response.ok) {
        throw new Error("Error al eliminar el consorcio.");
      }

      setConsorcios((prevConsorcios) =>
        prevConsorcios.filter((cons) => cons._id !== consorcioToDelete._id)
      );
      handleCloseConfirm();
    } catch (err) {
      setError("Error al eliminar el consorcio. Inténtalo de nuevo.");
      console.error("Error deleting consorcio:", err.message);
      handleCloseConfirm();
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <h2 className="mt-2 text-secondary">Cargando Consorcios...</h2>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center shadow-sm">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card className="shadow-lg border-0 rounded-4 p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
          <h2 className="mb-3 mb-md-0 fw-bold text-primary">
            Lista de Consorcios ({filteredConsorcios.length})
          </h2>
          <div className="d-flex flex-column flex-md-row w-100 w-md-auto align-items-stretch align-items-md-center">
            {/* Campo de búsqueda */}
            <div className="input-group me-md-3 mb-3 mb-md-0">
              <span className="input-group-text bg-light border-end-0 rounded-start-pill">
                <FaSearch />
              </span>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre o dirección..."
                className="rounded-end-pill"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/add-consorcio">
              <Button
                variant="outline-primary"
                className="fw-bold rounded-pill w-100"
              >
                <FaRegBuilding /> Agregar Consorcio
              </Button>
            </Link>
          </div>
        </div>

        {currentItems.length > 0 ? (
          <div className="table-responsive">
            <Table
              hover
              responsive
              className="shadow-sm rounded-4 overflow-hidden mb-0"
            >
              <thead className="bg-primary text-white">
                <tr>
                  <th className="py-3">Nombre</th>
                  <th className="py-3">Dirección</th>
                  <th className="py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((consorcio) => (
                  <tr key={consorcio._id}>
                    <td className="align-middle">
                      <Link
                        to={`/consorcios/${consorcio._id}`}
                        className="fw-bold text-decoration-none text-primary"
                      >
                        {consorcio.nombre}
                      </Link>
                    </td>
                    <td className="align-middle">{consorcio.direccion}</td>
                    <td className="align-middle text-center">
                      <Link
                        to={`/edit-consorcio/${consorcio._id}`}
                        className="btn btn-outline-primary btn-sm me-2 rounded-pill"
                      >
                        <FaEdit className="me-2" /> Editar
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => handleShowConfirm(consorcio)}
                      >
                        <FaTrash className="me-2" /> Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.Prev
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </div>
        ) : (
          <Alert variant="info" className="mt-3 text-center shadow-sm border-0">
            {searchTerm
              ? "No se encontraron consorcios que coincidan con la búsqueda."
              : "No hay consorcios para mostrar. Crea uno nuevo para empezar."}
          </Alert>
        )}
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showConfirmModal} onHide={handleCloseConfirm} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar el consorcio{" "}
          <strong>{consorcioToDelete?.nombre}</strong> y toda su información
          asociada? Esta acción es irreversible.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirm}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Consorcios;
