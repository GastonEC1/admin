import React, { useEffect, useState, useRef } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Esenciales para que los iconos de los marcadores funcionen
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BACKEND_BASE_URL =
  "https://prueba-3-8t74.onrender.com";

const LoginMap = ({ authToken }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedLogin, setSelectedLogin] = useState(null); // ✨ NUEVO ESTADO: Guarda el login seleccionado

  // useEffect para cargar los datos del historial
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
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.msg || "Error al obtener el historial de inicios de sesión."
          );
        }
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

  // Logica para centrar el mapa
  useEffect(() => {
    // Si no hay datos, no hacemos nada
    if (!history.length || !mapRef.current) {
      return;
    }
   
    // Si no existe la instancia del mapa, la creamos
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
            <hr style="margin: 5px 0;" />
            Ubicación: ${login.city || "Desconocida"}, ${login.country || "Desconocido"}<br/>
            IP: ${login.ipAddress}<br/>
            Fecha: ${new Date(login.timestamp).toLocaleString()}
          `);
        } else {
          console.warn("Saltando marcador por falta de coordenadas:", login);
        }
      });
    }

    // ✨ NUEVA LÓGICA: Centra el mapa en el usuario seleccionado
    if (selectedLogin && selectedLogin.lat && selectedLogin.lon) {
        mapInstanceRef.current.flyTo([selectedLogin.lat, selectedLogin.lon], 10);
    } else if (history.length > 0 && history[0].lat && history[0].lon) {
        // Lógica para centrar el mapa en el primer registro si no hay uno seleccionado
        mapInstanceRef.current.flyTo([history[0].lat, history[0].lon], 5);
    } else {
        console.warn("No hay datos de coordenadas válidos para centrar el mapa.");
    }

    // La función de limpieza se ejecuta cuando el componente se desmonta
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [history, selectedLogin]); // ✨ NUEVA DEPENDENCIA: Reacciona cuando se selecciona un login

  // ✨ NUEVO HANDLER: Función para manejar el clic en la tabla
  const handleRowClick = (login) => {
    setSelectedLogin(login);
  };

  if (loading) {
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
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center mt-4">
        {error}
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <Alert variant="info" className="text-center mt-4">
        No se encontraron registros de inicio de sesión.
      </Alert>
    );
  }

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
                <th>Usuario</th>
                <th>Fecha y Hora</th>
                <th>Latitud</th>
                <th>Longitud</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((login, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(login)} // ✨ AÑADE EL EVENTO CLICK
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
      </Card.Footer>
    </Card>
  );
};

export default LoginMap;