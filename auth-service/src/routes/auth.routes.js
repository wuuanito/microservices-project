// auth-service/src/routes/auth.routes.js - CORREGIDO
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/authMiddleware'); // CAMBIADO: sin destructuring

const router = express.Router();

// Register new user
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('department').optional().isIn([
      'informatica', 
      'administracion', 
      'internacional', 
      'compras', 
      'gerencia', 
      'oficina_tecnica', 
      'calidad', 
      'laboratorio', 
      'rrhh', 
      'logistica', 
      'mantenimiento', 
      'softgel', 
      'produccion',
      'sin_departamento'
    ]).withMessage('Invalid department'),
    body('role').optional().isIn([
      'director', 'administrador', 'empleado'
    ]).withMessage('Invalid role'),
    body('jobTitle').optional().isString().isLength({ max: 100 }).withMessage('Job title must be a string with max 100 characters'),
    validateRequest
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('username').optional(),
    body('email').optional().isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest
  ],
  authController.login
);

// Refresh token
router.post(
  '/refresh-token',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validateRequest
  ],
  authController.refreshToken
);

// Logout
router.post('/logout', authMiddleware, authController.logout);

// Get current user profile
router.get('/profile', authMiddleware, authController.getProfile);

// Change password
router.put(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validateRequest
  ],
  authController.changePassword
);

// Request password reset
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Must be a valid email address'),
    validateRequest
  ],
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validateRequest
  ],
  authController.resetPassword
);

console.log('🛣️ Auth routes loaded. Available methods:', Object.keys(authController));

module.exports = router;