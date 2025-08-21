const express = require('express');
const router = express.Router();
const Consorcio = require('../models/consorcio');
const Activo = require('../models/activo');
const nodemailer = require('nodemailer'); // Importa Nodemailer

// Configuración del transportador de Nodemailer
// ¡IMPORTANTE! Asegúrate de que EMAIL_USER y EMAIL_PASS estén en tu archivo .env
// Si usas Gmail, recuerda que EMAIL_PASS DEBE ser una "contraseña de aplicación".
const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes cambiarlo por tu servicio de correo (ej: 'Outlook365', 'SendGrid', etc.)
    auth: {
        user: process.env.EMAIL_USER, // Tu correo electrónico (variable de entorno)
        pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación o real (variable de entorno)
    }
});

// Ruta POST para enviar correos de notificación de mantenimiento
router.post('/send-maintenance-notification', async (req, res) => {
    const { consorcioId, activoId, costoMantenimiento, fechaMantenimiento, editedSubject, editedBody } = req.body;

    if (!consorcioId || !activoId) {
        return res.status(400).json({ msg: 'Faltan parámetros consorcioId o activoId.' });
    }

    try {
        const consorcio = await Consorcio.findById(consorcioId).populate('inquilinos');
        if (!consorcio) {
            return res.status(404).json({ msg: 'Consorcio no encontrado.' });
        }

        const activo = await Activo.findById(activoId);
        if (!activo) {
            return res.status(404).json({ msg: 'Activo no encontrado.' });
        }

        if (!consorcio.inquilinos || consorcio.inquilinos.length === 0) {
            return res.status(400).json({ msg: 'El consorcio no tiene inquilinos registrados para enviar notificaciones.' });
        }

        // Generar contenido por defecto si no se recibe el contenido editado
        const fechaFormateada = fechaMantenimiento ? new Date(fechaMantenimiento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        const costoFormateado = costoMantenimiento ? `$${parseFloat(costoMantenimiento).toFixed(2)}` : 'N/A';

        const defaultEmailSubject = `Notificación de Mantenimiento - ${consorcio.nombre} - ${activo.nombre}`;
        const defaultEmailBody = `
Estimado/a Inquilino/a,

Le informamos que se ha realizado el mantenimiento del activo "${activo.nombre}" (Ubicación: ${activo.ubicacion}) en el consorcio "${consorcio.nombre}".
${activo.descripcion ? `Descripción del activo: ${activo.descripcion}` : ''}

Fecha de Mantenimiento: ${fechaFormateada}
Costo Asociado: ${costoFormateado}

Este costo se incluirá en sus próximas expensas. Para más detalles, por favor, revise el historial de gastos.

Atentamente,
La Administración del Consorcio "${consorcio.nombre}"
`;
        
        // Usar el contenido editado si está disponible, de lo contrario, usar el por defecto
        const finalEmailSubject = editedSubject || defaultEmailSubject;
        const finalEmailBody = editedBody || defaultEmailBody;

        console.log(`\n--- INICIANDO ENVÍO REAL DE CORREOS PARA CONSORCIO: ${consorcio.nombre} ---`);
        for (const inquilino of consorcio.inquilinos) {
            // Asegúrate de que el email del inquilino exista y sea válido
            if (!inquilino.email) {
                console.warn(`Inquilino ${inquilino.nombre} no tiene un email registrado. Saltando envío.`);
                continue; // Saltar a la siguiente iteración del bucle
            }

            const mailOptions = {
                from: process.env.EMAIL_USER, 
                to: inquilino.email,         
                subject: finalEmailSubject, 
                html: finalEmailBody        
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Correo enviado a: ${inquilino.email}`);
            } catch (mailError) {
                console.error(`Error al enviar correo a ${inquilino.email}:`, mailError.message);
                // Si el error es de autenticación, la conexión o credenciales del transporter
                // podrías considerar detener el proceso o loguearlo con más severidad.
            }
        }
        console.log(`--- FINALIZADO EL INTENTO DE ENVÍO DE CORREOS PARA ${consorcio.inquilinos.length} INQUILINOS ---`);

        res.status(200).json({ msg: 'Notificaciones de mantenimiento procesadas. Consulta la consola del servidor para ver el estado de envío de cada correo.' });

    } catch (err) {
        console.error('Error del servidor al procesar notificaciones:', err.message);
        res.status(500).send('Error del servidor al procesar notificaciones de correo.');
    }
});

module.exports = router;
