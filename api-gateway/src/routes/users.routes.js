const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config/app.config');
const logger = require('../utils/logger');

const router = express.Router();

// Proxy all user routes to auth-service
router.use('/', createProxyMiddleware({
  target: config.authServiceUrl || 'http://auth-service:4001',
  changeOrigin: true,
  pathRewrite: {
    '^/users': '/api/users'
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`Proxying ${req.method} ${req.originalUrl} to Auth Service (Users)`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Received response from Auth Service (Users): ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error (Users): ${err.toString()}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Error connecting to authentication service for user operations',
      details: err.toString()
    });
  }
}));

module.exports = router;