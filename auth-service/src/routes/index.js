const express = require('express');
const authRoutes = require('./auth.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
router.use('/api/auth', authRoutes);

// Catch-all route
router.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = router;