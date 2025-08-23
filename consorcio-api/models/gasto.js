const mongoose = require('mongoose');

const GastoSchema = new mongoose.Schema({
    consorcio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consorcio',
        required: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    monto: {
        type: Number,
        required: true,
        min: 0
    },
    categoria: {
        type: String,
        enum: ['Servicios', 'Mantenimiento', 'Sueldos', 'Impuestos', 'Administración', 'Otros'],
        default: 'Otros'
    },
    fechaGasto: {
        type: Date,
        required: true
    },
    periodoMes: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    periodoAnio: {
        type: Number,
        required: true,
        min: 2000 // Puedes ajustar esto según tus necesidades
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Gasto', GastoSchema);
