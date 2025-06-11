const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth.middleware');
const {
  validateTicketCreation,
  validateTicketUpdate,
  validateConversation,
  validateAssignment,
  validateTicketQuery,
  validateTicketId
} = require('../middleware/validate.middleware');

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Ticket Service is running',
    timestamp: new Date().toISOString()
  });
});

// Get ticket statistics
router.get('/stats', optionalAuthMiddleware, ticketController.getTicketStats);

// Get all tickets with filters and pagination
router.get('/', 
  validateTicketQuery,
  optionalAuthMiddleware, 
  ticketController.getAllTickets
);

// Get ticket by ID
router.get('/:id', 
  validateTicketId,
  optionalAuthMiddleware, 
  ticketController.getTicketById
);

// Create new ticket
router.post('/', 
  validateTicketCreation,
  optionalAuthMiddleware, 
  ticketController.createTicket
);

// Update ticket
router.put('/:id', 
  validateTicketId,
  validateTicketUpdate,
  optionalAuthMiddleware, 
  ticketController.updateTicket
);

// Delete ticket
router.delete('/:id', 
  validateTicketId,
  authMiddleware, 
  ticketController.deleteTicket
);

// Add conversation to ticket
router.post('/:id/conversations', 
  validateTicketId,
  validateConversation,
  optionalAuthMiddleware, 
  ticketController.addConversation
);

// Assign ticket
router.patch('/:id/assign', 
  validateTicketId,
  validateAssignment,
  optionalAuthMiddleware, 
  ticketController.assignTicket
);

module.exports = router;