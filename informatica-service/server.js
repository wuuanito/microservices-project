const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'informatica_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Importar rutas
const equiposRoutes = require('./routes/equipos');
const servidoresRoutes = require('./routes/servidores');
const switchesRoutes = require('./routes/switches');
const usuariosDominioRoutes = require('./routes/usuariosDominio');
const cuentasOfficeRoutes = require('./routes/cuentasOffice');
const camarasSeguridadRoutes = require('./routes/camarasSeguridad');
const programasRoutes = require('./routes/programas');
const raspberryRoutes = require('./routes/raspberry');
const inventarioRoutes = require('./routes/inventario');

// Middleware para pasar el pool de conexiones a las rutas
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'informatica-service' });
});

// Usar rutas
app.use('/api/equipos', equiposRoutes);
app.use('/api/servidores', servidoresRoutes);
app.use('/api/switches', switchesRoutes);
app.use('/api/usuarios-dominio', usuariosDominioRoutes);
app.use('/api/cuentas-office', cuentasOfficeRoutes);
app.use('/api/camaras-seguridad', camarasSeguridadRoutes);
app.use('/api/programas', programasRoutes);
app.use('/api/raspberry', raspberryRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/camaras-seguridad', camarasSeguridadRoutes);
app.use('/api/programas', programasRoutes);
app.use('/api/raspberry', raspberryRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servicio de Informática funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;