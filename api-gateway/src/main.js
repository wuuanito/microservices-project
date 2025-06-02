const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('./utils/logger');
const config = require('./config/app.config');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API Gateway is running' });
});

// Diagnóstico para verificar la conectividad
app.get('/diagnose', async (req, res) => {
  try {
    const axios = require('axios');
    const result = {
      gateway: { status: 'ok', message: 'API Gateway is running' },
      authServiceUrl: config.authServiceUrl,
      authService: { status: 'unknown' }
    };
    
    try {
      const response = await axios.get(`${config.authServiceUrl}/health`, { timeout: 5000 });
      result.authService = {
        status: 'ok',
        message: 'Auth Service is reachable',
        response: response.data
      };
    } catch (error) {
      result.authService = {
        status: 'error',
        message: 'Auth Service is not reachable',
        error: error.message
      };
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Diagnostic failed',
      message: error.message
    });
  }
});

// Proxy setup for auth service
app.use('/auth', createProxyMiddleware({
  target: config.authServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/api/auth'  // Esto debería hacer que /auth/register se convierta en /api/auth/register
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    logger.info(`Proxying ${req.method} ${req.originalUrl} to Auth Service at ${config.authServiceUrl}/api/auth${req.url}`);
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

// Proxy setup for calendar service
app.use('/calendar', createProxyMiddleware({
  target: config.calendarServiceUrl, // Ensure this is defined in your config/app.config.js
  changeOrigin: true,
  pathRewrite: {
    '^/calendar': '' // This will remove /calendar prefix, so /calendar/api/events becomes /api/events
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    logger.info(`Proxying ${req.method} ${req.originalUrl} to Calendar Service at ${config.calendarServiceUrl}${req.url.replace('/calendar', '')}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Received response from Calendar Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to Calendar Service: ${err.toString()}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Error connecting to calendar service',
      details: err.toString()
    });
  }
}));

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(config.port, () => {
  logger.info(`API Gateway running on port ${config.port}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});