const User = require('../models/user');
const bcrypt = require('bcryptjs');

// 1. Obtener todos los usuarios (para que el administrador los vea)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// 2. Crear un nuevo usuario (desde el panel del administrador)
exports.createUser = async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }
        
        user = new User({ nombre, email, password, rol });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(201).json({ msg: 'Usuario creado exitosamente', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// 3. Editar un usuario
exports.editUser = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    // 💡 Paso Clave: Filtramos explícitamente los campos permitidos para la actualización.
    // Esto previene que se actualicen campos no deseados, como el rol.
    const updateData = {
        nombre,
        email
    };

    // Opcional: Si quieres permitir que un 'super_admin' cambie roles,
    // puedes añadir una condición aquí.
    if (req.user && req.user.rol === 'super_admin' && rol) {
        updateData.rol = rol;
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData, // Usamos el objeto filtrado
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json({ msg: 'Usuario actualizado exitosamente', user: updatedUser });

    } catch (err) {
        console.error('Error en userController.editUser:', err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Error del servidor');
    }
};

// 4. Eliminar un usuario
exports.deleteUser = async (req, res) => {
    try {
        const result = await User.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json({ msg: 'Usuario eliminado exitosamente' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.resetPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    try {
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Hashing de la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();
        res.json({ msg: 'Contraseña actualizada exitosamente' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};