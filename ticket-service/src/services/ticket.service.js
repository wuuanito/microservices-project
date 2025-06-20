const ticketRepository = require('../repositories/ticket.repository');
const conversationRepository = require('../repositories/conversation.repository');
const { AppError } = require('../utils/error-handler');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email.service'); // Importar el servicio de correo

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
      
      const createdTicket = await this.getTicketById(ticket.id);

      // Notificación por correo al equipo de TI
      const itTeamEmail = process.env.IT_TEAM_EMAIL || 'desarrollos@naturepharma.es'; // Usar variable de entorno
      const subjectNewTicket = `Nuevo Ticket Creado: ${createdTicket.id} - ${createdTicket.asunto}`;
      const textNewTicket = `Se ha creado un nuevo ticket con ID ${createdTicket.id}.\nAsunto: ${createdTicket.asunto}\nUsuario: ${createdTicket.usuario} (${createdTicket.usuarioEmail || 'N/A'})\nDepartamento: ${createdTicket.departamento}\nPrioridad: ${createdTicket.prioridad}\nDescripción: ${createdTicket.descripcion}`;
      const htmlNewTicket = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333333;
            background-color: #f4f4f4;
            padding: 20px;
            margin: 0;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 180px;
            height: auto;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            color: #003366;
            margin-top: 10px;
          }
          .content p {
            font-size: 15px;
            line-height: 1.6;
          }
          .footer {
            font-size: 13px;
            text-align: center;
            color: #777777;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://www.riojanaturepharma.com/assets/img/logo-big.png" alt="NaturePharma Logo">
            <div class="title">Nuevo Ticket Creado</div>
          </div>
          <div class="content">
            <p><strong>ID del Ticket:</strong> ${createdTicket.id}</p>
            <p><strong>Asunto:</strong> ${createdTicket.asunto}</p>
            <p><strong>Usuario:</strong> ${createdTicket.usuario} (${createdTicket.usuarioEmail || 'N/A'})</p>
            <p><strong>Departamento:</strong> ${createdTicket.departamento}</p>
            <p><strong>Prioridad:</strong> ${createdTicket.prioridad}</p>
            <p><strong>Descripción:</strong><br>${createdTicket.descripcion.replace(/\n/g, '<br>')}</p>
            <p>Por favor, accede al sistema para gestionar o responder al ticket.</p>
          </div>
          <div class="footer">
            NaturePharma &copy; ${new Date().getFullYear()} – Sistema de Gestión de Soporte Técnico
          </div>
        </div>
      </body>
      </html>
    `;
    
      sendEmail(itTeamEmail, subjectNewTicket, textNewTicket, htmlNewTicket).catch(err => {
        logger.error(`Error al enviar correo de nuevo ticket a informática: ${err.message}`);
      });

      return createdTicket;
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
      const updatedTicket = await ticketRepository.update(id, updatedData);

      // Notificación por correo si el estado ha cambiado
      if (updatedTicket && updateData.estado && existingTicket.estado !== updatedTicket.estado) {
        if (updatedTicket.usuarioEmail) {
          const subjectStatusChange = `Actualización de Estado del Ticket: ${updatedTicket.id}`;
          const textStatusChange = `Hola ${updatedTicket.usuario},\n\nEl estado de tu ticket con ID ${updatedTicket.id} ("${updatedTicket.asunto}") ha cambiado a: ${updatedTicket.estado}.\n\nPuedes revisar los detalles en el sistema.\n\nSaludos,\nEquipo de Soporte NaturePharma`;
          const htmlStatusChange = `<p>Hola ${updatedTicket.usuario},</p>
                               <p>El estado de tu ticket con ID <strong>${updatedTicket.id}</strong> ("${updatedTicket.asunto}") ha cambiado a: <strong>${updatedTicket.estado}</strong>.</p>
                               <p>Puedes revisar los detalles en el sistema.</p>
                               <br>
                               <p>Saludos,</p>
                               <p>Equipo de Soporte NaturePharma</p>`;
          sendEmail(updatedTicket.usuarioEmail, subjectStatusChange, textStatusChange, htmlStatusChange).catch(err => {
            logger.error(`Error al enviar correo de cambio de estado a ${updatedTicket.usuarioEmail}: ${err.message}`);
          });
        } else {
          logger.warn(`No se pudo enviar correo de cambio de estado para el ticket ${updatedTicket.id}: no hay email de usuario.`);
        }
      }

      return updatedTicket;
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