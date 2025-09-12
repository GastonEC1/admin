const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// @route   POST /api/auth/register
// @desc    Registrar un nuevo usuario
// @access  Public
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post('/login', authController.loginUser);

// @route   GET /api/auth/me
// @desc    Obtener información del usuario autenticado
// @access  Private (protegido por el middleware de autenticación)
router.get('/me', authMiddleware, authController.getAuthenticatedUser); // ✨ Usamos 'authMiddleware' aquí

router.get('/login-history',authMiddleware, authController.getLoginHistory);
module.exports = router;
