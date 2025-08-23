const express = require('express');
const router = express.Router();
const Consorcio = require('../models/consorcio');
const Activo = require('../models/activo');
const Inquilino = require('../models/inquilino'); // Importar Inquilino para obtener su email
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Ruta POST genérica para enviar correos HTML
// Este endpoint ahora es más flexible y puede ser usado para cualquier tipo de correo.
// Recibe: recipientEmail, subject, htmlBody (opcionalmente consorcioId, activoId, pagoId para contexto/logs)
router.post('/send-custom-html-email', async (req, res) => {
    const { recipientEmail, subject, htmlBody, consorcioId, activoId, pagoId } = req.body; // Añade context IDs

    if (!recipientEmail || !subject || !htmlBody) {
        return res.status(400).json({ msg: 'Por favor, proporciona el email del destinatario, el asunto y el cuerpo HTML del correo.' });
    }

    try {
        console.log(`\n--- INICIANDO ENVÍO DE CORREO A: ${recipientEmail} ---`);
        console.log(`Asunto: ${subject}`);
        // console.log(`Cuerpo HTML: ${htmlBody.substring(0, 200)}...`); // Loguear una parte para no saturar

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: subject,
            html: htmlBody
        };

        await transporter.sendMail(mailOptions);
        console.log(`Correo enviado con éxito a: ${recipientEmail}`);
        res.status(200).json({ msg: 'Correo enviado con éxito.' });

    } catch (mailError) {
        console.error(`Error al enviar correo a ${recipientEmail}:`, mailError.message);
        res.status(500).json({ msg: `Error al enviar correo: ${mailError.message}` });
    }
});


// Ruta POST para enviar correos de notificación de mantenimiento (ahora usa la ruta genérica)
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

        const fechaFormateada = fechaMantenimiento ? new Date(fechaMantenimiento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        const costoFormateado = costoMantenimiento ? `$${parseFloat(costoMantenimiento).toFixed(2)}` : 'N/A';

        const defaultEmailSubject = `Notificación de Mantenimiento - ${consorcio.nombre} - ${activo.nombre}`;
        const defaultEmailBody = `
            <p>Estimado/a Inquilino/a,</p>
            <p>Le informamos que se ha realizado el mantenimiento del activo "<strong>${activo.nombre}</strong>" (Ubicación: ${activo.ubicacion}) en el consorcio "<strong>${consorcio.nombre}</strong>".</p>
            ${activo.descripcion ? `<p>Descripción del activo: ${activo.descripcion}</p>` : ''}
            <p>Fecha de Mantenimiento: <strong>${fechaFormateada}</strong></p>
            <p>Costo Asociado: <strong>${costoFormateado}</strong></p>
            <p>Este costo se incluirá en sus próximas expensas. Para más detalles, por favor, revise el historial de gastos.</p>
            <p>Atentamente,<br/>La Administración del Consorcio "<strong>${consorcio.nombre}</strong>"</p>
        `;

        const finalEmailSubject = editedSubject || defaultEmailSubject;
        const finalEmailBody = editedBody || defaultEmailBody; // El frontend ya envía HTML, así que este ya es HTML

        console.log(`\n--- INICIANDO ENVÍO DE CORREOS DE MANTENIMIENTO PARA CONSORCIO: ${consorcio.nombre} ---`);
        for (const inquilino of consorcio.inquilinos) {
            if (!inquilino.email) {
                console.warn(`Inquilino ${inquilino.nombre} no tiene un email registrado. Saltando envío de mantenimiento.`);
                continue;
            }

            // Llama a la nueva ruta genérica para enviar el correo
            // No hacemos la llamada HTTP aquí, sino que reutilizamos la lógica de Nodemailer
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: inquilino.email,
                    subject: finalEmailSubject,
                    html: finalEmailBody
                };
                await transporter.sendMail(mailOptions);
                console.log(`Correo de mantenimiento enviado a: ${inquilino.email}`);
            } catch (mailError) {
                console.error(`Error al enviar correo de mantenimiento a ${inquilino.email}:`, mailError.message);
            }
        }
        console.log(`--- FINALIZADO EL INTENTO DE ENVÍO DE CORREOS DE MANTENIMIENTO PARA ${consorcio.inquilinos.length} INQUILINOS ---`);

        res.status(200).json({ msg: 'Notificaciones de mantenimiento procesadas. Consulta la consola del servidor para ver el estado de envío de cada correo.' });

    } catch (err) {
        console.error('Error del servidor al procesar notificaciones de mantenimiento:', err.message);
        res.status(500).send('Error del servidor al procesar notificaciones de mantenimiento de correo.');
    }
});

module.exports = router;