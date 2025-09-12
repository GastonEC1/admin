const express = require('express');
const router = express.Router();
const Activo = require('../models/activo');
const Consorcio = require('../models/consorcio');
const mongoose = require('mongoose'); // ¡Asegúrate de importar Mongoose!


// Obtener todos los activos, opcionalmente filtrados por consorcio
router.get('/', async (req, res) => {
    try {
        const { consorcioId } = req.query; 
        let query = {}; 
        if (consorcioId) {
            // Validación proactiva para el consorcioId del query
            if (!mongoose.Types.ObjectId.isValid(consorcioId)) {
                return res.status(400).json({ msg: 'ID de consorcio inválido' });
            }
            query.consorcio = consorcioId;
        }

        const activos = await Activo.find(query).populate('consorcio');
        res.json(activos);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error del servidor al obtener activos.' });
    }
});

// Obtener un activo por su ID
router.get('/:id', async (req, res) => {
    try {
        // **Nueva validación proactiva**
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'ID de activo no válido.' });
        }

        const activo = await Activo.findById(req.params.id).populate('consorcio');
        if (!activo) {
            return res.status(404).json({ msg: 'Activo no encontrado' });
        }
        res.json(activo);
    } catch (err) {
        console.error(err.message);
        // Si el error no es por 'ObjectId', es un error de servidor
        res.status(500).send('Error del servidor al obtener el activo.');
    }
});

// Crear un nuevo activo
router.post('/', async (req, res) => {
    const { nombre, tipo, marca, modelo, ubicacion, descripcion, fechaInstalacion, proximoMantenimiento, frecuenciaMantenimiento, estado, consorcio } = req.body;
    try {
        // Validar el ID del consorcio si se proporciona
        if (consorcio && !mongoose.Types.ObjectId.isValid(consorcio)) {
             return res.status(400).json({ msg: 'ID de consorcio no válido.' });
        }

        const nuevoActivo = await Activo.create({
            nombre,
            tipo,
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


// Actualizar un activo por su ID
router.put('/:id', async (req, res) => {
    const { nombre, tipo, marca, modelo, ubicacion, descripcion, fechaInstalacion, proximoMantenimiento, frecuenciaMantenimiento, estado, consorcio } = req.body;
    try {
        // **Nueva validación proactiva para el ID del activo**
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'ID de activo no válido para actualización.' });
        }
        // Validar el ID del consorcio si se proporciona
        if (consorcio && !mongoose.Types.ObjectId.isValid(consorcio)) {
             return res.status(400).json({ msg: 'ID de consorcio no válido para actualización.' });
        }

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
        activo.tipo = tipo || activo.tipo;
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
        res.status(500).send('Error del servidor al actualizar activo.');
    }
});

// Eliminar un activo por su ID
router.delete('/:id', async (req, res) => {
    try {
        // **Nueva validación proactiva**
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'ID de activo no válido para eliminación.' });
        }

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
        res.status(500).send('Error del servidor al eliminar activo.');
    }
});


router.post('/:id/mantenimiento', async (req, res) => {
    const { fecha, descripcion } = req.body;
    try {
        // 1. Validar el ID del activo
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'ID de activo no válido.' });
        }

        // 2. Buscar el activo por su ID
        const activo = await Activo.findById(req.params.id);
        if (!activo) {
            return res.status(404).json({ msg: 'Activo no encontrado.' });
        }

        // 3. Crear el nuevo objeto del historial
        const nuevaEntrada = {
            fecha,
            descripcion
        };

        // 4. Agregar la nueva entrada al array historialMantenimiento del activo
        activo.historialMantenimiento.push(nuevaEntrada);

        // 5. Guardar los cambios en la base de datos
        await activo.save();
        
        res.status(200).json(activo);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al agregar el historial.');
    }
});



module.exports = router;
