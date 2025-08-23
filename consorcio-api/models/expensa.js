const mongoose = require('mongoose');

const expensaSchema = new mongoose.Schema({
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
    periodoMes: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    periodoAnio: {
        type: Number,
        required: true,
        min: 2000
    },
    montoTotal: { // Monto total que el inquilino debe pagar por este período
        type: Number,
        required: true,
        min: 0
    },
    detallesGastos: [ // Desglose de los gastos que componen esta expensa
        {
            gastoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Gasto'
            },
            descripcion: String,
            montoProrrateado: Number // Cuánto de ese gasto específico le toca a este inquilino
        }
    ],
    fechaVencimiento: {
        type: Date,
        required: true
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Pagado', 'Vencido', 'Anulado'],
        default: 'Pendiente'
    },
    fechaPago: { // Fecha en que se registró el pago de esta expensa
        type: Date
    },
    comprobanteExpensaUrl: { // Opcional: URL a la expensa generada (ej. PDF)
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Índice único para asegurar que solo haya una expensa por inquilino, consorcio, mes y año
expensaSchema.index({ consorcio: 1, inquilino: 1, periodoMes: 1, periodoAnio: 1 }, { unique: true });

module.exports = mongoose.models.Expensa || mongoose.model('Expensa', expensaSchema);