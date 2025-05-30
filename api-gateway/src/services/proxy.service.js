const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config/app.config');
const logger = require('../utils/logger');

const createAuthServiceProxy = () => {
  return createProxyMiddleware({
    target: config.authServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/auth': '/api/auth'
    },
    proxyTimeout: 60000,  // 60 segundos
    timeout: 60000,       // 60 segundos
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying request to auth service: ${req.method} ${req.originalUrl}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.debug(`Proxy response from auth service: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(500).json({
        error: 'Service unavailable',
        message: 'Authentication service is currently unavailable'
      });
    }
  });
};

module.exports = {
  createAuthServiceProxy
};