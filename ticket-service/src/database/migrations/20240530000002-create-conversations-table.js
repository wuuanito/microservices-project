'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ticketId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      autor: {
        type: Sequelize.STRING,
        allowNull: false
      },
      autorEmail: {
        type: Sequelize.STRING,
        allowNull: true
      },
      texto: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      esInterno: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      adjuntos: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('conversations');
  }
};