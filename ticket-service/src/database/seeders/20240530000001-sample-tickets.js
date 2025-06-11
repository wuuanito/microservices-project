'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await queryInterface.bulkInsert('tickets', [
      {
        id: 'TICK-001',
        asunto: 'Problema con la impresora de la oficina A',
        descripcion: 'La impresora multifunción del departamento de Oficina A no enciende. Se ha probado a reiniciarla y verificar las conexiones sin éxito. Es urgente ya que se necesita para imprimir documentos importantes.',
        departamento: 'Oficina A',
        usuario: 'Ana Pérez',
        usuarioEmail: 'ana.perez@company.com',
        prioridad: 'Alta',
        estado: 'Abierto',
        asignadoA: 'David Lee',
        fechaCreacion: yesterday,
        ultimaActualizacion: today,
        categoria: 'Hardware',
        etiquetas: JSON.stringify(['impresora', 'hardware', 'urgente']),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'TICK-002',
        asunto: 'No puedo acceder al sistema CRM',
        descripcion: 'Desde esta mañana no puedo iniciar sesión en el CRM. Me aparece un error de credenciales inválidas, pero estoy seguro de que son correctas. Necesito acceso para registrar nuevas ventas.',
        departamento: 'Ventas',
        usuario: 'Carlos López',
        usuarioEmail: 'carlos.lopez@company.com',
        prioridad: 'Media',
        estado: 'En Progreso',
        asignadoA: null,
        fechaCreacion: twoDaysAgo,
        ultimaActualizacion: today,
        categoria: 'Software',
        etiquetas: JSON.stringify(['crm', 'acceso', 'credenciales']),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'TICK-003',
        asunto: 'Solicitud de nuevo software de diseño',
        descripcion: 'Me gustaría solicitar la instalación de la última versión de Adobe Illustrator en mi equipo. La versión actual está desactualizada y carece de algunas funcionalidades que necesito para mi trabajo diario.',
        departamento: 'Diseño Gráfico',
        usuario: 'Laura Gómez',
        usuarioEmail: 'laura.gomez@company.com',
        prioridad: 'Baja',
        estado: 'Cerrado',
        asignadoA: 'Equipo de IT',
        fechaCreacion: threeDaysAgo,
        ultimaActualizacion: yesterday,
        fechaCierre: yesterday,
        categoria: 'Software',
        etiquetas: JSON.stringify(['adobe', 'software', 'instalación']),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'TICK-004',
        asunto: 'Fallo en la conexión de red del 3er piso',
        descripcion: 'No hay conexión a internet en varias estaciones de trabajo del tercer piso. Parece ser un problema generalizado en esa área. Afecta a la productividad de varios equipos.',
        departamento: 'Infraestructura',
        usuario: 'Roberto Diaz',
        usuarioEmail: 'roberto.diaz@company.com',
        prioridad: 'Crítica',
        estado: 'Abierto',
        asignadoA: 'Sara Connor',
        fechaCreacion: today,
        ultimaActualizacion: today,
        categoria: 'Red',
        etiquetas: JSON.stringify(['red', 'conectividad', 'crítico']),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'TICK-005',
        asunto: 'Actualización de antivirus en portátiles',
        descripcion: 'Solicito la actualización programada del software antivirus en todos los portátiles del departamento de marketing. Queremos asegurar que todos los equipos estén protegidos contra las últimas amenazas.',
        departamento: 'Seguridad IT',
        usuario: 'Elena Rodriguez',
        usuarioEmail: 'elena.rodriguez@company.com',
        prioridad: 'Media',
        estado: 'Pendiente',
        asignadoA: null,
        fechaCreacion: today,
        ultimaActualizacion: today,
        categoria: 'Seguridad',
        etiquetas: JSON.stringify(['antivirus', 'seguridad', 'actualización']),
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tickets', null, {});
  }
};