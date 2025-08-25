const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // El email debe ser único para cada usuario
        lowercase: true, // Guardar el email en minúsculas
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    rol: { // Para futuros roles de usuario (administrador, portero, etc.)
        type: String,
        enum: ['admin', 'employee', 'owner'], // Ejemplos de roles
        default: 'admin' // Rol por defecto
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Añade `createdAt` y `updatedAt` automáticamente
});

module.exports = mongoose.model('User', UserSchema);
