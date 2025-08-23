const express = require('express');
const router = express.Router();
const {
    crearGasto,
    obtenerGastos,
    obtenerGastoPorId,
    actualizarGasto,
    eliminarGasto
} = require('../controllers/gastoController');
// const auth = require('../middleware/auth'); // Si usas autenticación

router.post('/', crearGasto);
router.get('/', obtenerGastos);
router.get('/:id', obtenerGastoPorId);
router.put('/:id', actualizarGasto);
router.delete('/:id', eliminarGasto);

module.exports = router;
