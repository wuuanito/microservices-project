const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { calendarServiceUrl } = require('../config/app.config');
const { authenticateToken } = require('../middleware/auth.middleware'); // Assuming you want to protect calendar routes

const router = express.Router();

// Proxy to Calendar Service
// All routes starting with /api/events under /calendar will be proxied
router.use('/api/events', 
  authenticateToken, // Protect calendar event routes
  createProxyMiddleware({
    target: calendarServiceUrl,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Remove /calendar prefix before forwarding to calendar-service
      // e.g., /calendar/api/events -> /api/events
      return path.replace('/calendar', ''); 
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[API Gateway] Proxying request to Calendar Service: ${req.method} ${calendarServiceUrl}${proxyReq.path}`);
      if (req.user && req.user.id) {
        proxyReq.setHeader('X-User-Id', req.user.id);
      }
      if (req.user && req.user.role) {
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
    onError: (err, req, res) => {
      console.error('[API Gateway] Proxy error to Calendar Service:', err);
      res.status(500).json({ message: 'Error connecting to the Calendar Service.' });
    }
  })
);

module.exports = router;