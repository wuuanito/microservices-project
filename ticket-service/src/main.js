const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');
const { errorHandler } = require('./utils/error-handler');
const logger = require('./utils/logger');
const config = require('./config/app.config');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/', routes);

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Cliente conectado: ${socket.id}`);
  
  // Join room for real-time updates
  socket.on('joinTicketRoom', (ticketId) => {
    socket.join(`ticket_${ticketId}`);
    logger.info(`Cliente ${socket.id} se unió a la sala del ticket ${ticketId}`);
  });
  
  // Leave room
  socket.on('leaveTicketRoom', (ticketId) => {
    socket.leave(`ticket_${ticketId}`);
    logger.info(`Cliente ${socket.id} salió de la sala del ticket ${ticketId}`);
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`ticket_${data.ticketId}`).emit('userTyping', {
      user: data.user,
      ticketId: data.ticketId
    });
  });
  
  socket.on('stopTyping', (data) => {
    socket.to(`ticket_${data.ticketId}`).emit('userStoppedTyping', {
      user: data.user,
      ticketId: data.ticketId
    });
  });
  
  socket.on('disconnect', () => {
    logger.info(`Cliente desconectado: ${socket.id}`);
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Conexión a la base de datos establecida exitosamente');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    logger.info('Modelos de base de datos sincronizados exitosamente');
    
    // Start server
    server.listen(config.port, () => {
      logger.info(`Ticket Service ejecutándose en el puerto ${config.port}`);
      logger.info(`Socket.IO habilitado para actualizaciones en tiempo real`);
      logger.info(`Entorno: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    sequelize.close();
    process.exit(0);
  });
});

startServer();