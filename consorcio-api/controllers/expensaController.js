const Expensa = require('../models/expensa');
const Gasto = require('../models/gasto');
const Consorcio = require('../models/consorcio');
const Inquilino = require('../models/inquilino');

// Helper para obtener el nombre del mes
const getMonthName = (monthNumber) => {
    const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return nombresMeses[monthNumber - 1];
};

// @route   POST /api/expensas/generar
// @desc    Generar expensas para un consorcio y período dado
// @access  Private
const generarExpensas = async (req, res) => {
    const { consorcioId, periodoMes, periodoAnio } = req.body;

    if (!consorcioId || !periodoMes || !periodoAnio) {
        return res.status(400).json({ msg: 'Se requieren el ID del consorcio, el mes y el año para generar expensas.' });
    }

    try {
        // 1. Verificar si el consorcio existe
        const consorcio = await Consorcio.findById(consorcioId);
        if (!consorcio) {
            return res.status(404).json({ msg: 'Consorcio no encontrado.' });
        }

        // 2. Obtener todos los inquilinos del consorcio
        const inquilinos = await Inquilino.find({ consorcio: consorcioId });
        if (inquilinos.length === 0) {
            return res.status(400).json({ msg: 'No hay inquilinos registrados para este consorcio. No se pueden generar expensas.' });
        }

        // 3. Obtener todos los gastos del consorcio para el período
        const gastosDelPeriodo = await Gasto.find({
            consorcio: consorcioId,
            periodoMes: periodoMes,
            periodoAnio: periodoAnio
        });

        if (gastosDelPeriodo.length === 0) {
            return res.status(400).json({ msg: `No se encontraron gastos para el período ${getMonthName(periodoMes)} de ${periodoAnio}. No se pueden generar expensas.` });
        }

        const totalGastosDelPeriodo = gastosDelPeriodo.reduce((acc, gasto) => acc + gasto.monto, 0);
        const numeroUnidades = inquilinos.length; // Suponemos que cada inquilino representa una unidad por ahora

        // Calcular la fecha de vencimiento (ej. 10 días después de la generación)
        const fechaVencimiento = new Date(periodoAnio, periodoMes - 1, 1); // Primer día del mes
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 10); // +10 días de gracia

        const expensasGeneradas = [];

        // 4. Generar una expensa por cada inquilino
        for (const inquilino of inquilinos) {
            // Verificar si ya existe una expensa para este inquilino en este período
            const existingExpensa = await Expensa.findOne({
                consorcio: consorcioId,
                inquilino: inquilino._id,
                periodoMes: periodoMes,
                periodoAnio: periodoAnio
            });

            if (existingExpensa) {
                console.log(`Expensa ya existe para el inquilino ${inquilino.nombre} en ${getMonthName(periodoMes)} ${periodoAnio}. Saltando.`);
                // Se podría actualizar en lugar de saltar si se quiere esta lógica
                continue; 
            }

            let montoTotalInquilino = 0;
            const detallesGastosInquilino = [];

            // Lógica de prorrateo: por ahora, simple división equitativa
            const montoPorUnidad = totalGastosDelPeriodo / numeroUnidades;

            // Se podría refinar el prorrateo aquí (por unidad funcional, m2, etc.)
            // Por simplicidad, todos los gastos se prorratean de forma equitativa.
            gastosDelPeriodo.forEach(gasto => {
                const montoProrrateado = gasto.monto / numeroUnidades; // Cada inquilino paga una parte igual de cada gasto
                detallesGastosInquilino.push({
                    gastoId: gasto._id,
                    descripcion: gasto.descripcion,
                    montoProrrateado: montoProrrateado
                });
                montoTotalInquilino += montoProrrateado;
            });

            const nuevaExpensa = new Expensa({
                consorcio: consorcioId,
                inquilino: inquilino._id,
                periodoMes: periodoMes,
                periodoAnio: periodoAnio,
                montoTotal: montoTotalInquilino,
                detallesGastos: detallesGastosInquilino,
                fechaVencimiento: fechaVencimiento,
                estado: 'Pendiente'
            });

            await nuevaExpensa.save();
            expensasGeneradas.push(nuevaExpensa);
        }

        res.status(201).json({ msg: `Expensas generadas con éxito para ${expensasGeneradas.length} inquilinos.`, expensas: expensasGeneradas });

    } catch (err) {
        console.error('Error al generar expensas:', err.message);
        res.status(500).send('Error del servidor al generar las expensas.');
    }
};

// @route   GET /api/expensas
// @desc    Obtener expensas (con filtros opcionales)
// @access  Private
const obtenerExpensas = async (req, res) => {
    const { consorcioId, inquilinoId, periodoMes, periodoAnio, estado } = req.query;

    try {
        let query = {};
        if (consorcioId) query.consorcio = consorcioId;
        if (inquilinoId) query.inquilino = inquilinoId;
        if (periodoMes) query.periodoMes = parseInt(periodoMes);
        if (periodoAnio) query.periodoAnio = parseInt(periodoAnio);
        if (estado) query.estado = estado;

        const expensas = await Expensa.find(query)
                                    .populate('consorcio', 'nombre direccion')
                                    .populate('inquilino', 'nombre unidad email')
                                    .sort({ periodoAnio: -1, periodoMes: -1, 'inquilino.nombre': 1 });
        
        res.json(expensas);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al obtener las expensas.');
    }
};

// @route   GET /api/expensas/:id
// @desc    Obtener una expensa por ID
// @access  Private
const obtenerExpensaPorId = async (req, res) => {
    try {
        const expensa = await Expensa.findById(req.params.id)
                                    .populate('consorcio', 'nombre direccion')
                                    .populate('inquilino', 'nombre unidad email')
                                    .populate('detallesGastos.gastoId', 'descripcion monto categoria'); // Popula los detalles del gasto

        if (!expensa) {
            return res.status(404).json({ msg: 'Expensa no encontrada.' });
        }
        res.json(expensa);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de expensa no válido.' });
        }
        res.status(500).send('Error del servidor al obtener la expensa.');
    }
};

// @route   PUT /api/expensas/:id/pagar
// @desc    Marcar una expensa como pagada
// @access  Private
const marcarExpensaComoPagada = async (req, res) => {
    try {
        let expensa = await Expensa.findById(req.params.id);
        if (!expensa) {
            return res.status(404).json({ msg: 'Expensa no encontrada.' });
        }

        if (expensa.estado === 'Pagado') {
            return res.status(400).json({ msg: 'Esta expensa ya está marcada como pagada.' });
        }

        expensa.estado = 'Pagado';
        expensa.fechaPago = Date.now(); // Registrar la fecha de pago
        await expensa.save();
        res.json(expensa);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de expensa no válido.' });
        }
        res.status(500).send('Error del servidor al marcar la expensa como pagada.');
    }
};

module.exports = {
    generarExpensas,
    obtenerExpensas,
    obtenerExpensaPorId,
    marcarExpensaComoPagada
};