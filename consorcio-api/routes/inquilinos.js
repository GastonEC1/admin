const express = require('express');
const router = express.Router();
const Inquilino = require('../models/inquilino');
const Consorcio = require('../models/consorcio'); // Necesario para actualizar el consorcio

// Obtener todos los inquilinos, con filtro opcional por consorcioId
router.get('/', async (req, res) => {
    try {
        const { consorcioId } = req.query; // Extraemos consorcioId de los parámetros de consulta

        let query = {}; // Objeto de consulta vacío por defecto

        // Si se proporciona consorcioId, añadimos la condición al objeto de consulta
        if (consorcioId) {
            query.consorcio = consorcioId; // Filtramos por el ID del consorcio
        }

        const inquilinos = await Inquilino.find(query).populate('consorcio');
        res.json(inquilinos);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error del servidor al obtener inquilinos.' });
    }
});

// Obtener un inquilino por ID (para la página de detalles/edición)
router.get('/:id', async (req, res) => {
    try {
        const inquilino = await Inquilino.findById(req.params.id).populate('consorcio');
        if (!inquilino) {
            return res.status(404).json({ msg: 'Inquilino no encontrado' });
        }
        res.json(inquilino);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de inquilino no válido.' });
        }
        res.status(500).send('Error del servidor al obtener el inquilino.');
    }
});

// Crear un nuevo inquilino
router.post('/', async (req, res) => {
    // Asegurarse de recibir el nuevo campo tipoUnidad
    const { nombre, email, telefono, unidad, tipoUnidad, consorcio } = req.body; 
    try {
        const nuevoInquilino = await Inquilino.create({
            nombre,
            email,
            telefono,
            unidad,
            tipoUnidad, // Incluimos el nuevo campo
            consorcio 
        });

        // Añadir el ID del inquilino al array de inquilinos del consorcio
        if (consorcio) {
            await Consorcio.findByIdAndUpdate(
                consorcio,
                { $push: { inquilinos: nuevoInquilino._id } },
                { new: true, useFindAndModify: false } 
            );
        }

        res.status(201).json(nuevoInquilino);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) { // Error de email duplicado
            return res.status(400).json({ msg: 'El email ya está registrado para otro inquilino.' });
        }
        res.status(500).send('Error del servidor al crear inquilino.');
    }
});

// Actualizar un inquilino por ID
router.put('/:id', async (req, res) => {
    const { nombre, email, telefono, unidad, tipoUnidad, consorcio } = req.body; 
    try {
        let inquilino = await Inquilino.findById(req.params.id);

        if (!inquilino) {
            return res.status(404).json({ msg: 'Inquilino no encontrado para actualizar' });
        }

        // Si el consorcio del inquilino ha cambiado, necesitamos actualizar ambos consorcios
        if (consorcio && inquilino.consorcio && inquilino.consorcio.toString() !== consorcio) {
            // 1. Eliminar el inquilino del consorcio antiguo
            await Consorcio.findByIdAndUpdate(
                inquilino.consorcio,
                { $pull: { inquilinos: inquilino._id } },
                { new: true, useFindAndModify: false }
            );
            // 2. Añadir el inquilino al nuevo consorcio
            await Consorcio.findByIdAndUpdate(
                consorcio,
                { $push: { inquilinos: inquilino._id } },
                { new: true, useFindAndModify: false }
            );
        } else if (!inquilino.consorcio && consorcio) { // Si antes no tenía consorcio y ahora sí
             await Consorcio.findByIdAndUpdate(
                consorcio,
                { $push: { inquilinos: inquilino._id } },
                { new: true, useFindAndModify: false }
            );
        }

        // Actualizar los datos del inquilino
        inquilino.nombre = nombre;
        inquilino.email = email;
        inquilino.telefono = telefono;
        inquilino.unidad = unidad;
        inquilino.tipoUnidad = tipoUnidad; // Actualizar nuevo campo
        inquilino.consorcio = consorcio; 

        await inquilino.save(); 

        res.json(inquilino);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) { // Error de email duplicado
            return res.status(400).json({ msg: 'El email ya está registrado para otro inquilino.' });
        }
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de inquilino o consorcio no válido para actualización.' });
        }
        res.status(500).send('Error del servidor al actualizar inquilino.');
    }
});

// Eliminar un inquilino por ID
router.delete('/:id', async (req, res) => {
    try {
        let inquilino = await Inquilino.findById(req.params.id);

        if (!inquilino) {
            return res.status(404).json({ msg: 'Inquilino no encontrado para eliminar' });
        }

        const consorcioId = inquilino.consorcio; 

        await Inquilino.findByIdAndDelete(req.params.id);

        // Eliminar el ID del inquilino del array de inquilinos de su consorcio
        if (consorcioId) {
            await Consorcio.findByIdAndUpdate(
                consorcioId,
                { $pull: { inquilinos: req.params.id } }, 
                { new: true, useFindAndModify: false }
            );
        }

        res.json({ msg: 'Inquilino eliminado con éxito' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de inquilino no válido para eliminación.' });
        }
        res.status(500).send('Error del servidor al eliminar inquilino.');
    }
});


module.exports = router;