import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';

function EditActivo() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaInstalacion, setFechaInstalacion] = useState('');
    const [proximoMantenimiento, setProximoMantenimiento] = useState('');
    const [frecuenciaMantenimiento, setFrecuenciaMantenimiento] = useState('No aplica');
    const [estado, setEstado] = useState('Operativo');
    const [ultimoCostoMantenimiento, setUltimoCostoMantenimiento] = useState('');
    const [fechaUltimoMantenimiento, setFechaUltimoMantenimiento] = useState('');
    const [consorcioId, setConsorcioId] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const backendBaseUrl = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api';
    const activosBackendUrl = `${backendBaseUrl}/activos`;
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const activoResponse = await axios.get(`${activosBackendUrl}/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                const activoData = activoResponse.data;
                setNombre(activoData.nombre);
                setTipo(activoData.tipo || ''); // Cargar el tipo desde la API
                setMarca(activoData.marca || '');
                setModelo(activoData.modelo || '');
                setUbicacion(activoData.ubicacion || '');
                setDescripcion(activoData.descripcion || '');
                setFechaInstalacion(activoData.fechaInstalacion ? new Date(activoData.fechaInstalacion).toISOString().split('T')[0] : '');
                setProximoMantenimiento(activoData.proximoMantenimiento ? new Date(activoData.proximoMantenimiento).toISOString().split('T')[0] : '');
                setFrecuenciaMantenimiento(activoData.frecuenciaMantenimiento || 'No aplica');
                setEstado(activoData.estado || 'Operativo');
                setUltimoCostoMantenimiento(activoData.ultimoCostoMantenimiento || '');
                setFechaUltimoMantenimiento(activoData.fechaUltimoMantenimiento ? new Date(activoData.fechaUltimoMantenimiento).toISOString().split('T')[0] : '');
                setConsorcioId(activoData.consorcio?._id || activoData.consorcio);
                setLoading(false);

            } catch (err) {
                setErrorMessage('Error al cargar los datos del activo.');
                setLoading(false);
                console.error(err);
            }
        };
        fetchData();
    }, [id, token, activosBackendUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (tipo === '') {
            setErrorMessage('El tipo de activo es un campo obligatorio.');
            return;
        }

        try {
            const updatedActivo = {
                nombre, tipo, marca, modelo, ubicacion,
                descripcion, fechaInstalacion, proximoMantenimiento,
                frecuenciaMantenimiento, estado,
                ultimoCostoMantenimiento: parseFloat(ultimoCostoMantenimiento) || 0,
                fechaUltimoMantenimiento,
                consorcio: consorcioId
            };

            await axios.put(`${activosBackendUrl}/${id}`, updatedActivo, {
                headers: { 'x-auth-token': token }
            });

            setSuccessMessage('Activo actualizado con éxito.');
            navigate(`/consorcios/${consorcioId}`);

        } catch (err) {
            setErrorMessage('Error al actualizar el activo. Por favor, revisa los datos.');
            console.error(err.response ? err.response.data : err.message);
        }
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" className="mb-3" />
                <h2>Cargando Activo...</h2>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">Editar Activo</h2>
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate(`/consorcios/${consorcioId}`)}
                >
                    Cancelar
                </Button>
            </div>

            <Card className="p-4 shadow-lg">
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
                                <Form.Select
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                    isInvalid={!!errorMessage}
                                    required
                                >
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
                                <Form.Control.Feedback type="invalid">
                                    {errorMessage}
                                </Form.Control.Feedback>
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

                    <Button variant="primary" type="submit" className="w-100 mt-3">
                        Actualizar Activo
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-100 mt-2"
                        onClick={() => navigate(`/consorcios/${consorcioId}`)}
                    >
                        Cancelar
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default EditActivo;