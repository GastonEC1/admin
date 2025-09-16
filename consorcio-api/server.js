const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet')
const cors = require('cors');
const path = require('path')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: [
        'https://prueba-3-1-nmrz.onrender.com'
    ],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet())


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a la base de datos de MongoDB');
  })
  .catch(err => console.error('Error al conectar con la base de datos:', err));

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


app.get('/', (req, res) => {
  res.send('API de Gestión de Consorcios en funcionamiento');
});

app.listen(PORT, () => {
  console.log(`Servidor de la API funcionando en el puerto ${PORT}`);
});