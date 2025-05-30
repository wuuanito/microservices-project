const { User } = require('../models');
const { hashPassword } = require('./auth.service');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Find user by ID
const findById = async (id) => {
  try {
    return await User.findByPk(id);
  } catch (error) {
    logger.error('Error finding user by ID:', error);
    throw new Error('Error finding user');
  }
};

// Find user by username
const findByUsername = async (username) => {
  try {
    return await User.findOne({
      where: { username }
    });
  } catch (error) {
    logger.error('Error finding user by username:', error);
    throw new Error('Error finding user');
  }
};

// Find user by email
const findByEmail = async (email) => {
  try {
    return await User.findOne({
      where: { email }
    });
  } catch (error) {
    logger.error('Error finding user by email:', error);
    throw new Error('Error finding user');
  }
};

// Find user by username or email
const findByUsernameOrEmail = async (username, email) => {
  try {
    const conditions = [];
    
    if (username) {
      conditions.push({ username });
    }
    
    if (email) {
      conditions.push({ email });
    }
    
    if (conditions.length === 0) {
      return null;
    }
    
    return await User.findOne({
      where: {
        [Op.or]: conditions
      }
    });
  } catch (error) {
    logger.error('Error finding user by username or email:', error);
    throw new Error('Error finding user');
  }
};

// Create new user
const createUser = async (userData) => {
  try {
    // Hash password before saving
    const hashedPassword = await hashPassword(userData.password);
    
    // Create user
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });
    
    return user;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw new Error('Error creating user');
  }
};

// Update user's last login time
const updateLastLogin = async (userId) => {
  try {
    await User.update(
      { lastLogin: new Date() },
      { where: { id: userId } }
    );
    
    return true;
  } catch (error) {
    logger.error('Error updating last login:', error);
    throw new Error('Error updating last login');
  }
};

// Update user password
const updatePassword = async (userId, newPassword) => {
  try {
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    await User.update(
      { password: hashedPassword },
      { where: { id: userId } }
    );
    
    return true;
  } catch (error) {
    logger.error('Error updating password:', error);
    throw new Error('Error updating password');
  }
};

// Update user profile
const updateUser = async (userId, userData) => {
  try {
    // Update user
    await User.update(
      userData,
      { where: { id: userId } }
    );
    
    // Return updated user
    return await findById(userId);
  } catch (error) {
    logger.error('Error updating user:', error);
    throw new Error('Error updating user');
  }
};

// Find all users
const findAll = async () => {
  try {
    return await User.findAll({
      attributes: { exclude: ['password'] }
    });
  } catch (error) {
    logger.error('Error finding all users:', error);
    throw new Error('Error finding users');
  }
};

// Delete user (soft delete)
const deleteUser = async (userId) => {
  try {
    await User.destroy({
      where: { id: userId }
    });
    
    return true;
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw new Error('Error deleting user');
  }
};

// Update user role
const updateUserRole = async (userId, role) => {
  try {
    await User.update(
      { role },
      { where: { id: userId } }
    );
    
    return await findById(userId);
  } catch (error) {
    logger.error('Error updating user role:', error);
    throw new Error('Error updating user role');
  }
};

module.exports = {
  findById,
  findByUsername,
  findByEmail,
  findByUsernameOrEmail,
  createUser,
  updateLastLogin,
  updatePassword,
  updateUser,
  findAll,
  deleteUser,
  updateUserRole
};