'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash the password - using 10 salt rounds
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    return queryInterface.bulkInsert('users', [
      {
        username: 'testuser1',
        email: 'user1@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User1',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'testuser2',
        email: 'user2@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User2',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { 
      username: {
        [Sequelize.Op.in]: ['testuser1', 'testuser2']
      }
    }, {});
  }
};