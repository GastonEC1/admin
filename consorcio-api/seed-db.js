const mongoose = require('mongoose');
require('dotenv').config();

// Importar Modelos
const Consorcio = require('./models/consorcio');
const Inquilino = require('./models/inquilino');
const Activo = require('./models/activo');

async function seedDatabase() {
  try {
    // Conexión a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a la base de datos de MongoDB');

    // Limpiar las colecciones existentes
    await Consorcio.deleteMany({});
    await Inquilino.deleteMany({});
    await Activo.deleteMany({});
    console.log('Colecciones limpiadas.');

    // 1. Crear Consorcios
    const consorcio1 = await Consorcio.create({
      nombre: 'Edificio Los Laureles',
      direccion: 'Av. Corrientes 1234',
      pisos: 10,
      unidades: 20
    });
    const consorcio2 = await Consorcio.create({
      nombre: 'Residencia El Sol',
      direccion: 'Calle Falsa 123',
      pisos: 5,
      unidades: 15
    });

    // 2. Crear Inquilinos y Activos, vinculándolos a un Consorcio
    const inquilino1 = await Inquilino.create({
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
      telefono: '1111-2222',
      unidad: '3B',
      consorcio: consorcio1._id
    });
    const inquilino2 = await Inquilino.create({
      nombre: 'María Gómez',
      email: 'maria.gomez@example.com',
      telefono: '3333-4444',
      unidad: '2A',
      consorcio: consorcio2._id
    });

    const activo1 = await Activo.create({
      nombre: 'Ascensor',
      marca: 'Otis',
      modelo: '3000',
      ubicacion: 'Hall principal',
      consorcio: consorcio1._id
    });
    const activo2 = await Activo.create({
      nombre: 'Extintor',
      marca: 'ABC',
      modelo: '10Kg',
      ubicacion: 'Piso 5',
      consorcio: consorcio2._id
    });

    // 3. Actualizar los Consorcios con los IDs de los Inquilinos y Activos
    await Consorcio.findByIdAndUpdate(consorcio1._id, {
      $push: { inquilinos: inquilino1._id, activos: activo1._id }
    });
    await Consorcio.findByIdAndUpdate(consorcio2._id, {
      $push: { inquilinos: inquilino2._id, activos: activo2._id }
    });

    console.log('Datos de prueba creados exitosamente.');

  } catch (err) {
    console.error('Error al ejecutar el script de carga de datos:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();