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
  "https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev";

const LoginMap = ({ authToken }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null); // Referencia para guardar la instancia del mapa

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

  // ✨ EL CÓDIGO CLAVE PARA MOSTRAR EL MAPA ✨
  useEffect(() => {
    // No hacemos nada si no hay datos o el div no está listo
    if (!history.length || !mapRef.current) {
      return;
    }

    // Si ya hay una instancia del mapa, la eliminamos antes de crear una nueva
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Creamos una nueva instancia del mapa y la guardamos en la referencia
    mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstanceRef.current);

    // Añadir marcadores para cada punto en el historial
    history.forEach((login) => {
      const marker = L.marker([login.lat, login.lon]).addTo(
        mapInstanceRef.current
      );
      marker.bindPopup(`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <strong>Usuario: ${login.user.nombre}</strong><br/>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <hr style="margin: 5px 0;" />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                Ubicación: ${login.city}, ${login.country}<br/>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                IP: ${login.ipAddress}<br/>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                Fecha: ${new Date(login.timestamp).toLocaleString()}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          `);
    });

    // Centrar el mapa en el último marcador
    if (history[0]) {
      mapInstanceRef.current.flyTo([history[0].lat, history[0].lon], 5);
    }

    // La función de limpieza se ejecuta cuando el componente se desmonta
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [history]); // La dependencia clave es 'history'

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
              {history.slice(0,10).map((login, index) => (
                <tr key={index}>
                  <td>{login.user?.nombre}</td>{" "}
                  {/* Usa ? para evitar errores si el usuario no existe */}
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
