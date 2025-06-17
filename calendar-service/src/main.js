require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // <--- Nueva importación
const { Server } = require('socket.io'); // <--- Nueva importación
const sequelize = require('./database/sequelize');
const eventRoutes = require('./routes/event.routes');
const { formatResponse } = require('./utils/response-formatter');

// Importar modelos para que Sequelize los reconozca durante la sincronización
require('./models/event.model');

const app = express();
const server = http.createServer(app); // <--- Crear servidor HTTP
const io = new Server(server, { // <--- Inicializar Socket.IO
  cors: {
    origin: "http://localhost:5173", // Reemplaza con el origen de tu frontend
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.status(200).json(formatResponse(null, 'Calendar Service API is running!'));
});
app.use('/api/events', eventRoutes(io)); // <--- Pasar instancia de io a las rutas de eventos

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
    
    // Sincronizar modelos con la base de datos
    // Esto creará las tablas si no existen, o las actualizará si hay cambios
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');

    io.on('connection', (socket) => {
      console.log('a user connected');
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });

    server.listen(PORT, () => { // <--- Usar server.listen en lugar de app.listen
      console.log(`Calendar Service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1); // Salir si no se puede conectar a la BD
  }
};

startServer();