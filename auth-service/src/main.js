const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');
const { errorHandler } = require('./utils/error-handler');
const logger = require('./utils/logger');
const config = require('./config/app.config');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use(routes);

// Error handling middleware
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Sincronizar modelos con la base de datos
    // Esto creará las tablas si no existen, o las actualizará si hay cambios
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized successfully');
    
    app.listen(config.port, () => {
      logger.info(`Auth service running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});