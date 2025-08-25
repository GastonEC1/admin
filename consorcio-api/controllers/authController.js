const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

// @route   POST /api/auth/register
// @desc    Registrar un nuevo usuario
// @access  Public
exports.registerUser = async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    try {
        // 1. Verificar si el usuario ya existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe con este correo electrónico' });
        }

        // 2. Crear una nueva instancia de usuario
        user = new User({
            nombre,
            email,
            password,
            rol: rol || 'admin'
        });

        // 3. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. Guardar el usuario en la base de datos
        await user.save();

        // 5. Generar y devolver un token JWT
        const payload = {
            user: {
                id: user.id,
                rol: user.rol
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, msg: 'Usuario registrado con éxito' });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al registrar usuario');
    }
};

// @route   POST /api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Verificar si el usuario existe
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        // 2. Comparar la contraseña ingresada con la contraseña hasheada en la BD
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        // 3. Generar y devolver un token JWT
        const payload = {
            user: {
                id: user.id,
                rol: user.rol,
                nombre: user.nombre
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, msg: 'Inicio de sesión exitoso', userName: user.nombre });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al iniciar sesión');
    }
};

// @route   GET /api/auth/me
// @desc    Obtener información del usuario autenticado (protegida por middleware)
// @access  Private
exports.getAuthenticatedUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al obtener usuario autenticado');
    }
};