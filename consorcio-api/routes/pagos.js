const express = require('express');
const router = express.Router();
const Pago = require('../models/pago');
const Consorcio = require('../models/consorcio');
const Inquilino = require('../models/inquilino');

// Middleware de autenticación si tienes uno (no incluido por defecto aquí, pero recomendado)
// const auth = require('../middleware/auth'); 

// @route   POST /api/pagos
// @desc    Registrar un nuevo pago
// @access  Private (asumiendo que hay auth)
router.post('/', async (req, res) => {
    const { consorcio, inquilino, monto, fechaPago, periodo, descripcion } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!consorcio || !inquilino || !monto || !periodo) {
        return res.status(400).json({ msg: 'Por favor, incluye todos los campos requeridos: consorcio, inquilino, monto, periodo.' });
    }

    try {
        // Verificar que el consorcio y el inquilino existan
        const existeConsorcio = await Consorcio.findById(consorcio);
        if (!existeConsorcio) {
            return res.status(404).json({ msg: 'Consorcio no encontrado.' });
        }

        const existeInquilino = await Inquilino.findById(inquilino);
        if (!existeInquilino) {
            return res.status(404).json({ msg: 'Inquilino no encontrado.' });
        }

        const nuevoPago = new Pago({
            consorcio,
            inquilino,
            monto,
            fechaPago: fechaPago || Date.now(), // Usa la fecha proporcionada o la actual
            periodo,
            descripcion
        });

        await nuevoPago.save();
        res.status(201).json(nuevoPago);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al registrar el pago.');
    }
});

// @route   GET /api/pagos
// @desc    Obtener todos los pagos (opcionalmente filtrado por consorcio o inquilino)
// @access  Private (asumiendo que hay auth)
router.get('/', async (req, res) => {
    const { consorcioId, inquilinoId } = req.query; // Permite filtrar por query parameters

    try {
        let query = {};
        if (consorcioId) {
            query.consorcio = consorcioId;
        }
        if (inquilinoId) {
            query.inquilino = inquilinoId;
        }

        const pagos = await Pago.find(query)
                                .populate('consorcio', 'nombre direccion') // Popula solo nombre y direccion del consorcio
                                .populate('inquilino', 'nombre email unidad'); // Popula solo nombre, email y unidad del inquilino
        
        res.json(pagos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al obtener los pagos.');
    }
});

// @route   GET /api/pagos/:id
// @desc    Obtener un pago por ID
// @access  Private (asumiendo que hay auth)
router.get('/:id', async (req, res) => {
    try {
        const pago = await Pago.findById(req.params.id)
                                .populate('consorcio', 'nombre direccion')
                                .populate('inquilino', 'nombre email unidad');

        if (!pago) {
            return res.status(404).json({ msg: 'Pago no encontrado.' });
        }
        res.json(pago);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de pago no válido.' });
        }
        res.status(500).send('Error del servidor al obtener el pago.');
    }
});


// Más rutas (PUT, DELETE) se pueden añadir aquí si es necesario más adelante.

module.exports = router;