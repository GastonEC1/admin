// createAdmin.js

const bcrypt = require('bcryptjs'); // Asegúrate de usar 'bcryptjs' si es lo que tienes instalado
const mongoose = require('mongoose');
const User = require('./models/user'); // Importa tu modelo User. Asegúrate de que la ruta sea correcta.
require('dotenv').config();

// Configura tu correo electrónico, contraseña, nombre y rol del administrador aquí
const adminEmail = 'admin@admin.com';
const adminPassword = 'admin123'; 
const adminName = 'Administrador Principal'; // ✨ ¡Este campo es el que faltaba en tu error!
const adminRole = 'admin';                 // Asegúrate de que este rol exista en tu aplicación

const createAdminUser = async () => {
    try {
        // Conexión a la base de datos
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a la base de datos de MongoDB para crear admin.');

        // Eliminar cualquier usuario existente con este correo electrónico para evitar duplicados
        await User.deleteMany({ email: adminEmail });
        console.log(`Usuario existente con email ${adminEmail} eliminado (si existía).`);
        
        // Hashear la contraseña antes de guardarla por seguridad
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Crear el documento de usuario con todos los campos requeridos por tu modelo User
        const user = {
            nombre: adminName,  // ✨ ¡Ahora con el campo 'nombre'!
            email: adminEmail,
            password: hashedPassword,
            rol: adminRole      // Incluido el rol
            // Si tienes otros campos requeridos en tu modelo User (como 'fechaRegistro'), agrégalos aquí.
            // Por ejemplo: fechaRegistro: new Date()
        };
        
        // Guardar el nuevo usuario en la base de datos
        await User.create(user);
        
        console.log('-------------------------------------------');
        console.log('¡Usuario administrador creado con éxito!');
        console.log(`Nombre: ${adminName}`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Contraseña: ${adminPassword}`); // Nota: esto es solo para referencia en la consola, no la contraseña real guardada
        console.log(`Rol: ${adminRole}`);
        console.log('-------------------------------------------');
        
    } catch (err) {
        console.error('Error al crear el usuario administrador:', err.message);
    } finally {
        // Desconectar de la base de datos
        mongoose.disconnect();
        console.log('Desconectado de la base de datos.');
    }
};

// Ejecutar la función para crear el usuario
createAdminUser();
