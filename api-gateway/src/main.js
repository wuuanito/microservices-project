const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('./utils/logger');
const { authMiddleware } = require('./middleware/auth.middleware');
const config = require('./config/app.config');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());

// Conditional body parsing - exclude multipart/form-data
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    return next();
  }
  express.json()(req, res, () => {
    express.urlencoded({ extended: true })(req, res, next);
  });
});

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

// Proxy setup for specific auth service routes (e.g., login, register, refresh-token)
// These routes should NOT use the authMiddleware
app.use(['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout'], createProxyMiddleware({
  target: config.authServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/api/auth' //  /auth/login -> /api/auth/login, /auth/refresh-token -> /api/auth/refresh-token
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

// Proxy setup for other /auth routes that might require authentication (if any)
// For example, if you had a /auth/me endpoint to get user details
// This example assumes all other /auth routes are handled by the specific proxy above or don't exist.
// If you have other /auth/* endpoints that DO require authentication, they would need a separate proxy setup WITH authMiddleware.

// Proxy setup for tickets service
app.use('/tickets', authMiddleware, createProxyMiddleware({
  target: config.ticketsServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/tickets': '/api/tickets' // Rewrite /tickets to /api/tickets
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    logger.info(`Proxying ${req.method} ${req.originalUrl} to Tickets Service. Target: ${config.ticketsServiceUrl}, Rewritten Path: ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Received response from Tickets Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to Tickets Service: ${err.toString()}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Error connecting to tickets service',
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

// Proxy setup for solicitudes service
app.use('/solicitudes', authMiddleware, createProxyMiddleware({
  target: config.solicitudesServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/solicitudes': '' // Remove /solicitudes prefix
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    logger.info(`Proxying ${req.method} ${req.originalUrl} to Solicitudes Service. Target: ${config.solicitudesServiceUrl}, Rewritten Path: ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Received response from Solicitudes Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to Solicitudes Service: ${err.toString()}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Error connecting to solicitudes service',
      details: err.toString()
    });
  }
}));

// Proxy setup for informatica service
app.use('/api/informatica', authMiddleware, createProxyMiddleware({
  target: config.informaticaServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api/informatica': '/api' // Remove /api/informatica prefix and replace with /api
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    logger.info(`Proxying ${req.method} ${req.originalUrl} to Informatica Service. Target: ${config.informaticaServiceUrl}, Rewritten Path: ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Received response from Informatica Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to Informatica Service: ${err.toString()}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Error connecting to informatica service',
      details: err.toString()
    });
  }
}));

// Debug middleware for laboratorio requests
app.use('/api/laboratorio', (req, res, next) => {
  console.log('=== API GATEWAY DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Is multipart:', req.is('multipart/form-data'));
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('Files:', req.files ? 'Present' : 'Not present');
  next();
});

// Proxy setup for laboratorio service
app.use('/api/laboratorio', authMiddleware, createProxyMiddleware({
  target: config.laboratorioServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api/laboratorio': '/api' // Remove /api/laboratorio prefix and replace with /api
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    // Preserve Content-Type header for multipart/form-data
    if (req.headers['content-type']) {
      proxyReq.setHeader('Content-Type', req.headers['content-type']);
    }
    
    // Only handle JSON body for non-multipart requests
    if (req.body && !req.is('multipart/form-data')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    
    logger.info(`Proxying ${req.method} ${req.originalUrl} to Laboratorio Service. Content-Type: ${req.headers['content-type']}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Received response from Laboratorio Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to Laboratorio Service: ${err.toString()}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Error connecting to laboratorio service',
      details: err.toString()
    });
  },
  xfwd: true,
  selfHandleResponse: false
}));

// Proxy setup for laboratorio uploads (static files)
app.use('/uploads/laboratorio', createProxyMiddleware({
  target: config.laboratorioServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/uploads/laboratorio': '/uploads' // Remove /uploads/laboratorio prefix and replace with /uploads
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`Proxying ${req.method} ${req.originalUrl} to Laboratorio Service uploads. Target: ${config.laboratorioServiceUrl}, Rewritten Path: ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Received response from Laboratorio Service uploads: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to Laboratorio Service uploads: ${err.toString()}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Error connecting to laboratorio service uploads',
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