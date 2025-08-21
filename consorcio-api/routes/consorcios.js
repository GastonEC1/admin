const express = require('express');
const router = express.Router();
const Consorcio = require('../models/consorcio');
const Inquilino = require('../models/inquilino');
const Activo = require('../models/activo');

// Obtener todos los consorcios
router.get('/', async (req, res) => {
    try {
        const consorcios = await Consorcio.find();
        res.json(consorcios);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error del servidor al obtener consorcios.' });
    }
});

// Obtener un consorcio por ID con sus inquilinos y activos populados
router.get('/:id', async (req, res) => {
    try {
        const consorcio = await Consorcio.findById(req.params.id)
            .populate('inquilinos') 
            .populate('activos');   

        if (!consorcio) {
            return res.status(404).json({ msg: 'Consorcio no encontrado' });
        }
        res.json(consorcio);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de consorcio no válido.' });
        }
        res.status(500).send('Error del servidor al obtener el consorcio.');
    }
});

// Crear un nuevo consorcio
router.post('/', async (req, res) => {
    // Campos actualizados, sin horarioPortero, fechaFundacion, gastosMensualesEstimados, fondoReserva
    const { nombre, direccion, pisos, unidades, nombrePortero, telefonoPortero, emailPortero } = req.body;
    try {
        const nuevoConsorcio = await Consorcio.create({
            nombre,
            direccion,
            pisos,
            unidades,
            nombrePortero, 
            telefonoPortero, 
            emailPortero 
            // fechaFundacion, gastosMensualesEstimados, fondoReserva ya no se incluyen
        });
        res.status(201).json(nuevoConsorcio);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al crear consorcio.');
    }
});

// Actualizar un consorcio por ID
router.put('/:id', async (req, res) => {
    // Campos actualizados, sin horarioPortero, fechaFundacion, gastosMensualesEstimados, fondoReserva
    const { nombre, direccion, pisos, unidades, nombrePortero, telefonoPortero, emailPortero } = req.body;
    try {
        let consorcio = await Consorcio.findById(req.params.id);
        if (!consorcio) {
            return res.status(404).json({ msg: 'Consorcio no encontrado para actualizar.' });
        }

        consorcio.nombre = nombre || consorcio.nombre;
        consorcio.direccion = direccion || consorcio.direccion;
        consorcio.pisos = pisos || consorcio.pisos;
        consorcio.unidades = unidades || consorcio.unidades;
        
        // Actualizar campos del portero
        consorcio.nombrePortero = nombrePortero;
        consorcio.telefonoPortero = telefonoPortero;
        consorcio.emailPortero = emailPortero;
        // horarioPortero ya no se actualiza

        // fechaFundacion, gastosMensualesEstimados, fondoReserva ya no se actualizan
        
        await consorcio.save();
        res.json(consorcio);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de consorcio no válido para actualización.' });
        }
        res.status(500).send('Error del servidor al actualizar consorcio.');
    }
});

// Eliminar un consorcio por ID
router.delete('/:id', async (req, res) => {
    try {
        const consorcio = await Consorcio.findById(req.params.id);

        if (!consorcio) {
            return res.status(404).json({ msg: 'Consorcio no encontrado para eliminar.' });
        }

        await Inquilino.deleteMany({ consorcio: req.params.id });
        await Activo.deleteMany({ consorcio: req.params.id });

        await Consorcio.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Consorcio y sus datos relacionados eliminados con éxito.' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de consorcio no válido para eliminación.' });
        }
        res.status(500).send('Error del servidor al eliminar consorcio.');
    }
});

module.exports = router;