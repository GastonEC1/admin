import React, { useEffect, useState, useRef } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BACKEND_BASE_URL = "https://gestion-3kgo.onrender.com";

const LoginMap = ({ authToken }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedLogin, setSelectedLogin] = useState(null);

  // Orden visual
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  const sortedHistory = React.useMemo(() => {
    if (!sortConfig.key) return history;

    const sorted = [...history].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "timestamp") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortConfig.key === "user") {
        aValue = a.user?.nombre || "";
        bValue = b.user?.nombre || "";
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [history, sortConfig]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);

  // Fetch historial
  useEffect(() => {
    if (!authToken) {
      setError("No hay token de autenticación. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }

    const fetchLoginHistory = async () => {
      try {
        const response = await fetch(
          `${BACKEND_BASE_URL}/api/auth/login-history`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.msg || "Error al obtener el historial.");
        setHistory(data);
      } catch (err) {
        console.error("Error al obtener el historial:", err);
        setError(
          err.message || "Ocurrió un error inesperado al cargar el historial."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchLoginHistory();
  }, [authToken]);

  // Inicializar mapa
  useEffect(() => {
    if (!history.length || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      history.forEach((login) => {
        if (login.lat && login.lon) {
          const marker = L.marker([login.lat, login.lon]).addTo(
            mapInstanceRef.current
          );
          marker.bindPopup(`
            <strong>Usuario: ${login.user?.nombre || "No encontrado"}</strong><br/>
            <hr style="margin:5px 0;" />
            Ubicación: ${login.city || "Desconocida"}, ${login.country || "Desconocido"}<br/>
            IP: ${login.ipAddress}<br/>
            Fecha: ${new Date(login.timestamp).toLocaleString()}
          `);
        }
      });
    }

    // Centrar mapa en login seleccionado
    if (selectedLogin && selectedLogin.lat && selectedLogin.lon) {
      mapInstanceRef.current.flyTo([selectedLogin.lat, selectedLogin.lon], 10);
    } else if (history[0]?.lat && history[0]?.lon) {
      mapInstanceRef.current.flyTo([history[0].lat, history[0].lon], 5);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [history, selectedLogin]);

  const handleRowClick = (login) => {
    setSelectedLogin(login);
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" className="text-center mt-4">
        {error}
      </Alert>
    );

  if (history.length === 0)
    return (
      <Alert variant="info" className="text-center mt-4">
        No se encontraron registros de inicio de sesión.
      </Alert>
    );

  return (
    <Card className="shadow-lg mt-4">
      <Card.Body>
        <div
          ref={mapRef}
          style={{ height: "500px", width: "100%", borderRadius: "8px" }}
        ></div>
      </Card.Body>

      <Card.Footer>
        <h5 className="text-center mt-3">Historial Detallado</h5>
        <div className="table-responsive">
          <table className="table table-striped table-hover mt-3">
            <thead>
              <tr>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => requestSort("user")}
                >
                  Usuario <span>⬍</span>
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => requestSort("timestamp")}
                >
                  Fecha y Hora <span>⬍</span>
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => requestSort("lat")}
                >
                  Latitud <span>⬍</span>
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => requestSort("lon")}
                >
                  Longitud <span>⬍</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((login, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(login)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{login.user?.nombre}</td>
                  <td>{new Date(login.timestamp).toLocaleString()}</td>
                  <td>{login.lat}</td>
                  <td>{login.lon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default LoginMap;
