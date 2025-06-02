// auth-service/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔍 Auth middleware - Headers:', {
      authorization: authHeader ? 'Present' : 'Missing',
      userAgent: req.headers['user-agent']
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return res.status(401).json({ 
        error: 'Token no proporcionado',
        status: 401,
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    console.log('🔑 Token received:', token.substring(0, 20) + '...');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded:', { id: decoded.id, email: decoded.email });
      
      // Buscar usuario en la base de datos
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'department', 'jobTitle', 'isActive', 'lastLogin', 'createdAt', 'updatedAt']
      });

      if (!user) {
        console.log('❌ User not found in database');
        return res.status(401).json({ 
          error: 'Usuario no encontrado',
          status: 401,
          timestamp: new Date().toISOString()
        });
      }

      if (!user.isActive) {
        console.log('❌ User is inactive');
        return res.status(401).json({ 
          error: 'Usuario inactivo',
          status: 401,
          timestamp: new Date().toISOString()
        });
      }

      console.log('✅ User authenticated:', user.username);
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('❌ JWT verification error:', jwtError.message);
      return res.status(401).json({ 
        error: 'Token inválido',
        status: 401,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = authMiddleware;