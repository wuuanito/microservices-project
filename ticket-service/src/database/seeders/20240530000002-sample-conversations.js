'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await queryInterface.bulkInsert('conversations', [
      {
        ticketId: 'TICK-001',
        autor: 'Ana Pérez',
        autorEmail: 'ana.perez@company.com',
        texto: 'La impresora no funciona, ayuda por favor.',
        fecha: yesterday,
        esInterno: false,
        adjuntos: JSON.stringify([]),
        createdAt: now,
        updatedAt: now
      },
      {
        ticketId: 'TICK-001',
        autor: 'Agente de Soporte',
        autorEmail: 'soporte@company.com',
        texto: 'Hemos recibido su solicitud, estamos verificando.',
        fecha: today,
        esInterno: false,
        adjuntos: JSON.stringify([]),
        createdAt: now,
        updatedAt: now
      },
      {
        ticketId: 'TICK-003',
        autor: 'Laura Gómez',
        autorEmail: 'laura.gomez@company.com',
        texto: 'Solicito Adobe Illustrator.',
        fecha: threeDaysAgo,
        esInterno: false,
        adjuntos: JSON.stringify([]),
        createdAt: now,
        updatedAt: now
      },
      {
        ticketId: 'TICK-003',
        autor: 'Equipo de IT',
        autorEmail: 'it@company.com',
        texto: 'Software instalado y configurado.',
        fecha: yesterday,
        esInterno: false,
        adjuntos: JSON.stringify([]),
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('conversations', null, {});
  }
};