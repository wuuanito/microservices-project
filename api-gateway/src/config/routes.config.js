const { createProxyMiddleware } = require('http-proxy-middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const { rateLimiterMiddleware } = require('../middleware/rate-limiter.middleware');
const config = require('./app.config');

const configureRoutes = (app) => {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Auth service routes
  app.use('/auth', 
    rateLimiterMiddleware,
    createProxyMiddleware({
      target: config.authServiceUrl,
      changeOrigin: true,
      pathRewrite: {
        '^/auth': ''
      }
    })
  );

  // Protected routes
  app.use('/api/tickets',
    authMiddleware,
    rateLimiterMiddleware,
    createProxyMiddleware({
      target: config.ticketsServiceUrl,
      changeOrigin: true,
      pathRewrite: {
        '^/api/tickets': '/api/tickets'
      },
      onError: (err, req, res) => {
        logger.error(`Proxy error: ${err.message}`);
        res.status(500).json({
          error: 'Service unavailable',
          message: 'Ticket service is currently unavailable'
        });
      }
    })
  );

  // Catch-all route
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
};

module.exports = { configureRoutes };