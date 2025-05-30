const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    path: req.originalUrl
  });
};

module.exports = { errorHandler };