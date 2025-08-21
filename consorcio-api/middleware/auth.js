const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Obtener el token del encabezado (header) de la petición
    const token = req.header('x-auth-token');

    // Verificar si no hay un token
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Agregar el ID de usuario a la petición para su uso posterior
        req.user = decoded.id;
        
        // Pasar al siguiente middleware o a la ruta
        next();
    } catch (err) {
        // Si el token no es válido, enviar un error
        res.status(400).json({ message: 'Token no válido.' });
    }
};