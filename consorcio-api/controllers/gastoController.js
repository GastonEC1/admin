const Gasto = require('../models/gasto');
const Consorcio = require('../models/consorcio'); // Para verificar la existencia del consorcio

// @route   POST /api/gastos
// @desc    Registrar un nuevo gasto
// @access  Private
const crearGasto = async (req, res) => {
    const { consorcio, descripcion, monto, categoria, fechaGasto, periodoMes, periodoAnio, comprobanteUrl } = req.body;

    // Validar campos requeridos
    if (!consorcio || !descripcion || monto === undefined || !periodoMes || !periodoAnio) {
        return res.status(400).json({ msg: 'Por favor, incluye todos los campos requeridos: consorcio, descripción, monto, periodoMes, periodoAnio.' });
    }

    try {
        // Verificar que el consorcio exista
        const existeConsorcio = await Consorcio.findById(consorcio);
        if (!existeConsorcio) {
            return res.status(404).json({ msg: 'Consorcio no encontrado.' });
        }

        const nuevoGasto = new Gasto({
            consorcio,
            descripcion,
            monto: parseFloat(monto),
            categoria,
            fechaGasto: fechaGasto || Date.now(),
            periodoMes: parseInt(periodoMes),
            periodoAnio: parseInt(periodoAnio),
            comprobanteUrl
        });

        await nuevoGasto.save();
        res.status(201).json(nuevoGasto);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al registrar el gasto.');
    }
};

// @route   GET /api/gastos
// @desc    Obtener todos los gastos (con filtros opcionales)
// @access  Private
const obtenerGastos = async (req, res) => {
    const { consorcioId, periodoMes, periodoAnio, categoria } = req.query;

    try {
        let query = {};
        if (consorcioId) query.consorcio = consorcioId;
        if (periodoMes) query.periodoMes = parseInt(periodoMes);
        if (periodoAnio) query.periodoAnio = parseInt(periodoAnio);
        if (categoria) query.categoria = categoria;

        const gastos = await Gasto.find(query)
                                .populate('consorcio', 'nombre')
                                .sort({ fechaGasto: -1 }); // Ordenar por fecha del gasto descendente
        
        res.json(gastos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al obtener los gastos.');
    }
};

// @route   GET /api/gastos/:id
// @desc    Obtener un gasto por ID
// @access  Private
const obtenerGastoPorId = async (req, res) => {
    try {
        const gasto = await Gasto.findById(req.params.id).populate('consorcio', 'nombre');
        if (!gasto) {
            return res.status(404).json({ msg: 'Gasto no encontrado.' });
        }
        res.json(gasto);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de gasto no válido.' });
        }
        res.status(500).send('Error del servidor al obtener el gasto.');
    }
};

// @route   PUT /api/gastos/:id
// @desc    Actualizar un gasto
// @access  Private
const actualizarGasto = async (req, res) => {
    const { descripcion, monto, categoria, fechaGasto, periodoMes, periodoAnio, comprobanteUrl } = req.body;

    try {
        let gasto = await Gasto.findById(req.params.id);
        if (!gasto) {
            return res.status(404).json({ msg: 'Gasto no encontrado para actualizar.' });
        }

        // Actualizar campos
        gasto.descripcion = descripcion !== undefined ? descripcion : gasto.descripcion;
        gasto.monto = monto !== undefined ? parseFloat(monto) : gasto.monto;
        gasto.categoria = categoria !== undefined ? categoria : gasto.categoria;
        gasto.fechaGasto = fechaGasto !== undefined ? fechaGasto : gasto.fechaGasto;
        gasto.periodoMes = periodoMes !== undefined ? parseInt(periodoMes) : gasto.periodoMes;
        gasto.periodoAnio = periodoAnio !== undefined ? parseInt(periodoAnio) : gasto.periodoAnio;
        gasto.comprobanteUrl = comprobanteUrl !== undefined ? comprobanteUrl : gasto.comprobanteUrl;

        await gasto.save();
        res.json(gasto);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de gasto no válido para actualización.' });
        }
        res.status(500).send('Error del servidor al actualizar el gasto.');
    }
};

// @route   DELETE /api/gastos/:id
// @desc    Eliminar un gasto
// @access  Private
const eliminarGasto = async (req, res) => {
    try {
        const gasto = await Gasto.findByIdAndDelete(req.params.id);
        if (!gasto) {
            return res.status(404).json({ msg: 'Gasto no encontrado para eliminar.' });
        }
        res.json({ msg: 'Gasto eliminado con éxito.' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID de gasto no válido para eliminación.' });
        }
        res.status(500).send('Error del servidor al eliminar el gasto.');
    }
};

module.exports = {
    crearGasto,
    obtenerGastos,
    obtenerGastoPorId,
    actualizarGasto,
    eliminarGasto
};