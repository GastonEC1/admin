// Middleware para autorizar roles específicos
module.exports = function (roles = []) {
    // Si no se especifican roles, cualquiera puede acceder (o se asume que ya fue manejado por auth)
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // req.user viene del middleware 'auth' y contiene la información del usuario autenticado
        // Asegurarse de que el usuario esté autenticado antes de chequear el rol
        if (!req.user || !req.user.rol) {
            return res.status(401).json({ msg: 'No autorizado para esta acción (falta información de rol)' });
        }

        // Verificar si el rol del usuario está incluido en los roles permitidos
        if (roles.length && !roles.includes(req.user.rol)) {
            // Usuario no tiene el rol permitido
            return res.status(403).json({ msg: 'Acceso denegado: Se requiere un rol específico' });
        }

        // Si el usuario tiene el rol correcto, continuar
        next();
    };
};
