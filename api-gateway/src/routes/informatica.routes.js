const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const config = require('../config/app.config');
const logger = require('../utils/logger');

const router = express.Router();

// Proxy configuration for informatica service
const informaticaProxy = createProxyMiddleware({
  target: config.informaticaServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api/informatica': '/api'
  },
  onError: (err, req, res) => {
    logger.error('Informatica Service Proxy Error:', err.message);
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Informatica service is not responding'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`Proxying request to informatica service: ${req.method} ${req.originalUrl}`);
  }
});

// Apply authentication middleware to all informatica routes
router.use(authMiddleware);

// Proxy all informatica requests
router.use('/', informaticaProxy);

module.exports = router;