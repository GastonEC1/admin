const express = require('express');
const router = express.Router();
const Calendar = require('../models/calendar');

router.get('/', async(req,res)=>{
    try{
        const {consorcioId} = req.query;
        const query = consorcioId ? {consorcioId} : {};
        const events = await Calendar.find(query);
        res.json(events);
    }catch(err){
        res.status(500).json({error: 'Error al obtener eventos' });
    }
})

router.post('/', async(req,res)=>{
    try{
        const nuevoEvento = new Calendar(req.body);
        await nuevoEvento.save();
        res.status(201).json(nuevoEvento);
    }catch(err){
        res.status(500).json({error: 'Error al crear evento' });
    }
})

router.put('/:id', async(req,res)=>{
    try{
        const {id} = req.params;
        const eventoActualizado = await Calendar.findByIdAndUpdate(
        id,
        req.body,
        {new: true}
        )
        if(!eventoActualizado) return res.status(404).json({error: 'Evento no encontrado'});
        res.json(eventoActualizado);
    }catch(err){
        res.status(500).json({error: 'Error al actualizar evento'});
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const eventoEliminado = await Calendar.findByIdAndDelete(id);
        if (!eventoEliminado) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json({ mensaje: 'Evento eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar evento' });
    }
});



module.exports = router;

