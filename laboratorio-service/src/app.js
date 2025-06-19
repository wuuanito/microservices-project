const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const defectosRoutes = require('./routes/defectos');
const tareasRoutes = require('./routes/tareas');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3004;

// Conectar a la base de datos
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana de tiempo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true, // Permite todos los orígenes
  credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/defectos', defectosRoutes);
app.use('/api/tareas', tareasRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'laboratorio-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Laboratorio Service ejecutándose en puerto ${PORT}`);
  console.log(`📊 Health check disponible en http://localhost:${PORT}/health`);
});

module.exports = app;