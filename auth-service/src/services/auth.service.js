const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User, Token } = require('../models');
const config = require('../config/app.config');
const logger = require('../utils/logger');

// auth-service/src/services/auth.service.js (actualizar función generateTokens)
const generateTokens = async (user) => {
  // Create payload for JWT
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    department: user.department
  };
  
  // Generate access token
  const accessToken = jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  
  // Generate refresh token (longer lived)
  const refreshToken = jwt.sign(
    { id: user.id, tokenId: uuidv4() },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Save refresh token to database
const saveRefreshToken = async (userId, refreshToken) => {
  try {
    // Decode token to get expiry
    const decoded = jwt.decode(refreshToken);
    
    await Token.create({
      userId,
      token: refreshToken,
      type: 'refresh',
      expiresAt: new Date(decoded.exp * 1000)
    });
    
    return true;
  } catch (error) {
    logger.error('Failed to save refresh token:', error);
    throw new Error('Failed to save refresh token');
  }
};

// Verify refresh token
const verifyRefreshToken = async (token) => {
  try {
    // Check if token exists in database and is not revoked
    const tokenRecord = await Token.findOne({
      where: {
        token,
        type: 'refresh',
        isRevoked: false
      }
    });
    
    if (!tokenRecord) {
      return { error: 'Invalid refresh token' };
    }
    
    // Check if token is expired
    if (new Date() > new Date(tokenRecord.expiresAt)) {
      return { error: 'Refresh token expired' };
    }
    
    // Verify JWT
    const decoded = jwt.verify(token, config.jwtSecret);
    
    return { userId: decoded.id };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { error: 'Invalid refresh token' };
    }
    throw error;
  }
};

// Revoke refresh token
const revokeRefreshToken = async (token) => {
  try {
    await Token.update(
      { isRevoked: true },
      {
        where: {
          token,
          type: 'refresh'
        }
      }
    );
    
    return true;
  } catch (error) {
    logger.error('Failed to revoke refresh token:', error);
    throw new Error('Failed to revoke refresh token');
  }
};

// Revoke token by token value
const revokeToken = async (token) => {
  try {
    await Token.update(
      { isRevoked: true },
      {
        where: {
          token
        }
      }
    );
    
    return true;
  } catch (error) {
    logger.error('Failed to revoke token:', error);
    throw new Error('Failed to revoke token');
  }
};

// Revoke all refresh tokens for a user
const revokeAllUserTokens = async (userId) => {
  try {
    await Token.update(
      { isRevoked: true },
      {
        where: {
          userId,
          type: 'refresh',
          isRevoked: false
        }
      }
    );
    
    return true;
  } catch (error) {
    logger.error('Failed to revoke all user tokens:', error);
    throw new Error('Failed to revoke all user tokens');
  }
};

// Rotate refresh token (revoke old, save new)
const rotateRefreshToken = async (userId, oldToken, newToken) => {
  try {
    // Revoke old token
    await revokeRefreshToken(oldToken);
    
    // Save new token
    await saveRefreshToken(userId, newToken);
    
    return true;
  } catch (error) {
    logger.error('Failed to rotate refresh token:', error);
    throw new Error('Failed to rotate refresh token');
  }
};

// Verify password
const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    logger.error('Password verification failed:', error);
    throw new Error('Password verification failed');
  }
};

// Hash password
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, config.bcryptSaltRounds);
  } catch (error) {
    logger.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
};

// Generate password reset token
const generatePasswordResetToken = async (userId) => {
  try {
    // Generate token
    const resetToken = jwt.sign(
      { id: userId, purpose: 'reset_password', tokenId: uuidv4() },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    // Save token
    const decoded = jwt.decode(resetToken);
    
    await Token.create({
      userId,
      token: resetToken,
      type: 'reset_password',
      expiresAt: new Date(decoded.exp * 1000)
    });
    
    return resetToken;
  } catch (error) {
    logger.error('Failed to generate password reset token:', error);
    throw new Error('Failed to generate password reset token');
  }
};

// Verify password reset token
const verifyPasswordResetToken = async (token) => {
  try {
    // Check if token exists in database and is not revoked
    const tokenRecord = await Token.findOne({
      where: {
        token,
        type: 'reset_password',
        isRevoked: false
      }
    });
    
    if (!tokenRecord) {
      return { error: 'Invalid reset token' };
    }
    
    // Check if token is expired
    if (new Date() > new Date(tokenRecord.expiresAt)) {
      return { error: 'Reset token expired' };
    }
    
    // Verify JWT
    const decoded = jwt.verify(token, config.jwtSecret);
    
    if (decoded.purpose !== 'reset_password') {
      return { error: 'Invalid token purpose' };
    }
    
    return { userId: decoded.id };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { error: 'Invalid reset token' };
    }
    throw error;
  }
};

module.exports = {
  generateTokens,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeToken,
  revokeAllUserTokens,
  rotateRefreshToken,
  verifyPassword,
  hashPassword,
  generatePasswordResetToken,
  verifyPasswordResetToken
};