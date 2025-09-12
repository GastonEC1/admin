const mongoose = require('mongoose');

const inquilinoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true // Asegura que no haya emails duplicados
    },
    telefono: {
        type: String
    },
    unidad: {
        type: String,
        required: true
    },
    tipoUnidad: { // Nuevo campo: Tipo de Unidad
        type: String,
        enum: ['Departamento', 'Oficina', 'Local', 'Otro'], // Puedes ajustar estos valores
        default: 'Departamento'
    },
    consorcio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consorcio',
        required: true // Un inquilino siempre debe pertenecer a un consorcio
    }
});

module.exports = mongoose.model('Inquilino', inquilinoSchema);
