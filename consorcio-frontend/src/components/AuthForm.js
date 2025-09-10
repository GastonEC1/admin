import { useState } from "react";
import {
  Card,
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
// Using a placeholder for the icon because 'react-icons/fa' is not a valid dependency in this environment.
// Replace with a custom icon or SVG if needed in your final project.
const FaSignInAlt = () => <span>&#x1F512;</span>;

const BACKEND_BASE_URL =
  "https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev";

const AuthForm = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const LOGIN_ENDPOINT_PATH = "/api/auth/login";

      const response = await fetch(
        `${BACKEND_BASE_URL}${LOGIN_ENDPOINT_PATH}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Error en el inicio de sesión.");
      }

      if (data.token && data.nombre) {
        localStorage.setItem("authToken", data.token);
        onAuthSuccess(data.token);
      } else {
        throw new Error("Token o nombre de usuario faltantes en la respuesta.");
      }
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError(
          "No se pudo conectar con el servidor. Por favor, verifica que tu backend esté corriendo y que la URL de la API sea correcta. Puede ser un problema de CORS."
        );
      } else if (err instanceof SyntaxError) {
        setError(
          `Error al procesar la respuesta del servidor. Asegúrate de que el servidor siempre envíe JSON válido. Mensaje: ${err.message}`
        );
      } else {
        setError(
          err.message || "Ocurrió un error inesperado al iniciar sesión."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#508bfc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <Container className="py-5 h-100">
        <Row className="d-flex justify-content-center align-items-center h-100">
          <Col xs={12} md={8} lg={6} xl={5}>
            <Card className="shadow-lg" style={{ borderRadius: '1rem' }}>
              <Card.Body className="p-5 text-center">
                <h3 className="mb-5">Iniciar Sesión</h3>

                {error && (
                  <Alert variant="danger" className="text-center">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Control
                      type="email"
                      id="typeEmailX-2"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-label="Correo Electrónico"
                      size="lg"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Control
                      type="password"
                      id="typePasswordX-2"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-label="Contraseña"
                      size="lg"
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthForm;