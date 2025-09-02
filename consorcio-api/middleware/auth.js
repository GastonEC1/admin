const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar el token JWT
module.exports = function (req, res, next) {
    // Obtener el token del encabezado 'Authorization'
    const authHeader = req.header('Authorization');

    // Verificar si no hay token en el encabezado
    if (!authHeader) {
        return res.status(401).json({ msg: 'No hay token, autorización denegada' });
    }

    // Separar "Bearer" del token real
    const token = authHeader.split(' ')[1];

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adjuntar el usuario al objeto de la solicitud
        req.user = decoded.user;
        next(); // Continuar con la siguiente función de la ruta
    } catch (err) {
        res.status(401).json({ msg: 'Token no válido' });
    }
};