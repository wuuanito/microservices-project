require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./database/sequelize');
const eventRoutes = require('./routes/event.routes');
const { formatResponse } = require('./utils/response-formatter');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.status(200).json(formatResponse(null, 'Calendar Service API is running!'));
});
app.use('/api/events', eventRoutes);

// Manejo de errores global (básico)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(formatResponse(null, 'Something went wrong!', err.message));
});

// Sincronizar base de datos y arrancar servidor
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    // Sincronizar modelos (opcional, usar con precaución en producción)
    // await sequelize.sync({ alter: true }); // o { force: true } para desarrollo
    // console.log('All models were synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Calendar Service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1); // Salir si no se puede conectar a la BD
  }
};

startServer();