import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';

function EditInquilino() {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [unidad, setUnidad] = useState('');
    const [tipoUnidad, setTipoUnidad] = useState('Departamento'); 
    const [consorcioId, setConsorcioId] = useState(''); 
    const [consorciosList, setConsorciosList] = useState([]); 
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const backendBaseUrl = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api';
    const inquilinosBackendUrl = `${backendBaseUrl}/inquilinos`;
    const consorciosBackendUrl = `${backendBaseUrl}/consorcios`;
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Cargar datos del inquilino
                const inquilinoResponse = await axios.get(`${inquilinosBackendUrl}/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                const inquilinoData = inquilinoResponse.data;
                setNombre(inquilinoData.nombre);
                setEmail(inquilinoData.email);
                setTelefono(inquilinoData.telefono);
                setUnidad(inquilinoData.unidad);
                setTipoUnidad(inquilinoData.tipoUnidad || 'Departamento'); 
                setConsorcioId(inquilinoData.consorcio._id || inquilinoData.consorcio); 

                // Cargar lista de consorcios
                const consorciosResponse = await axios.get(consorciosBackendUrl, {
                    headers: { 'x-auth-token': token }
                });
                setConsorciosList(consorciosResponse.data);
                setLoading(false);

            } catch (err) {
                setErrorMessage('Error al cargar los datos del inquilino o consorcios.');
                setLoading(false);
                console.error(err);
            }
        };
        fetchData();
    }, [id, token, inquilinosBackendUrl, consorciosBackendUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        
        try {
            const updatedInquilino = { nombre, email, telefono, unidad, tipoUnidad, consorcio: consorcioId };
            
            await axios.put(`${inquilinosBackendUrl}/${id}`, updatedInquilino, {
                headers: { 'x-auth-token': token }
            });
            
            setSuccessMessage('Inquilino actualizado con éxito.');
            navigate(`/consorcios/${consorcioId}`); 
            
        } catch (err) {
            setErrorMessage('Error al actualizar el inquilino. Por favor, revisa los datos.');
            console.error(err.response ? err.response.data : err.message);
        }
    };

    if (loading) {
        return <Container className="mt-5 text-center"><h2>Cargando Inquilino...</h2></Container>;
    }

    return (
        <Container className="mt-5">
            <h2>Editar Inquilino</h2>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            
            <Form onSubmit={handleSubmit} className="mt-3">
                <Form.Group className="mb-3" controlId="formNombre">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formTelefono">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formUnidad">
                    <Form.Label>Unidad</Form.Label>
                    <Form.Control type="text" value={unidad} onChange={(e) => setUnidad(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formTipoUnidad">
                    <Form.Label>Tipo de Unidad</Form.Label>
                    <Form.Select 
                        value={tipoUnidad} 
                        onChange={(e) => setTipoUnidad(e.target.value)} 
                        required
                    >
                        <option value="Departamento">Departamento</option>
                        <option value="Oficina">Oficina</option>
                        <option value="Local">Local</option>
                        <option value="Otro">Otro</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConsorcio">
                    <Form.Label>Consorcio</Form.Label>
                    <Form.Select value={consorcioId} onChange={(e) => setConsorcioId(e.target.value)} required>
                        <option value="">Selecciona un consorcio...</option>
                        {consorciosList.map((cons) => (
                            <option key={cons._id} value={cons._id}>
                                {cons.nombre} ({cons.direccion})
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-3">
                    Actualizar Inquilino
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

export default EditInquilino;