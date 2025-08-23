import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function EditActivo() {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [descripcion, setDescripcion] = useState(''); 
    const [fechaInstalacion, setFechaInstalacion] = useState(''); 
    const [proximoMantenimiento, setProximoMantenimiento] = useState(''); 
    const [frecuenciaMantenimiento, setFrecuenciaMantenimiento] = useState('No aplica'); 
    const [estado, setEstado] = useState('Operativo'); 
    const [ultimoCostoMantenimiento, setUltimoCostoMantenimiento] = useState(''); // Nuevo estado
    const [fechaUltimoMantenimiento, setFechaUltimoMantenimiento] = useState(''); // Nuevo estado
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
                setMarca(activoData.marca);
                setModelo(activoData.modelo);
                setUbicacion(activoData.ubicacion);
                setDescripcion(activoData.descripcion || '');
                setFechaInstalacion(activoData.fechaInstalacion ? new Date(activoData.fechaInstalacion).toISOString().split('T')[0] : '');
                setProximoMantenimiento(activoData.proximoMantenimiento ? new Date(activoData.proximoMantenimiento).toISOString().split('T')[0] : '');
                setFrecuenciaMantenimiento(activoData.frecuenciaMantenimiento || 'No aplica');
                setEstado(activoData.estado || 'Operativo');
                setUltimoCostoMantenimiento(activoData.ultimoCostoMantenimiento || ''); // Cargar costo
                setFechaUltimoMantenimiento(activoData.fechaUltimoMantenimiento ? new Date(activoData.fechaUltimoMantenimiento).toISOString().split('T')[0] : ''); // Cargar fecha
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
        
        try {
            const updatedActivo = { 
                nombre, marca, modelo, ubicacion, 
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
        return <Container className="mt-5 text-center"><h2>Cargando Activo...</h2></Container>;
    }

    return (
        <Container className="mt-5">
            <h2>Editar Activo</h2>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            
            <Form onSubmit={handleSubmit} className="mt-3">
                <Form.Group className="mb-3" controlId="formNombre">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formMarca">
                    <Form.Label>Marca</Form.Label>
                    <Form.Control type="text" value={marca} onChange={(e) => setMarca(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formModelo">
                    <Form.Label>Modelo</Form.Label>
                    <Form.Control type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formUbicacion">
                    <Form.Label>Ubicación</Form.Label>
                    <Form.Control type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescripcion">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control as="textarea" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formFechaInstalacion">
                    <Form.Label>Fecha de Instalación</Form.Label>
                    <Form.Control type="date" value={fechaInstalacion} onChange={(e) => setFechaInstalacion(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formProximoMantenimiento">
                    <Form.Label>Próximo Mantenimiento</Form.Label>
                    <Form.Control type="date" value={proximoMantenimiento} onChange={(e) => setProximoMantenimiento(e.target.value)} />
                </Form.Group>

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

                <Form.Group className="mb-3" controlId="formEstado">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="Operativo">Operativo</option>
                        <option value="En Reparacion">En Reparación</option>
                        <option value="Fuera de Servicio">Fuera de Servicio</option>
                        <option value="Pendiente de Mantenimiento">Pendiente de Mantenimiento</option>
                    </Form.Select>
                </Form.Group>

                {/* Nuevos campos para el último mantenimiento y costo */}
                <h5 className="mt-4">Información del Último Mantenimiento (Opcional)</h5>
                <Form.Group className="mb-3" controlId="formUltimoCostoMantenimiento">
                    <Form.Label>Costo del Último Mantenimiento ($)</Form.Label>
                    <Form.Control 
                        type="number" 
                        step="0.01" 
                        value={ultimoCostoMantenimiento} 
                        onChange={(e) => setUltimoCostoMantenimiento(e.target.value)} 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formFechaUltimoMantenimiento">
                    <Form.Label>Fecha del Último Mantenimiento</Form.Label>
                    <Form.Control 
                        type="date" 
                        value={fechaUltimoMantenimiento} 
                        onChange={(e) => setFechaUltimoMantenimiento(e.target.value)} 
                    />
                </Form.Group>

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
        </Container>
    );
}

export default EditActivo;
