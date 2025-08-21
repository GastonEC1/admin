// createAdmin.js

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

// Configura tu correo electrónico y la contraseña del administrador aquí
const adminEmail = 'admin@admin.com';
const adminPassword = 'admin123'; 

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Eliminar cualquier usuario existente con este correo electrónico
        await User.deleteMany({ email: adminEmail });
        console.log(`Usuario existente con email ${adminEmail} eliminado (si existía).`);
        
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Crear el documento de usuario
        const user = {
            email: adminEmail,
            password: hashedPassword
        };
        
        // Guardar el nuevo usuario en la base de datos
        await User.create(user);
        
        console.log('-------------------------------------------');
        console.log('¡Usuario administrador creado con éxito!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Contraseña: ${adminPassword}`);
        console.log('-------------------------------------------');
        
    } catch (err) {
        console.error('Error al crear el usuario administrador:', err);
    } finally {
        mongoose.disconnect();
    }
};

createAdminUser();