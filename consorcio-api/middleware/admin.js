module.exports = function (req, res, next) {
    // Si el usuario no tiene un rol o el rol no es 'admin', deniega el acceso
    if (!req.user || req.user.rol !== 'admin') {
        return res.status(403).json({ msg: 'Acceso denegado. Se requiere un rol de administrador.' });
    }

    // Si el usuario es un administrador, permite que la solicitud continúe
    next();
};