import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function AddActivo() {
    const { consorcioId } = useParams();
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

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const backendUrl = 'https://plhsk4j3-5000.brs.devtunnels.ms/api';
    const token = localStorage.getItem('token');

    const [consorcioNombre, setConsorcioNombre] = useState('');
    useEffect(() => {
        const fetchConsorcioName = async () => {
            try {
                const response = await axios.get(`${backendUrl}/consorcios/${consorcioId}`, {
                    headers: { 'x-auth-token': token }
                });
                setConsorcioNombre(response.data.nombre);
            } catch (err) {
                console.error('Error al cargar el nombre del consorcio:', err);
                setConsorcioNombre('Consorcio Desconocido');
            }
        };
        if (consorcioId) {
            fetchConsorcioName();
        }
    }, [consorcioId, backendUrl, token]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        
        try {
            const newActivo = { 
                nombre, marca, modelo, ubicacion, 
                descripcion, fechaInstalacion, proximoMantenimiento, 
                frecuenciaMantenimiento, estado, 
                ultimoCostoMantenimiento: parseFloat(ultimoCostoMantenimiento) || 0, // Asegurar que sea número
                fechaUltimoMantenimiento, // Enviar como string (formato date)
                consorcio: consorcioId 
            };
            
            await axios.post(`${backendUrl}/activos`, newActivo, {
                headers: { 'x-auth-token': token }
            });
            
            setSuccessMessage('Activo creado y asociado con éxito.');
            setNombre('');
            setMarca('');
            setModelo('');
            setUbicacion('');
            setDescripcion('');
            setFechaInstalacion('');
            setProximoMantenimiento('');
            setFrecuenciaMantenimiento('No aplica');
            setEstado('Operativo');
            setUltimoCostoMantenimiento(''); // Limpiar
            setFechaUltimoMantenimiento(''); // Limpiar
            
            navigate(`/consorcios/${consorcioId}`);
            
        } catch (err) {
            setErrorMessage('Error al crear el activo. Por favor, revisa los datos.');
            console.error('Error al enviar el formulario:', err.response ? err.response.data : err.message);
        }
    };

    return (
        <Container className="mt-5">
            <h2>Agregar Nuevo Activo</h2>
            {consorcioId && ( 
                <Alert variant="info" className="mb-3">
                    Añadiendo activo al consorcio: <strong>{consorcioNombre || 'Cargando...'}</strong>
                </Alert>
            )}
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

                <Button variant="primary" type="submit" className="w-100 mt-3">
                    Crear Activo
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

export default AddActivo;