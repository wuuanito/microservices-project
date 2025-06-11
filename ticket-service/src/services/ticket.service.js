const ticketRepository = require('../repositories/ticket.repository');
const conversationRepository = require('../repositories/conversation.repository');
const { AppError } = require('../utils/error-handler');
const logger = require('../utils/logger');

class TicketService {
  async getAllTickets(filters = {}, pagination = {}) {
    try {
      logger.info('Fetching tickets with filters:', filters);
      return await ticketRepository.findAll(filters, pagination);
    } catch (error) {
      logger.error('Error fetching tickets:', error);
      throw new AppError('Error al obtener los tickets', 500);
    }
  }
  
  async getTicketById(id) {
    try {
      const ticket = await ticketRepository.findById(id);
      if (!ticket) {
        throw new AppError('Ticket no encontrado', 404);
      }
      return ticket;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error fetching ticket by ID:', error);
      throw new AppError('Error al obtener el ticket', 500);
    }
  }
  
  async createTicket(ticketData) {
    try {
      // Generate ticket ID
      const ticketId = await ticketRepository.generateTicketId();
      
      const newTicketData = {
        ...ticketData,
        id: ticketId,
        fechaCreacion: new Date().toISOString().split('T')[0],
        ultimaActualizacion: new Date().toISOString().split('T')[0]
      };
      
      logger.info('Creating new ticket:', newTicketData);
      const ticket = await ticketRepository.create(newTicketData);
      
      // Create initial conversation entry if description is provided
      if (ticketData.descripcion) {
        await conversationRepository.create({
          ticketId: ticket.id,
          autor: ticketData.usuario,
          autorEmail: ticketData.usuarioEmail,
          texto: ticketData.descripcion,
          fecha: new Date().toISOString().split('T')[0],
          esInterno: false
        });
      }
      
      return await this.getTicketById(ticket.id);
    } catch (error) {
      logger.error('Error creating ticket:', error);
      throw new AppError('Error al crear el ticket', 500);
    }
  }
  
  async updateTicket(id, updateData) {
    try {
      const existingTicket = await ticketRepository.findById(id);
      if (!existingTicket) {
        throw new AppError('Ticket no encontrado', 404);
      }
      
      const updatedData = {
        ...updateData,
        ultimaActualizacion: new Date().toISOString().split('T')[0]
      };
      
      // If status is being changed to 'Cerrado', set fechaCierre
      if (updateData.estado === 'Cerrado' && existingTicket.estado !== 'Cerrado') {
        updatedData.fechaCierre = new Date().toISOString().split('T')[0];
      }
      
      logger.info(`Updating ticket ${id}:`, updatedData);
      return await ticketRepository.update(id, updatedData);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error updating ticket:', error);
      throw new AppError('Error al actualizar el ticket', 500);
    }
  }
  
  async deleteTicket(id) {
    try {
      const existingTicket = await ticketRepository.findById(id);
      if (!existingTicket) {
        throw new AppError('Ticket no encontrado', 404);
      }
      
      // Delete associated conversations first
      await conversationRepository.deleteByTicketId(id);
      
      logger.info(`Deleting ticket ${id}`);
      const deleted = await ticketRepository.delete(id);
      
      if (!deleted) {
        throw new AppError('Error al eliminar el ticket', 500);
      }
      
      return { message: 'Ticket eliminado exitosamente' };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error deleting ticket:', error);
      throw new AppError('Error al eliminar el ticket', 500);
    }
  }
  
  async addConversation(ticketId, conversationData) {
    try {
      const ticket = await ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new AppError('Ticket no encontrado', 404);
      }
      
      const newConversationData = {
        ...conversationData,
        ticketId,
        fecha: new Date().toISOString().split('T')[0]
      };
      
      logger.info(`Adding conversation to ticket ${ticketId}:`, newConversationData);
      const conversation = await conversationRepository.create(newConversationData);
      
      // Update ticket's last update date
      await ticketRepository.update(ticketId, {
        ultimaActualizacion: new Date().toISOString().split('T')[0]
      });
      
      return conversation;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error adding conversation:', error);
      throw new AppError('Error al agregar la conversación', 500);
    }
  }
  
  async getTicketStats() {
    try {
      logger.info('Fetching ticket statistics');
      return await ticketRepository.getStats();
    } catch (error) {
      logger.error('Error fetching ticket stats:', error);
      throw new AppError('Error al obtener las estadísticas', 500);
    }
  }
  
  async assignTicket(ticketId, assigneeData) {
    try {
      const ticket = await ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new AppError('Ticket no encontrado', 404);
      }
      
      const updateData = {
        asignadoA: assigneeData.asignadoA,
        ultimaActualizacion: new Date().toISOString().split('T')[0]
      };
      
      // If ticket is being assigned and current status is 'Abierto', change to 'En Progreso'
      if (assigneeData.asignadoA && ticket.estado === 'Abierto') {
        updateData.estado = 'En Progreso';
      }
      
      logger.info(`Assigning ticket ${ticketId} to ${assigneeData.asignadoA}`);
      return await ticketRepository.update(ticketId, updateData);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error assigning ticket:', error);
      throw new AppError('Error al asignar el ticket', 500);
    }
  }
}

module.exports = new TicketService();