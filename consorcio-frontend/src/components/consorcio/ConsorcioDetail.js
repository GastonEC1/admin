import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import {Container,Card,Row,Col,ListGroup,Button,Alert,Spinner,Badge,Modal,Form,Dropdown, Pagination,} from "react-bootstrap";
import {FaUserPlus,FaArrowLeft,FaEdit,FaTrash,FaInfoCircle,FaTools,FaSearch,FaUserTie,FaEllipsisV,FaMapMarkerAlt,FaPhone,FaEnvelope,FaCalendarAlt} from "react-icons/fa";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"

function ConsorcioDetail({ API_BASE_URL, userRole }) {
  const { id } = useParams();
  const [consorcio, setConsorcio] = useState(null);
  const [inquilinos, setInquilinos] = useState([]);
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const navigate = useNavigate();

  const [currentPageActivos, setCurrentPageActivos] = useState(1);
  const itemsPerPageActivos = 5;

  const   totalPagesActivos = Math.ceil(activos.length / itemsPerPageActivos)
  const startIndexActivos = (currentPageActivos - 1) * itemsPerPageActivos
  const currentActivos = activos.slice(startIndexActivos, startIndexActivos + itemsPerPageActivos)

 
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemTypeToDelete, setItemTypeToDelete] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipoInquilino, setSelectedTipoInquilino] = useState("");
  const [currentPageInquilinos, setCurrentPageInquilinos] = useState(1);
  const itemsPerPageInquilinos = 10;
  const [filteredInquilinos, setFilteredInquilinos] = useState([]);
  // Tipos únicos para el fi


  // Filtrado dinámico
  useEffect(() => {
    const filtrados = inquilinos.filter(inquilino => {
      const nombre = inquilino.nombre ? inquilino.nombre.toLowerCase() : "";
      const apellido = inquilino.apellido ? inquilino.apellido.toLowerCase(): ""
      const term = searchTerm.toLowerCase();
      const matchesSearchTerm = !searchTerm || nombre.startsWith(term)||apellido.startsWith(term)
      const matchesSelectedTipo = !selectedTipoInquilino || selectedTipoInquilino === "Todos" || (inquilino.tipo === selectedTipoInquilino);
      return matchesSearchTerm && matchesSelectedTipo;
    });
    setFilteredInquilinos(filtrados);
  }, [inquilinos, searchTerm, selectedTipoInquilino]);

  // Paginación sobre el filtrado
  const totalPagesInquilinos = Math.ceil(filteredInquilinos.length / itemsPerPageInquilinos);
  const startIndexInquilinos = (currentPageInquilinos - 1) * itemsPerPageInquilinos;
  const currentInquilinos = filteredInquilinos.slice(startIndexInquilinos, startIndexInquilinos + itemsPerPageInquilinos);


  const [calendario, setCalendario] = useState([]);
  const [loadingCalendario, setLoadingCalendario] = useState(true);

  const [showEventoModal, setShowEventoModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalMode, setModalMode] = useState("view");

  const fetchConsorcioDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDeleteMessage(null);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const consorcioResponse = await axios.get(
        `${API_BASE_URL}/api/consorcios/${id}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setConsorcio(consorcioResponse.data);

      const inquilinosResponse = await axios.get(
        `${API_BASE_URL}/api/inquilinos?consorcioId=${id}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setInquilinos(inquilinosResponse.data);
      setFilteredInquilinos(inquilinosResponse.data);

      const activosResponse = await axios.get(
        `${API_BASE_URL}/api/activos?consorcioId=${id}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setActivos(activosResponse.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError(
          "Tu sesión ha expirado o no tienes permiso. Por favor, inicia sesión."
        );
        navigate("/login");
      } else if (err.response && err.response.status === 403) {
        setError("No tienes los permisos necesarios para ver este consorcio.");
      } else {
        setError(
          err.response?.data?.msg ||
            "Error al cargar los detalles del consorcio."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, id, navigate]);

  useEffect(() => {
    fetchConsorcioDetails();
  }, [fetchConsorcioDetails]);

  // Filtrado de inquilinos por nombre y tipo
  const tiposInquilino = ["Todos", ...new Set(inquilinos.map(i => i.tipo || ""))];

  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setItemTypeToDelete(type);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !itemTypeToDelete) return;

    setDeleting(true);
    setDeleteMessage(null);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      let endpoint = "";
      let successMsg = "";

      switch (itemTypeToDelete) {
        case "inquilino":
          endpoint = `${API_BASE_URL}/api/inquilinos/${itemToDelete._id}`;
          successMsg = "Inquilino eliminado exitosamente.";
          break;
        case "activo":
          endpoint = `${API_BASE_URL}/api/activos/${itemToDelete._id}`;
          successMsg = "Activo eliminado exitosamente.";
          break;
        default:
          throw new Error("Tipo de ítem desconocido para eliminar.");
      }

      await axios.delete(endpoint, {
        headers: { "x-auth-token": token },
      });

      setDeleteMessage({ type: "success", message: successMsg });
      fetchConsorcioDetails();
      setTimeout(() => setDeleteMessage(null), 3000);
    } catch (err) {
      setError(
        err.response?.data?.msg || `Error al eliminar el ${itemTypeToDelete}.`
      );
    } finally {
      setDeleting(false);
      setShowDeleteConfirmModal(false);
      setItemToDelete(null);
      setItemTypeToDelete("");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setLoadingCalendario(true);
    axios
      .get(`${API_BASE_URL}/api/calendars?consorcioId=${id}`, {
        headers: { "x-auth-token": token },
      })
      .then((response) => {
        setCalendario(response.data);
      })
      .catch((err) => {
        console.error("Error al cargar el calendario:", err);
      })
      .finally(() => setLoadingCalendario(false));
  }, [API_BASE_URL, id]);

  const handleDateClick = (arg) => {
    setModalMode("add");
    setEventoSeleccionado({
      fecha: arg.dateStr,
      descripcion: "",
      tipo: "evento",
    });
    setShowEventoModal(true);
  };

  const handleEventClick = (info) => {
    setModalMode("edit");
    setEventoSeleccionado({
      ...info.event.extendedProps,
      fecha: info.event.startStr,
      _id: info.event.id,
    });
    setShowEventoModal(true);
  };

  const handleSaveEvento = async () => {
    const token = localStorage.getItem("authToken");
  let fechaLocal = eventoSeleccionado?.fecha;

  // Normaliza la fecha para evitar errores
  if (fechaLocal && fechaLocal.length === 10) {
    // formato correcto YYYY-MM-DD
    fechaLocal = new Date(fechaLocal + "T00:00:00");
  } else if (fechaLocal) {
    // Si viene en otro formato, intenta convertirlo
    fechaLocal = new Date(fechaLocal);
  } else {
    fechaLocal = new Date(); // fallback a hoy
  }

  const eventoAEnviar = {
    ...eventoSeleccionado,
    fecha: fechaLocal.toISOString(),
    consorcioId: id,
  };

  if (modalMode === "add") {
    await axios.post(
      `${API_BASE_URL}/api/calendars`,
      eventoAEnviar,
      { headers: { "x-auth-token": token } }
    );
  } else {
    await axios.put(
      `${API_BASE_URL}/api/calendars/${eventoSeleccionado._id}`,
      eventoAEnviar,
      { headers: { "x-auth-token": token } }
    );
  }
  setShowEventoModal(false);
  axios
    .get(`${API_BASE_URL}/api/calendars?consorcioId=${id}`, {
      headers: { "x-auth-token": token },
    })
    .then((response) => {
      setCalendario(response.data);
    });
  };

  const handleDeleteEvento = async () => {
    const token = localStorage.getItem("authToken");
    await axios.delete(
      `${API_BASE_URL}/api/calendars/${eventoSeleccionado._id}`,
      { headers: { "x-auth-token": token } }
    );
    setShowEventoModal(false);
    axios
      .get(`${API_BASE_URL}/api/calendars?consorcioId=${id}`, {
        headers: { "x-auth-token": token },
      })
      .then((response) => {
        setCalendario(response.data);
      });
  };

  const getMaintenanceStatus = (proximoMantenimientoDate, estado) => {
    if (estado === "En Reparacion") {
      return { color: "warning", text: "En Reparacion" };
    }
    if(estado === "Fuera de Servicio") {
      return { color: "danger", text: "Fuera de Servicio" };
    }
    if(estado === "Pendiente de Mantenimiento") {
      return { color: "warning", text: "Pendiente de Mantenimiento" };
    }
    if (!proximoMantenimientoDate) {
      if (estado === "Operativo"){
        return {color: "success", text: "OK"}
      }
      return { color: "secondary", text: "No programado" };
    }


    const today = new Date();
    const maintenanceDate = new Date(proximoMantenimientoDate);
    maintenanceDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = maintenanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { color: "danger", text: "Vencido" };
    } else if (diffDays === 0) {
      return { color: "danger", text: "Vence hoy" };
    } else if (diffDays <= 15) {
      return { color: "danger", text: `Vence en ${diffDays} días` };
    } else if (diffDays <= 30) {
      return { color: "warning", text: `Vence en ${diffDays} días` };
    } else {
      return { color: "success", text: "OK" };
    }
  };

  const handleEventDrop = async (info) =>{
    const token = localStorage.getItem("authToken")
    const eventoId = info.event.id
    const nuevaFecha = info.event.startStr

    try{
      await axios.put(
        `${API_BASE_URL}/api/calendars/${eventoId}`,
        {fecha: nuevaFecha},
        {headers: {"x-auth-token": token}}
      )
      axios
      .get(`${API_BASE_URL}/api/calendars?consorcioId=${id}`,{
        headers: {"x-auth-token": token}
      })
      .then((response) =>
      setCalendario(response.data)
    )}catch(err){
      alert("Error al actualizar la fecha del evento")
      info.revert()
    }
  }
  


  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">
            Cargando detalles del consorcio...
          </span>
        </Spinner>
        <p className="mt-2 text-muted">Cargando detalles del consorcio...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          {error}{" "}
          <Button variant="link" onClick={() => navigate("/consorcios")}>
            Volver a Consorcios
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!consorcio) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Consorcio no encontrado.{" "}
          <Button variant="link" onClick={() => navigate("/consorcios")}>
            Volver a Consorcios
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Button
        variant="outline-secondary"
        onClick={() => navigate("/consorcios")}
        className="mb-4 rounded-pill"
      >
        <FaArrowLeft className="me-2" /> Volver a Consorcios
      </Button>

      {deleteMessage && (
        <Alert variant={deleteMessage.type}>{deleteMessage.message}</Alert>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        <Col md={8}>
          <Card className="shadow-lg mb-4 border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="mb-1 text-primary">{consorcio.nombre}</h1>
                  <p className="lead text-muted">
                    <FaMapMarkerAlt className="me-2" />
                    {consorcio.direccion}
                  </p>
                </div>
                {(userRole === "admin" || userRole === "employee") && (
                  <Link
                    to={`/edit-consorcio/${consorcio._id}`}
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                    title="Editar Consorcio"
                  >
                    <FaEdit className="me-1" /> Editar
                  </Link>
                )}
              </div>
              <hr className="my-4" />
              <h5 className="mb-3 d-flex align-items-center text-dark">
                <FaUserTie className="me-2 text-primary" /> Información del
                Portero:
              </h5>
              <ListGroup variant="flush" className="border-0 bg-transparent">
                <ListGroup.Item className="bg-transparent border-0 py-1 px-0 d-flex align-items-center">
                  <strong className="me-2">Nombre:</strong>{" "}
                  {consorcio.nombrePortero || "N/A"}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent border-0 py-1 px-0 d-flex align-items-center">
                  <FaPhone className="text-muted me-2" />{" "}
                  {consorcio.telefonoPortero || "N/A"}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent border-0 py-1 px-0 d-flex align-items-center">
                  <FaEnvelope className="text-muted me-2" />{" "}
                  {consorcio.emailPortero || "N/A"}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0 mb-4 h-auto rounded-4">
            <Card.Header
              as="h4"
              className="bg-dark text-white p-3 d-flex justify-content-between align-items-center rounded-top-4"
            >
              Inquilinos
              {(userRole === "admin" || userRole === "employee") && (
                <Button
                  as={Link}
                  to={`/add-inquilino/${consorcio._id}`}
                  variant="light"
                  size="sm"
                  title="Añadir Inquilino"
                  className="rounded-pill"
                >
                  <FaUserPlus className="me-1" /> Añadir
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Buscar inquilino..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-end"
                  />
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchTerm("")}
                      title="Limpiar búsqueda"
                    >
                      &times;
                    </Button>
                  )}
                </div>
              </Form.Group>
            </Card.Body>
            <ListGroup variant="flush">
              {filteredInquilinos.length === 0 ? (
                <ListGroup.Item className="text-muted text-center py-3">
                  No se encontraron inquilinos.
                </ListGroup.Item>
              ) : (
                currentInquilinos.map((inquilino) => (
                  <ListGroup.Item
                    key={inquilino._id}
                    className="d-flex justify-content-between align-items-center py-2 px-3 border-bottom-0 border-start-0 border-end-0"
                  >
                    <div>
                      <strong>{inquilino.nombre} {inquilino.apellido}</strong> ({inquilino.unidad})
                      {inquilino.email && (
                        <div className="text-muted small">
                          {inquilino.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          size="sm"
                          id={`dropdown-inquilino-actions-${inquilino._id}`}
                        >
                          <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            as={Link}
                            to={`/inquilinos/${inquilino._id}`}
                          >
                            <FaInfoCircle className="me-2" /> Ver Detalles
                          </Dropdown.Item>
                          {(userRole === "admin" ||
                            userRole === "employee") && (
                            <>
                              <Dropdown.Item
                                onClick={() =>
                                  handleDeleteClick(inquilino, "inquilino")
                                }
                                className="text-danger"
                              >
                                <FaTrash className="me-2" /> Eliminar
                              </Dropdown.Item>
                            </>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
            {totalPagesInquilinos > 1 && (
  <div className="d-flex justify-content-center flex-wrap my-2">
    <Pagination>
      <Pagination.Prev
        onClick={() => setCurrentPageInquilinos(currentPageInquilinos - 1)}
        disabled={currentPageInquilinos === 1}
      />
      {Array.from({ length: totalPagesInquilinos }, (_, i) => (
        <Pagination.Item
          key={i + 1}
          active={currentPageInquilinos === i + 1}
          onClick={() => setCurrentPageInquilinos(i + 1)}
        >
          {i + 1}
        </Pagination.Item>
      ))}
      <Pagination.Next
        onClick={() => setCurrentPageInquilinos(currentPageInquilinos + 1)}
        disabled={currentPageInquilinos === totalPagesInquilinos}
      />
    </Pagination>
  </div>
)}
          </Card>
          <Card className="shadow-sm border-0 mb-4 h-auto rounded-4">
            <Card.Header
              as="h4"
              className="bg-dark text-white p-3 d-flex justify-content-between align-items-center rounded-top-4"
            >
              <FaCalendarAlt className="me-2" /> Calendario de Eventos
            </Card.Header>
            <Card.Body>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin,timeGridPlugin,listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth, timeGridWeek, timeGridDay, listWeek"
                }}
                events={calendario.map((evento) => ({
                    id: evento._id,
                  title: `${evento.tipo === "mantenimiento" ? "Mantenimiento" : evento.tipo === "evento" ? "Evento" : "Asamblea"}: ${evento.descripcion}`,
                  date: evento.fecha,
                  color:
                    evento.tipo === "mantenimiento"
                      ? "#0d6efd"
                      : evento.tipo === "evento"
                        ? "#198754"
                        : "#6c757d",
                  extendedProps: { ...evento },
                }))}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                editable={true}
                height="auto"
              />
              <Modal
                show={showEventoModal}
                onHide={() => setShowEventoModal(false)}
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    {modalMode === "add" ? "Agregar Evento" : "Editar Evento"}
                  </Modal.Title>
                </Modal.Header>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveEvento();
                  }}
                >
                  <Modal.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control
                        type="date"
                        value={eventoSeleccionado?.fecha?.slice(0, 10) || ""}
                        onChange={(e) =>
                          setEventoSeleccionado({
                            ...eventoSeleccionado,
                            fecha: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control
                        type="text"
                        value={eventoSeleccionado?.descripcion || ""}
                        onChange={(e) =>
                          setEventoSeleccionado({
                            ...eventoSeleccionado,
                            descripcion: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo</Form.Label>
                      <Form.Select
                        value={eventoSeleccionado?.tipo || "evento"}
                        onChange={(e) =>
                          setEventoSeleccionado({
                            ...eventoSeleccionado,
                            tipo: e.target.value,
                          })
                        }
                      >
                        <option value="evento">Evento</option>
                        <option value="asamblea">Asamblea</option>
                        <option value="mantenimiento">Mantenimiento</option>
                      </Form.Select>
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer>
                    {modalMode === "edit" && (
                      <Button
                        variant="danger"
                        onClick={handleDeleteEvento}
                        type="button"
                      >
                        Borrar
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => setShowEventoModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button variant="primary" type="submit">
                      Guardar
                    </Button>
                  </Modal.Footer>
                </Form>
              </Modal>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Tarjeta de Activos */}
          <Card className="shadow-sm border-0 mb-4 h-auto rounded-4">
    <Card.Header
        as="h4"
        className="bg-dark text-white p-3 d-flex justify-content-between align-items-center rounded-top-4"
    >
        Activos
        {(userRole === "admin" || userRole === "employee") && (
            <div className="d-flex align-items-center flex-wrap">
                <Link
                    to={`/activo-list?consorcioId=${consorcio._id}`}
                    className="btn btn-outline-light rounded-pill d-flex align-items-center justify-content-center me-2 mb-2 mb-md-0"
                >
                    Ver lista de activos
                </Link>
                <Button
                    as={Link}
                    to={`/add-activo/${consorcio._id}`}
                    variant="light"
                    size="sm"
                    title="Añadir Activo"
                    className="rounded-pill d-flex align-items-center mb-2 mb-md-0"
                >
                    <FaTools className="me-1" /> Añadir
                </Button>
            </div>
        )}
    </Card.Header>
    <ListGroup variant="flush">
        {activos.length === 0 ? (
            <ListGroup.Item className="text-muted text-center py-3">
                No hay activos registrados para este consorcio.
            </ListGroup.Item>
        ) : (
            currentActivos.map((activo) => (
                <ListGroup.Item
                    key={activo._id}
                    className="d-flex justify-content-between align-items-center py-2 px-3 border-bottom-0 border-start-0 border-end-0"
                >
                    <div className="d-flex align-items-center flex-wrap">
                        <Link
                            to={`/activos/${activo._id}`}
                            className="text-decoration-none text-dark fw-bold me-2"
                        >
                            {activo.nombre} 
                        </Link>
                        <Badge
                            bg={
                                getMaintenanceStatus(activo.proximoMantenimiento, activo.estado)
                                    .color
                            }
                            className="ms-2"
                        >
                            {getMaintenanceStatus(activo.proximoMantenimiento, activo.estado).text}
                        </Badge>
                    </div>
                </ListGroup.Item>
            ))
        )}
    </ListGroup>
    {totalPagesActivos > 1 && (
      <div className="d-flex justify-content-center flex-wrap my-2">
        <Pagination>
          <Pagination.Prev
            onClick={() => setCurrentPageActivos(currentPageActivos - 1)}
            disabled={currentPageActivos === 1}
          />
          {Array.from({ length: totalPagesActivos }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={currentPageActivos === i + 1}
              onClick={() => setCurrentPageActivos(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPageActivos(currentPageActivos + 1)}
            disabled={currentPageActivos === totalPagesActivos}
          />
        </Pagination>
      </div>
    )}
</Card>
          <Card className="shadow-sm border-0 h-auto rounded-4">
            <Card.Header
              as="h4"
              className="bg-dark text-white p-3 d-flex justify-content-between align-items-center rounded-top-4"
            >
              Alertas de Mantenimiento
            </Card.Header>
            <ListGroup variant="flush">
              {activos.filter(
                (activo) =>
                  getMaintenanceStatus(activo.proximoMantenimiento).color ===
                    "danger" ||
                  getMaintenanceStatus(activo.proximoMantenimiento).color ===
                    "warning"
              ).length === 0 ? (
                <ListGroup.Item className="text-muted text-center py-3">
                  No hay alertas de mantenimiento pendientes.
                </ListGroup.Item>
              ) : (
                activos
                  .filter((activo) => {
                    const status = getMaintenanceStatus(
                      activo.proximoMantenimiento
                    );
                    return (
                      status.color === "danger" || status.color === "warning"
                    );
                  })
                  .map((activo) => {
                    const status = getMaintenanceStatus(
                      activo.proximoMantenimiento
                    );
                    return (
                      <ListGroup.Item
                        key={activo._id}
                        className="d-flex justify-content-between align-items-center py-2 px-3 border-bottom-0 border-start-0 border-end-0"
                      >
                        <span>
                          <strong>{activo.nombre}:</strong>
                        </span>
                        <Badge bg={status.color} className="ms-auto">
                          {status.text}
                        </Badge>
                      </ListGroup.Item>
                    );
                  })
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showDeleteConfirmModal}
        onHide={() => setShowDeleteConfirmModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el {itemTypeToDelete} "
          <strong>
            {itemToDelete
              ? itemToDelete.nombre || itemToDelete.marca || "elemento"
              : "este elemento"}
          </strong>
          "? Esta acción es irreversible.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirmModal(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ConsorcioDetail;