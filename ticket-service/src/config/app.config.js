require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4002,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
};