const mongoose = require('mongoose');

const consorcioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    pisos: {
        type: Number,
        required: true
    },
    unidades: {
        type: Number,
        required: true
    },
    nombrePortero: {
        type: String
    },
    telefonoPortero: {
        type: String
    },
    emailPortero: {
        type: String
    },
    inquilinos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inquilino'
    }],
    activos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activo'
    }]
});

module.exports = mongoose.model('Consorcio', consorcioSchema);