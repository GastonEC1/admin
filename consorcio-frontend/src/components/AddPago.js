import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Modal } from 'react-bootstrap'; // Importa Modal
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function AddPago() {
    const { consorcioId } = useParams(); // Puede venir el ID del consorcio de la URL
    const navigate = useNavigate();

    const [consorcio, setConsorcio] = useState(consorcioId || '');
    const [inquilino, setInquilino] = useState(''); // El inquilino se seleccionará del dropdown
    const [monto, setMonto] = useState('');
    const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
    const [periodo, setPeriodo] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const [consorciosList, setConsorciosList] = useState([]);
    const [inquilinosList, setInquilinosList] = useState([]); // Inquilinos filtrados por consorcio
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingConsorcios, setLoadingConsorcios] = useState(true);
    const [loadingInquilinos, setLoadingInquilinos] = useState(false);
    const [submittingPayment, setSubmittingPayment] = useState(false); // Estado para el botón de registro de pago

    // Estados para el modal del comprobante
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptSubject, setReceiptSubject] = useState('');
    const [receiptBody, setReceiptBody] = useState('');
    const [sendingReceiptEmail, setSendingReceiptEmail] = useState(false);
    const [lastRegisteredPayment, setLastRegisteredPayment] = useState(null); // Para guardar el pago recién creado
    const [selectedInquilinoEmail, setSelectedInquilinoEmail] = useState(''); // Para guardar el email del inquilino seleccionado

    const backendUrl = 'https://refactored-xylophone-jv659gpjqq62jqr5-5000.app.github.dev/api'; // ¡Actualiza con la URL de tu Codespace!
    const token = localStorage.getItem('token');

    // Cargar la lista de consorcios
    useEffect(() => {
        const fetchConsorcios = async () => {
            try {
                const response = await axios.get(`${backendUrl}/consorcios`, {
                    headers: { 'x-auth-token': token }
                });
                setConsorciosList(response.data);
                setLoadingConsorcios(false);
            } catch (err) {
                console.error('Error al cargar la lista de consorcios:', err);
                setErrorMessage('No se pudo cargar la lista de consorcios.');
                setLoadingConsorcios(false);
            }
        };
        fetchConsorcios();
    }, [backendUrl, token]);

    // Cargar la lista de inquilinos cuando se selecciona un consorcio
    useEffect(() => {
        if (consorcio) {
            setLoadingInquilinos(true);
            const fetchInquilinos = async () => {
                try {
                    // Obtener los inquilinos para el consorcio seleccionado
                    const response = await axios.get(`${backendUrl}/consorcios/${consorcio}`, { // Usa la ruta de detalle del consorcio que ya popula inquilinos
                        headers: { 'x-auth-token': token }
                    });
                    setInquilinosList(response.data.inquilinos || []); // Los inquilinos vienen populados en el consorcio
                    setLoadingInquilinos(false);
                } catch (err) {
                    console.error('Error al cargar la lista de inquilinos:', err);
                    setErrorMessage('No se pudo cargar la lista de inquilinos para el consorcio seleccionado.');
                    setLoadingInquilinos(false);
                }
            };
            fetchInquilinos();
        } else {
            setInquilinosList([]); // Limpiar la lista si no hay consorcio seleccionado
            setInquilino(''); // Limpiar el inquilino seleccionado
            setSelectedInquilinoEmail('');
        }
    }, [consorcio, backendUrl, token]);

    // Actualizar el email del inquilino seleccionado
    useEffect(() => {
        if (inquilino && inquilinosList.length > 0) {
            const selected = inquilinosList.find(inv => inv._id === inquilino);
            if (selected) {
                setSelectedInquilinoEmail(selected.email);
            } else {
                setSelectedInquilinoEmail('');
            }
        } else {
            setSelectedInquilinoEmail('');
        }
    }, [inquilino, inquilinosList]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        setSubmittingPayment(true);
        
        try {
            const newPago = { 
                consorcio, 
                inquilino, 
                monto: parseFloat(monto), 
                fechaPago, 
                periodo, 
                descripcion 
            };
            
            const response = await axios.post(`${backendUrl}/pagos`, newPago, {
                headers: { 'x-auth-token': token }
            });
            
            setSuccessMessage('Pago registrado con éxito.');
            setLastRegisteredPayment(response.data); // Guarda el pago recién registrado

            // Limpiar el formulario
            setMonto('');
            setFechaPago(new Date().toISOString().split('T')[0]);
            setPeriodo('');
            setDescripcion('');
            // No reseteamos consorcio e inquilino si ya venían pre-seleccionados, para facilitar añadir más pagos
            
            // Generar y mostrar el comprobante en el modal
            generateAndShowReceipt(response.data);
            
        } catch (err) {
            setErrorMessage('Error al registrar el pago. Por favor, revisa los datos.');
            console.error('Error al enviar el formulario de pago:', err.response ? err.response.data : err.message);
        } finally {
            setSubmittingPayment(false);
        }
    };

    // Función para generar y mostrar el comprobante
    const generateAndShowReceipt = (pago) => {
        const consorcioNombre = consorciosList.find(c => c._id === pago.consorcio)?.nombre || 'N/A';
        const inquilinoData = inquilinosList.find(i => i._id === pago.inquilino);
        const inquilinoNombre = inquilinoData?.nombre || 'N/A';
        const inquilinoUnidad = inquilinoData?.unidad || 'N/A';
        const inquilinoEmail = inquilinoData?.email || 'N/A';

        const fechaPagoFormateada = pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

        const subject = `Comprobante de Pago - ${consorcioNombre} - ${pago.periodo}`;
        const body = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Comprobante de Pago</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
                    h2 { color: #0056b3; text-align: center; }
                    .details p { margin: 5px 0; }
                    .details strong { width: 150px; display: inline-block; }
                    .amount { font-size: 1.5em; font-weight: bold; color: #28a745; text-align: center; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #777; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Comprobante de Pago</h2>
                    <hr/>
                    <div class="details">
                        <p><strong>Consorcio:</strong> ${consorcioNombre}</p>
                        <p><strong>Inquilino:</strong> ${inquilinoNombre} (Unidad: ${inquilinoUnidad})</p>
                        <p><strong>Período:</strong> ${pago.periodo}</p>
                        <p><strong>Fecha de Pago:</strong> ${fechaPagoFormateada}</p>
                        <p><strong>Monto Pagado:</strong> <span class="amount">$${pago.monto.toFixed(2)}</span></p>
                        ${pago.descripcion ? `<p><strong>Descripción:</strong> ${pago.descripcion}</p>` : ''}
                    </div>
                    <div class="footer">
                        <p>Gracias por su pago.</p>
                        <p>Administración del Consorcio "${consorcioNombre}"</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        setReceiptSubject(subject);
        setReceiptBody(body);
        setShowReceiptModal(true);
        setSelectedInquilinoEmail(inquilinoEmail); // Guarda el email del inquilino para el envío
    };

    const handleCloseReceiptModal = () => {
        setShowReceiptModal(false);
        setReceiptSubject('');
        setReceiptBody('');
        setSendingReceiptEmail(false);
        setLastRegisteredPayment(null);
        setSelectedInquilinoEmail('');
        // Después de cerrar el modal, redirigimos
        if (consorcioId) {
            navigate(`/consorcios/${consorcioId}`);
        } else {
            navigate('/consorcios');
        }
    };

    // Envía el comprobante por correo electrónico
    const handleSendReceiptEmail = async () => {
        setSendingReceiptEmail(true);
        setErrorMessage('');
        setSuccessMessage(''); // Limpiamos el mensaje de éxito del pago

        if (!selectedInquilinoEmail || !receiptSubject || !receiptBody) {
            setErrorMessage('Faltan datos para enviar el correo (email del inquilino, asunto o cuerpo).');
            setSendingReceiptEmail(false);
            return;
        }

        try {
            await axios.post(`${backendUrl}/email/send-custom-html-email`, {
                recipientEmail: selectedInquilinoEmail,
                subject: receiptSubject,
                htmlBody: receiptBody,
                // Puedes añadir IDs para logs en el backend si es útil
                consorcioId: lastRegisteredPayment.consorcio,
                inquilinoId: lastRegisteredPayment.inquilino,
                pagoId: lastRegisteredPayment._id
            }, {
                headers: { 'x-auth-token': token }
            });
            setSuccessMessage('Comprobante enviado con éxito al inquilino.');
            // Podemos cerrar el modal o dejarlo abierto para que el usuario sepa que se envió
            // handleCloseReceiptModal(); // Si quieres que se cierre automáticamente
        } catch (err) {
            setErrorMessage(`Error al enviar el comprobante: ${err.response?.data?.msg || err.message}`);
            console.error('Error al enviar el comprobante por email:', err.response ? err.response.data : err.message);
        } finally {
            setSendingReceiptEmail(false);
        }
    };


    return (
        <Container className="mt-5">
            <h2>Registrar Nuevo Pago</h2>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            
            <Form onSubmit={handleSubmit} className="mt-3">
                <Form.Group className="mb-3" controlId="formConsorcio">
                    <Form.Label>Consorcio</Form.Label>
                    <Form.Select 
                        value={consorcio} 
                        onChange={(e) => {
                            setConsorcio(e.target.value);
                            setInquilino(''); // Resetear inquilino al cambiar de consorcio
                        }} 
                        required
                        disabled={loadingConsorcios || (consorcioId && consorcio)} // Deshabilitar si el ID viene de la URL
                    >
                        <option value="">Selecciona un consorcio...</option>
                        {consorciosList.map((cons) => (
                            <option key={cons._id} value={cons._id}>
                                {cons.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formInquilino">
                    <Form.Label>Inquilino</Form.Label>
                    <Form.Select 
                        value={inquilino} 
                        onChange={(e) => setInquilino(e.target.value)} 
                        required
                        disabled={!consorcio || loadingInquilinos} // Deshabilitar si no hay consorcio o está cargando
                    >
                        <option value="">Selecciona un inquilino...</option>
                        {inquilinosList.map((inv) => (
                            <option key={inv._id} value={inv._id}>
                                {inv.nombre} ({inv.unidad}) - {inv.email}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formMonto">
                    <Form.Label>Monto</Form.Label>
                    <Form.Control 
                        type="number" 
                        step="0.01" 
                        placeholder="Ej: 5000.50" 
                        value={monto} 
                        onChange={(e) => setMonto(e.target.value)} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formFechaPago">
                    <Form.Label>Fecha de Pago</Form.Label>
                    <Form.Control 
                        type="date" 
                        value={fechaPago} 
                        onChange={(e) => setFechaPago(e.target.value)} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPeriodo">
                    <Form.Label>Período (Ej: Expensas Noviembre 2025)</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Ej: Expensas Noviembre 2025" 
                        value={periodo} 
                        onChange={(e) => setPeriodo(e.target.value)} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescripcion">
                    <Form.Label>Descripción (Opcional)</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        placeholder="Detalles adicionales del pago" 
                        value={descripcion} 
                        onChange={(e) => setDescripcion(e.target.value)} 
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-3" disabled={submittingPayment}>
                    {submittingPayment ? 'Registrando Pago...' : 'Registrar Pago'}
                </Button>
                <Button 
                    variant="secondary" 
                    className="w-100 mt-2" 
                    onClick={() => {
                        if (consorcioId) {
                            navigate(`/consorcios/${consorcioId}`);
                        } else {
                            navigate('/consorcios');
                        }
                    }}
                >
                    Cancelar
                </Button>
            </Form>

            {/* Modal para previsualizar y enviar el comprobante */}
            <Modal show={showReceiptModal} onHide={handleCloseReceiptModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Comprobante de Pago</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {successMessage && <Alert variant="success">{successMessage}</Alert>} {/* Muestra el mensaje de éxito del envío de email aquí */}
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>} {/* Muestra el error del envío de email aquí */}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Email del Inquilino</Form.Label>
                            <Form.Control 
                                type="email" 
                                value={selectedInquilinoEmail} 
                                readOnly // El email del inquilino no debería ser editable aquí, se selecciona en el formulario
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Asunto del Correo</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={receiptSubject} 
                                onChange={(e) => setReceiptSubject(e.target.value)} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cuerpo del Comprobante (HTML)</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={15} 
                                value={receiptBody} 
                                onChange={(e) => setReceiptBody(e.target.value)} 
                                style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }} // Pre-wrap para ver HTML
                            />
                            <div className="mt-2 p-2 border rounded" style={{ backgroundColor: '#e9ecef' }}>
                                <strong>Previsualización:</strong>
                                <div dangerouslySetInnerHTML={{ __html: receiptBody }} />
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseReceiptModal}>
                        Cerrar y Volver
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSendReceiptEmail} 
                        disabled={sendingReceiptEmail}
                    >
                        {sendingReceiptEmail ? 'Enviando Comprobante...' : 'Enviar Comprobante por Email'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default AddPago;
