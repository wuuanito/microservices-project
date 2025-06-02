const { User, Token } = require('../models');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const logger = require('../utils/logger');
const { formatResponse } = require('../utils/response-formatter');

// Register a new user
// auth-service/src/controllers/auth.controller.js (actualizar función register)
const register = async (req, res, next) => {
  try {
    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      department, 
      role,
      jobTitle 
    } = req.body;
    
    // Check if user already exists
    const existingUser = await userService.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists with this username or email' 
      });
    }
    
    // Create user - incluir nuevos campos
    const user = await userService.createUser({
      username,
      email,
      password,
      firstName,
      lastName,
      department: department || 'sin_departamento',
      role: role || 'empleado',
      jobTitle
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokens(user);
    
    // Save refresh token
    await authService.saveRefreshToken(user.id, refreshToken);
    
    return res.status(201).json(formatResponse({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        jobTitle: user.jobTitle
      },
      accessToken,
      refreshToken
    }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};



// Login user

// Login user - REEMPLAZAR ESTE MÉTODO
const login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username && !email) {
      return res.status(400).json({ 
        error: 'Username or email is required' 
      });
    }
    
    // Find user
    const user = await userService.findByUsernameOrEmail(username, email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
    
    // Verify password
    const isPasswordValid = await authService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
    
    // Update last login
    await userService.updateLastLogin(user.id);
    
    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokens(user);
    
    // Save refresh token
    await authService.saveRefreshToken(user.id, refreshToken);
    
    // ARREGLADO: Incluir todos los campos del usuario como en register
    return res.status(200).json(formatResponse({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,  // AGREGADO
        jobTitle: user.jobTitle       // AGREGADO
      },
      accessToken,
      refreshToken
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    
    // Verify refresh token
    const { userId, error } = await authService.verifyRefreshToken(token);
    if (error) {
      return res.status(401).json({ error });
    }
    
    // Find user
    const user = await userService.findById(userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken } = await authService.generateTokens(user);
    
    // Save new refresh token and revoke old one
    await authService.rotateRefreshToken(userId, token, refreshToken);
    
    return res.status(200).json(formatResponse({
      accessToken,
      refreshToken
    }, 'Token refreshed successfully'));
  } catch (error) {
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    const { user } = req;
    const authHeader = req.headers.authorization;
    const refreshToken = req.body.refreshToken;
    
    if (refreshToken) {
      // Revoke refresh token
      await authService.revokeRefreshToken(refreshToken);
    }
    
    return res.status(200).json(formatResponse(
      null, 
      'Logout successful'
    ));
  } catch (error) {
    next(error);
  }
};

// Get user profile
// auth-service/src/controllers/auth.controller.js (actualizar función getProfile)
const getProfile = async (req, res, next) => {
  try {
    const { user } = req;
    
    // Get user from database
    const userProfile = await userService.findById(user.id);
    if (!userProfile) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    return res.status(200).json(formatResponse({
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      role: userProfile.role,
      department: userProfile.department,
      jobTitle: userProfile.jobTitle,
      createdAt: userProfile.createdAt,
      lastLogin: userProfile.lastLogin
    }));
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { user } = req;
    const { currentPassword, newPassword } = req.body;
    
    // Get user from database
    const userProfile = await userService.findById(user.id);
    if (!userProfile) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // Verify current password
    const isPasswordValid = await authService.verifyPassword(currentPassword, userProfile.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }
    
    // Update password
    await userService.updatePassword(user.id, newPassword);
    
    // Revoke all refresh tokens
    await authService.revokeAllUserTokens(user.id);
    
    return res.status(200).json(formatResponse(
      null, 
      'Password changed successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Request password reset
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await userService.findByEmail(email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return res.status(200).json(formatResponse(
        null, 
        'If your email is registered, you will receive a password reset link'
      ));
    }
    
    // Generate reset token
    const resetToken = await authService.generatePasswordResetToken(user.id);
    
    // In a real application, send email with reset link
    // For demo purposes, just return the token
    logger.info(`Password reset token for ${email}: ${resetToken}`);
    
    return res.status(200).json(formatResponse(
      { resetToken }, // Remove in production
      'If your email is registered, you will receive a password reset link'
    ));
  } catch (error) {
    next(error);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify reset token
    const { userId, error } = await authService.verifyPasswordResetToken(token);
    if (error) {
      return res.status(401).json({ error });
    }
    
    // Update password
    await userService.updatePassword(userId, newPassword);
    
    // Revoke the reset token
    await authService.revokeToken(token);
    
    // Revoke all refresh tokens
    await authService.revokeAllUserTokens(userId);
    
    return res.status(200).json(formatResponse(
      null, 
      'Password has been reset successfully'
    ));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword
};