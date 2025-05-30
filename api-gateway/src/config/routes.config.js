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

  // Protected routes - Add other services here
  app.use('/api',
    authMiddleware,
    rateLimiterMiddleware,
    (req, res) => {
      // This is a placeholder - Add other services routing here
      res.status(200).json({ message: 'API Gateway working' });
    }
  );

  // Catch-all route
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
};

module.exports = { configureRoutes };