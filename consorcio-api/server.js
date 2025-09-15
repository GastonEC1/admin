const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a la base de datos de MongoDB');
  })
  .catch(err => console.error('Error al conectar con la base de datos:', err));

// Rutas de la API
const consorciosRouter = require('./routes/consorcios');
const inquilinosRouter = require('./routes/inquilinos');
const activosRouter = require('./routes/activos');
const authRouter = require('./routes/auth');
const emailRouter = require('./routes/email');
const calendarsRouter = require('./routes/calendars');
const adminRouter = require('./routes/admin');

app.use('/api/consorcios', consorciosRouter);
app.use('/api/inquilinos', inquilinosRouter);
app.use('/api/activos', activosRouter);
app.use('/api/auth', authRouter);
app.use('/api/email', emailRouter);
app.use('/api/calendars', calendarsRouter);
app.use('/api/admin', adminRouter);

// Configuración para servir la aplicación de React
// Sirve los archivos estáticos de la aplicación de React desde la carpeta 'build'
app.use(express.static(path.join(__dirname, 'build')));

// Ruta "catch-all" para servir el index.html en cualquier otra petición
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor de la API funcionando en el puerto ${PORT}`);
});