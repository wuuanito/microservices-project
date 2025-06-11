require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:4001',
  ticketsServiceUrl: process.env.TICKETS_SERVICE_URL || 'http://tickets-service:4003',
  calendarServiceUrl: process.env.CALENDAR_SERVICE_URL || 'http://calendar-service:3003',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100 // 100 requests per window
};