const ticketService = require('../services/ticket.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response-formatter');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class TicketController {
  async getAllTickets(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Datos de entrada inválidos', 400, errors.array());
      }
      
      const { page = 1, limit = 10, estado, prioridad, departamento, asignadoA, search } = req.query;
      
      const filters = {};
      if (estado && estado !== 'Todos') filters.estado = estado;
      if (prioridad) filters.prioridad = prioridad;
      if (departamento) filters.departamento = departamento;
      if (asignadoA) filters.asignadoA = asignadoA;
      if (search) filters.search = search;
      
      const pagination = { page: parseInt(page), limit: parseInt(limit) };
      
      const result = await ticketService.getAllTickets(filters, pagination);
      
      return paginatedResponse(res, result.tickets, {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: parseInt(limit)
      }, 'Tickets obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }
  
  async getTicketById(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await ticketService.getTicketById(id);
      return successResponse(res, ticket, 'Ticket obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }
  
  async createTicket(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Datos de entrada inválidos', 400, errors.array());
      }
      
      const ticket = await ticketService.createTicket(req.body);
      
      // Emit socket event for real-time updates
      if (req.io) {
        req.io.emit('ticketCreated', ticket);
      }
      
      return successResponse(res, ticket, 'Ticket creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }
  
  async updateTicket(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Datos de entrada inválidos', 400, errors.array());
      }
      
      const { id } = req.params;
      const ticket = await ticketService.updateTicket(id, req.body);
      
      // Emit socket event for real-time updates
      if (req.io) {
        req.io.emit('ticketUpdated', ticket);
      }
      
      return successResponse(res, ticket, 'Ticket actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }
  
  async deleteTicket(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ticketService.deleteTicket(id);
      
      // Emit socket event for real-time updates
      if (req.io) {
        req.io.emit('ticketDeleted', { id });
      }
      
      return successResponse(res, result, 'Ticket eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }
  
  async addConversation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Datos de entrada inválidos', 400, errors.array());
      }
      
      const { id } = req.params;
      const conversation = await ticketService.addConversation(id, req.body);
      
      // Get updated ticket with conversations
      const updatedTicket = await ticketService.getTicketById(id);
      
      // Emit socket event for real-time updates
      if (req.io) {
        req.io.emit('conversationAdded', {
          ticketId: id,
          conversation,
          ticket: updatedTicket
        });
      }
      
      return successResponse(res, conversation, 'Conversación agregada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }
  
  async getTicketStats(req, res, next) {
    try {
      const stats = await ticketService.getTicketStats();
      return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }
  
  async assignTicket(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Datos de entrada inválidos', 400, errors.array());
      }
      
      const { id } = req.params;
      const ticket = await ticketService.assignTicket(id, req.body);
      
      // Emit socket event for real-time updates
      if (req.io) {
        req.io.emit('ticketAssigned', ticket);
      }
      
      return successResponse(res, ticket, 'Ticket asignado exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TicketController();