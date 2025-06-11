const { Conversation } = require('../models');

class ConversationRepository {
  async findByTicketId(ticketId) {
    return await Conversation.findAll({
      where: { ticketId },
      order: [['createdAt', 'ASC']]
    });
  }
  
  async create(conversationData) {
    return await Conversation.create(conversationData);
  }
  
  async findById(id) {
    return await Conversation.findByPk(id);
  }
  
  async update(id, updateData) {
    const [updatedRowsCount] = await Conversation.update(updateData, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return null;
    }
    
    return await this.findById(id);
  }
  
  async delete(id) {
    const deletedRowsCount = await Conversation.destroy({
      where: { id }
    });
    
    return deletedRowsCount > 0;
  }
  
  async deleteByTicketId(ticketId) {
    const deletedRowsCount = await Conversation.destroy({
      where: { ticketId }
    });
    
    return deletedRowsCount;
  }
}

module.exports = new ConversationRepository();