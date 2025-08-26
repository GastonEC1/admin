const express = require('express');
const router = express.Router();
const Activo = require('../models/activo');
const Consorcio = require('../models/consorcio'); 

// Obtener todos los activos
router.get('/', async (req, res) => {
    try {
        const activos = await Activo.find().populate('consorcio');
        res.json(activos);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error del servidor al obtener activos.' });
    }
});

// Obtener un activo por ID
router.get('/:id', async (req, res) => {
    try {
        const activo = await Activo.findById(req.params.id).populate('consorcio');
        if (!activo) {
            return res.status(404).json({ msg: 'Activo no encontrado' });
        }
        res.json(activo);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de activo no válido.' });
        }
        res.status(500).send('Error del servidor al obtener el activo.');
    }
});

// Crear un nuevo activo
router.post('/', async (req, res) => {
    // Añadir los nuevos campos aquí
    const { nombre, marca, modelo, ubicacion, descripcion, fechaInstalacion, proximoMantenimiento, frecuenciaMantenimiento, estado, consorcio } = req.body;
    try {
        const nuevoActivo = await Activo.create({
            nombre,
            marca,
            modelo,
            ubicacion,
            descripcion, // Nuevo
            fechaInstalacion, // Nuevo
            proximoMantenimiento, // Nuevo
            frecuenciaMantenimiento, // Nuevo
            estado, // Nuevo
            consorcio
        });

        if (consorcio) {
            await Consorcio.findByIdAndUpdate(
                consorcio,
                { $push: { activos: nuevoActivo._id } },
                { new: true, useFindAndModify: false }
            );
        }

        res.status(201).json(nuevoActivo);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al crear activo.');
    }
});

// Actualizar un activo por ID
router.put('/:id', async (req, res) => {
    // Añadir los nuevos campos aquí
    const { nombre, marca, modelo, ubicacion, descripcion, fechaInstalacion, proximoMantenimiento, frecuenciaMantenimiento, estado, consorcio } = req.body;
    try {
        let activo = await Activo.findById(req.params.id);

        if (!activo) {
            return res.status(404).json({ msg: 'Activo no encontrado para actualizar.' });
        }

        // Si el consorcio del activo ha cambiado, actualizar relaciones en los consorcios
        if (consorcio && activo.consorcio && activo.consorcio.toString() !== consorcio) {
            await Consorcio.findByIdAndUpdate(activo.consorcio, { $pull: { activos: activo._id } });
            await Consorcio.findByIdAndUpdate(consorcio, { $push: { activos: activo._id } });
        } else if (!activo.consorcio && consorcio) {
             await Consorcio.findByIdAndUpdate(consorcio, { $push: { activos: activo._id } });
        }

        activo.nombre = nombre || activo.nombre;
        activo.marca = marca || activo.marca;
        activo.modelo = modelo || activo.modelo;
        activo.ubicacion = ubicacion || activo.ubicacion;
        activo.descripcion = descripcion; // Nuevo
        activo.fechaInstalacion = fechaInstalacion; // Nuevo
        activo.proximoMantenimiento = proximoMantenimiento; // Nuevo
        activo.frecuenciaMantenimiento = frecuenciaMantenimiento; // Nuevo
        activo.estado = estado; // Nuevo
        activo.consorcio = consorcio || activo.consorcio; 

        await activo.save();
        res.json(activo);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de activo o consorcio no válido para actualización.' });
        }
        res.status(500).send('Error del servidor al actualizar activo.');
    }
});

// Eliminar un activo por ID
router.delete('/:id', async (req, res) => {
    try {
        let activo = await Activo.findById(req.params.id);

        if (!activo) {
            return res.status(404).json({ msg: 'Activo no encontrado para eliminar.' });
        }

        const consorcioId = activo.consorcio;

        await Activo.findByIdAndDelete(req.params.id);

        if (consorcioId) {
            await Consorcio.findByIdAndUpdate(
                consorcioId,
                { $pull: { activos: req.params.id } },
                { new: true, useFindAndModify: false }
            );
        }

        res.json({ msg: 'Activo eliminado con éxito.' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de activo no válido para eliminación.' });
        }
        res.status(500).send('Error del servidor al eliminar activo.');
    }
});

module.exports = router;