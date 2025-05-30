const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validate.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Register new user
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
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
router.get('/me', authMiddleware, authController.getProfile);

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

module.exports = router;