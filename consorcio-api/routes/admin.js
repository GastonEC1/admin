const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Todas las rutas que siguen están protegidas.
router.use(authMiddleware, adminMiddleware);

router.get('/users', userController.getAllUsers); // Para ver la lista de usuarios
router.post('/users', userController.createUser); // Para crear un usuario
router.put('/users/:id', userController.editUser); // Para editar un usuario por su ID
router.delete('/users/:id', userController.deleteUser); // Para eliminar un usuario por su ID
router.put('/users/:id/password-reset',userController.resetPassword); // Para resetear la contraseña de un usuario por su ID

module.exports = router;