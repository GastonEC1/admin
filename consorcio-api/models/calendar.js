const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    fecha:{type: Date, required: true},
    descripcion: {type: String, required: true},
    tipo: {type: String, enum: ['mantenimiento', 'evento','asamblea'], required: true},
    consorcioId: {type: mongoose.Schema.Types.ObjectId, ref: 'Consorcio', required: true}
    
});

module.exports = mongoose.model('Calendar', calendarSchema);