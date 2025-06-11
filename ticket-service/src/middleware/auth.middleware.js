const axios = require('axios');
const config = require('../config/app.config');
const { AppError } = require('../utils/error-handler');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify token with auth service
    try {
      const response = await axios.get(`${config.authServiceUrl}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });
      
      if (response.data.success) {
        req.user = response.data.data.user;
        next();
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token inválido',
          timestamp: new Date().toISOString()
        });
      }
    } catch (authError) {
      logger.error('Error verifying token with auth service:', authError.message);
      
      if (authError.response?.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido o expirado',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(503).json({
        success: false,
        message: 'Servicio de autenticación no disponible',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
};

// Optional auth middleware - doesn't fail if no token provided
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    try {
      const response = await axios.get(`${config.authServiceUrl}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });
      
      if (response.data.success) {
        req.user = response.data.data.user;
      } else {
        req.user = null;
      }
    } catch (authError) {
      logger.warn('Optional auth verification failed:', authError.message);
      req.user = null;
    }
    
    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};