'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tickets', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      asunto: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      departamento: {
        type: Sequelize.STRING,
        allowNull: false
      },
      usuario: {
        type: Sequelize.STRING,
        allowNull: false
      },
      usuarioEmail: {
        type: Sequelize.STRING,
        allowNull: true
      },
      prioridad: {
        type: Sequelize.ENUM('Baja', 'Media', 'Alta', 'Crítica'),
        allowNull: false,
        defaultValue: 'Media'
      },
      estado: {
        type: Sequelize.ENUM('Abierto', 'En Progreso', 'Pendiente', 'Cerrado'),
        allowNull: false,
        defaultValue: 'Abierto'
      },
      asignadoA: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fechaCreacion: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      ultimaActualizacion: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      fechaCierre: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      categoria: {
        type: Sequelize.STRING,
        allowNull: true
      },
      etiquetas: {
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
    await queryInterface.dropTable('tickets');
  }
};