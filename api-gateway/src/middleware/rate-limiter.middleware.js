const rateLimit = require('express-rate-limit');
const config = require('../config/app.config');

const rateLimiterMiddleware = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.'
  }
});

module.exports = { rateLimiterMiddleware };