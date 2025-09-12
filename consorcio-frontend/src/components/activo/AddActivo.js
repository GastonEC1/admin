import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Container, Alert, Row, Col, Spinner, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function AddActivo() {
    const { consorcioId } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaInstalacion, setFechaInstalacion] = useState('');
    const [proximoMantenimiento, setProximoMantenimiento] = useState('');
    const [frecuenciaMantenimiento, setFrecuenciaMantenimiento] = useState('No aplica');
    const [estado, setEstado] = useState('Operativo');
    const [ultimoCostoMantenimiento, setUltimoCostoMantenimiento] = useState('');
    const [fechaUltimoMantenimiento, setFechaUltimoMantenimiento] = useState('');

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [consorcioNombre, setConsorcioNombre] = useState('');
    const [loading, setLoading] = useState(false);

    const isSubmitting = useRef(false);

    const backendUrl = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        let isMounted = true;
        const fetchConsorcioName = async () => {
            try {
                const response = await axios.get(`${backendUrl}/consorcios/${consorcioId}`, {
                    headers: { 'x-auth-token': token }
                });
                if (isMounted) {
                    setConsorcioNombre(response.data.nombre);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error al cargar el nombre del consorcio:', err);
                    setConsorcioNombre('Consorcio Desconocido');
                }
            }
        };
        if (consorcioId) {
            fetchConsorcioName();
        }
        return () => {
            isMounted = false;
        };
    }, [consorcioId, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting.current) {
            return;
        }
        isSubmitting.current = true;
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const newActivo = {
                nombre, tipo, ubicacion, marca, modelo,
                descripcion, fechaInstalacion, proximoMantenimiento,
                frecuenciaMantenimiento, estado,
                ultimoCostoMantenimiento: parseFloat(ultimoCostoMantenimiento) || 0,
                fechaUltimoMantenimiento,
                consorcio: consorcioId
            };

            await axios.post(`${backendUrl}/activos`, newActivo, {
                headers: { 'x-auth-token': token }
            });

            setSuccessMessage('Activo creado y asociado con éxito.');

            setNombre(''); setTipo(''); setUbicacion(''); setMarca(''); setModelo('');
            setDescripcion(''); setFechaInstalacion(''); setProximoMantenimiento('');
            setFrecuenciaMantenimiento('No aplica'); setEstado('Operativo');
            setUltimoCostoMantenimiento(''); setFechaUltimoMantenimiento('');

            setTimeout(() => {
                navigate(`/consorcios/${consorcioId}`);
            }, 2000);

        } catch (err) {
            setErrorMessage('Error al crear el activo. Por favor, revisa los datos.');
            console.error('Error al enviar el formulario:', err.response ? err.response.data : err.message);
            isSubmitting.current = false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-primary fw-bold">Agregar Nuevo Activo</h1>
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate(`/consorcios/${consorcioId}`)}
                >
                    Cancelar
                </Button>
            </div>

            <Card className="p-4 shadow-lg">
                {consorcioId && (
                    <Alert variant="info" className="mb-3">
                        Añadiendo activo al consorcio: <strong>{consorcioNombre || 'Cargando...'}</strong>
                    </Alert>
                )}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                <Form onSubmit={handleSubmit} className="mt-3">
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formNombre">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formTipo">
                                <Form.Label>Tipo</Form.Label>
                                <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                                    <option value="">Seleccione un tipo...</option>
                                    <option value="Sistema Eléctrico">Sistema Eléctrico</option>
                                    <option value="Ascensor">Ascensor</option>
                                    <option value="Plomería">Plomería</option>
                                    <option value="HVAC">HVAC</option>
                                    <option value="Seguridad">Seguridad</option>
                                    <option value="Mobiliario">Mobiliario</option>
                                    <option value="Recreativo">Recreativo</option>
                                    <option value="Otro">Otro</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formMarca">
                                <Form.Label>Marca</Form.Label>
                                <Form.Control type="text" value={marca} onChange={(e) => setMarca(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formModelo">
                                <Form.Label>Modelo</Form.Label>
                                <Form.Control type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3" controlId="formUbicacion">
                        <Form.Label>Ubicación</Form.Label>
                        <Form.Control type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formDescripcion">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control as="textarea" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                    </Form.Group>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formFechaInstalacion">
                                <Form.Label>Fecha de Instalación</Form.Label>
                                <Form.Control type="date" value={fechaInstalacion} onChange={(e) => setFechaInstalacion(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formProximoMantenimiento">
                                <Form.Label>Próximo Mantenimiento</Form.Label>
                                <Form.Control type="date" value={proximoMantenimiento} onChange={(e) => setProximoMantenimiento(e.target.value)} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formFrecuenciaMantenimiento">
                                <Form.Label>Frecuencia de Mantenimiento</Form.Label>
                                <Form.Select value={frecuenciaMantenimiento} onChange={(e) => setFrecuenciaMantenimiento(e.target.value)}>
                                    <option value="No aplica">No aplica</option>
                                    <option value="Mensual">Mensual</option>
                                    <option value="Trimestral">Trimestral</option>
                                    <option value="Semestral">Semestral</option>
                                    <option value="Anual">Anual</option>
                                    <option value="Según Uso">Según Uso</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formEstado">
                                <Form.Label>Estado</Form.Label>
                                <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}>
                                    <option value="Operativo">Operativo</option>
                                    <option value="En Reparacion">En Reparación</option>
                                    <option value="Fuera de Servicio">Fuera de Servicio</option>
                                    <option value="Pendiente de Mantenimiento">Pendiente de Mantenimiento</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button
                        variant="primary"
                        type="submit"
                        className="w-100 mt-3"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Creando...
                            </>
                        ) : (
                            <> Crear Activo</>
                        )}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default AddActivo;
