const express = require('express');
const authRoutes = require('./auth.routes');
const calendarRoutes = require('./calendar.routes');
const informaticaRoutes = require('./informatica.routes');
const { loggerMiddleware } = require('../middleware/logger.middleware');

const router = express.Router();

// Apply logger middleware to all routes
router.use(loggerMiddleware);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/calendar', calendarRoutes); // Mount calendar routes
router.use('/informatica', informaticaRoutes); // Mount informatica routes

// Catch-all route
router.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = router;