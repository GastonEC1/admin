const express = require('express');
const router = express.Router();
const {
    generarExpensas,
    obtenerExpensas,
    obtenerExpensaPorId,
    marcarExpensaComoPagada
} = require('../controllers/expensaController');
// const auth = require('../middleware/auth'); // Si usas autenticación

router.post('/generar', generarExpensas);
router.get('/', obtenerExpensas);
router.get('/:id', obtenerExpensaPorId);
router.put('/:id/pagar', marcarExpensaComoPagada);

module.exports = router;
