const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
    consorcio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consorcio',
        required: true
    },
    inquilino: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inquilino',
        required: true
    },
    monto: {
        type: Number,
        required: true,
        min: 0 // El monto no puede ser negativo
    },
    fechaPago: {
        type: Date,
        default: Date.now, // Por defecto, la fecha actual al crear el pago
        required: true
    },
    periodo: {
        type: String,
        required: true, // Ej: "Expensas Noviembre 2025"
        trim: true
    },
    descripcion: {
        type: String,
        trim: true // Descripción opcional para detalles adicionales
    }
}, {
    timestamps: true // Añade campos `createdAt` y `updatedAt` automáticamente
});

// Evita el error OverwriteModelError en entornos de desarrollo con hot-reloading
module.exports = mongoose.models.Pago || mongoose.model('Pago', pagoSchema);
