const express = require('express');
const router = express.Router();
const Consorcio = require('../models/consorcio'); // Necesario para obtener inquilinos
const Activo = require('../models/activo');       // Necesario para obtener detalles del activo

// Ruta POST para simular el envío de correos de notificación de mantenimiento
router.post('/send-maintenance-notification', async (req, res) => {
    const { consorcioId, activoId, costoMantenimiento, fechaMantenimiento } = req.body;

    if (!consorcioId || !activoId) {
        return res.status(400).json({ msg: 'Faltan parámetros consorcioId o activoId.' });
    }

    try {
        // Obtener el consorcio y sus inquilinos
        const consorcio = await Consorcio.findById(consorcioId).populate('inquilinos');
        if (!consorcio) {
            return res.status(404).json({ msg: 'Consorcio no encontrado.' });
        }

        // Obtener el activo para sus detalles (nombre, descripción)
        const activo = await Activo.findById(activoId);
        if (!activo) {
            return res.status(404).json({ msg: 'Activo no encontrado.' });
        }

        if (!consorcio.inquilinos || consorcio.inquilinos.length === 0) {
            return res.status(400).json({ msg: 'El consorcio no tiene inquilinos registrados para enviar notificaciones.' });
        }

        // Formatear la fecha para el correo
        const fechaFormateada = fechaMantenimiento ? new Date(fechaMantenimiento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        const costoFormateado = costoMantenimiento ? `$${costoMantenimiento.toFixed(2)}` : 'N/A';

        // Simular envío de correo a cada inquilino
        console.log(`\n--- SIMULACIÓN DE ENVÍO DE CORREOS PARA CONSORCIO: ${consorcio.nombre} ---`);
        for (const inquilino of consorcio.inquilinos) {
            const emailSubject = `Notificación de Mantenimiento - ${consorcio.nombre} - ${activo.nombre}`;
            const emailBody = `
Estimado/a ${inquilino.nombre},

Le informamos que se ha realizado el mantenimiento del activo "${activo.nombre}" (Ubicación: ${activo.ubicacion}) en el consorcio "${consorcio.nombre}".
${activo.descripcion ? `Descripción del activo: ${activo.descripcion}` : ''}

Fecha de Mantenimiento: ${fechaFormateada}
Costo Asociado: ${costoFormateado}

Este costo se incluirá en sus próximas expensas. Para más detalles, por favor, revise el historial de gastos.

Atentamente,
La Administración del Consorcio "${consorcio.nombre}"
`;

            console.log(`
--------------------------------------------------
A: ${inquilino.email} (${inquilino.nombre})
Asunto: ${emailSubject}
Cuerpo del Correo:
${emailBody}
--------------------------------------------------
`);
        }
        console.log(`--- FIN DE LA SIMULACIÓN PARA ${consorcio.inquilinos.length} INQUILINOS ---`);

        res.status(200).json({ msg: 'Simulación de correos de notificación enviada con éxito. Consulta la consola del servidor para ver los detalles.' });

    } catch (err) {
        console.error('Error al simular el envío de correos:', err.message);
        res.status(500).send('Error del servidor al simular el envío de correos.');
    }
});

module.exports = router;