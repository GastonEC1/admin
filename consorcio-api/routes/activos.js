const express = require('express');
const router = express.Router();
const Activo = require('../models/activo');
const Consorcio = require('../models/consorcio'); 


router.get('/', async (req, res) => {
    try {
        const { consorcioId } = req.query; 
        let query = {}; 
        if (consorcioId) {
            query.consorcio = consorcioId;
        }

        const activos = await Activo.find(query).populate('consorcio');
        res.json(activos);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error del servidor al obtener activos.' });
    }
});

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

router.post('/', async (req, res) => {
    const { nombre, marca, modelo, ubicacion, descripcion, fechaInstalacion, proximoMantenimiento, frecuenciaMantenimiento, estado, consorcio } = req.body;
    try {
        const nuevoActivo = await Activo.create({
            nombre,
            marca,
            modelo,
            ubicacion,
            descripcion, 
            fechaInstalacion, 
            proximoMantenimiento, 
            frecuenciaMantenimiento, 
            estado, 
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


router.put('/:id', async (req, res) => {

    const { nombre, marca, modelo, ubicacion, descripcion, fechaInstalacion, proximoMantenimiento, frecuenciaMantenimiento, estado, consorcio } = req.body;
    try {
        let activo = await Activo.findById(req.params.id);

        if (!activo) {
            return res.status(404).json({ msg: 'Activo no encontrado para actualizar.' });
        }

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
        activo.descripcion = descripcion; 
        activo.fechaInstalacion = fechaInstalacion; 
        activo.proximoMantenimiento = proximoMantenimiento; 
        activo.frecuenciaMantenimiento = frecuenciaMantenimiento;
        activo.estado = estado; 
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