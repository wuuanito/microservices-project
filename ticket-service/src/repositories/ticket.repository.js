const { Ticket, Conversation } = require('../models');
const { Op } = require('sequelize');

class TicketRepository {
  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    // Apply filters
    if (filters.estado) {
      whereClause.estado = filters.estado;
    }
    
    if (filters.prioridad) {
      whereClause.prioridad = filters.prioridad;
    }
    
    if (filters.departamento) {
      whereClause.departamento = filters.departamento;
    }
    
    if (filters.asignadoA) {
      whereClause.asignadoA = filters.asignadoA;
    }
    
    if (filters.search) {
      whereClause[Op.or] = [
        { id: { [Op.like]: `%${filters.search}%` } },
        { asunto: { [Op.like]: `%${filters.search}%` } },
        { usuario: { [Op.like]: `%${filters.search}%` } },
        { descripcion: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    const { count, rows } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [{
        model: Conversation,
        as: 'conversacion',
        order: [['createdAt', 'ASC']]
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return {
      tickets: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    };
  }
  
  async findById(id) {
    return await Ticket.findByPk(id, {
      include: [{
        model: Conversation,
        as: 'conversacion',
        order: [['createdAt', 'ASC']]
      }]
    });
  }
  
  async create(ticketData) {
    return await Ticket.create(ticketData);
  }
  
  async update(id, updateData) {
    const [updatedRowsCount] = await Ticket.update(updateData, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return null;
    }
    
    return await this.findById(id);
  }
  
  async delete(id) {
    const deletedRowsCount = await Ticket.destroy({
      where: { id }
    });
    
    return deletedRowsCount > 0;
  }
  
  async getStats() {
    const totalTickets = await Ticket.count();
    
    const statusStats = await Ticket.findAll({
      attributes: [
        'estado',
        [Ticket.sequelize.fn('COUNT', Ticket.sequelize.col('estado')), 'count']
      ],
      group: ['estado']
    });
    
    const priorityStats = await Ticket.findAll({
      attributes: [
        'prioridad',
        [Ticket.sequelize.fn('COUNT', Ticket.sequelize.col('prioridad')), 'count']
      ],
      group: ['prioridad']
    });
    
    return {
      total: totalTickets,
      byStatus: statusStats.reduce((acc, item) => {
        acc[item.estado] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      byPriority: priorityStats.reduce((acc, item) => {
        acc[item.prioridad] = parseInt(item.dataValues.count);
        return acc;
      }, {})
    };
  }
  
  async generateTicketId() {
    const lastTicket = await Ticket.findOne({
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    });
    
    if (!lastTicket) {
      return 'TICK-001';
    }
    
    const lastId = lastTicket.id;
    const number = parseInt(lastId.split('-')[1]) + 1;
    return `TICK-${number.toString().padStart(3, '0')}`;
  }
}

module.exports = new TicketRepository();