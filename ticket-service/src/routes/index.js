const express = require('express');
const router = express.Router();
const ticketRoutes = require('./ticket.routes');
const emailRoutes = require('./email.routes');

// Mount ticket routes
router.use('/api/tickets', ticketRoutes);

// Mount email routes
router.use('/api/email', emailRoutes);

// Root health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Ticket Service API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API info
router.get('/', (req, res) => {
  res.status(200).json({
    service: 'Ticket Service',
    version: '1.0.0',
    description: 'Microservicio para gestión de tickets de soporte IT',
    endpoints: {
      tickets: {
        'GET /tickets': 'Obtener todos los tickets',
        'GET /tickets/:id': 'Obtener ticket por ID',
        'POST /tickets': 'Crear nuevo ticket',
        'PUT /tickets/:id': 'Actualizar ticket',
        'DELETE /tickets/:id': 'Eliminar ticket',
        'POST /tickets/:id/conversations': 'Agregar conversación',
        'PATCH /tickets/:id/assign': 'Asignar ticket',
        'GET /tickets/stats': 'Obtener estadísticas'
      },
      email: {
        'POST /email/send': 'Enviar email genérico',
        'POST /email/suggestion': 'Enviar sugerencia por email'
      }
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;