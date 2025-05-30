const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config/app.config');
const logger = require('../utils/logger');

const router = express.Router();

// Simplificar la configuración de proxy
router.use('/', createProxyMiddleware({
  target: config.authServiceUrl || 'http://auth-service:4001',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/api/auth'
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`Proxying ${req.method} ${req.originalUrl} to Auth Service`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Received response from Auth Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error: ${err.toString()}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Error connecting to authentication service',
      details: err.toString()
    });
  }
}));

module.exports = router;