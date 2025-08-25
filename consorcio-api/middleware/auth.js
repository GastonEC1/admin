const jwt = require('jsonwebtoken');
require('dotenv').config(); // Asegúrate de cargar las variables de entorno

// Middleware para verificar el token JWT
module.exports = function (req, res, next) {
    // Obtener el token del header
    const token = req.header('x-auth-token');

    // Verificar si no hay token
    if (!token) {
        return res.status(401).json({ msg: 'No hay token, autorización denegada' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adjuntar el usuario al objeto de solicitud
        req.user = decoded.user;
        next(); // Pasar al siguiente middleware o ruta
    } catch (err) {
        res.status(401).json({ msg: 'Token no válido' });
    }
};
