const Event = require('../models/event.model');
const { Op } = require('sequelize');

// Crear un nuevo evento
const createEvent = async (eventData) => {
  try {
    const event = await Event.create(eventData);
    return event;
  } catch (error) {
    console.error('Error in createEvent service:', error);
    // Propagar el error para que el controlador lo maneje
    // Se pueden añadir errores personalizados aquí si es necesario
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}`);
    }
    throw error;
  }
};

// Obtener todos los eventos (con filtros opcionales)
const getAllEvents = async (queryParams) => {
  const { startDate, endDate, responsible, room } = queryParams;
  const whereClause = {};

  if (startDate && endDate) {
    whereClause.startTime = { [Op.gte]: new Date(startDate) }; // Mayor o igual que startDate
    whereClause.endTime = { [Op.lte]: new Date(endDate) };     // Menor o igual que endDate
  } else if (startDate) {
    whereClause.startTime = { [Op.gte]: new Date(startDate) };
  }

  if (responsible) {
    whereClause.responsible = { [Op.like]: `%${responsible}%` };
  }

  if (room) {
    whereClause.roomReserved = { [Op.like]: `%${room}%` };
  }
  
  // Podríamos añadir paginación aquí también
  // const { page = 1, limit = 10 } = queryParams;
  // const offset = (page - 1) * limit;

  try {
    const events = await Event.findAll({
      where: whereClause,
      order: [['startTime', 'ASC']], // Ordenar por fecha de inicio
      // limit: parseInt(limit),
      // offset: parseInt(offset),
    });
    return events;
  } catch (error) {
    console.error('Error in getAllEvents service:', error);
    throw error;
  }
};

// Obtener un evento por ID
const getEventById = async (id) => {
  try {
    const event = await Event.findByPk(id);
    return event;
  } catch (error) {
    console.error(`Error in getEventById service (id: ${id}):`, error);
    throw error;
  }
};

// Actualizar un evento por ID
const updateEvent = async (id, eventData) => {
  try {
    // Primero, verificar si el evento existe
    const event = await Event.findByPk(id);
    if (!event) {
      // Devolver [0, []] para indicar que no se encontró o no se actualizó nada
      // Esto es consistente con cómo Sequelize devuelve el resultado de update
      return [0, []]; 
    }

    // Actualizar el evento. Sequelize devuelve un array [numberOfAffectedRows, arrayOfAffectedRows]
    const [updatedCount, updatedEvents] = await Event.update(eventData, {
      where: { id },
      returning: true, // Necesario para obtener los registros actualizados en PostgreSQL, opcional en MySQL
    });

    // Si se actualizó y queremos devolver el objeto actualizado (MySQL no lo hace por defecto con 'returning')
    if (updatedCount > 0 && !updatedEvents) { // Para MySQL
        const refreshedEvent = await Event.findByPk(id);
        return [updatedCount, [refreshedEvent]];
    }

    return [updatedCount, updatedEvents || []]; // Asegurar que updatedEvents sea un array

  } catch (error) {
    console.error(`Error in updateEvent service (id: ${id}):`, error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}`);
    }
    throw error;
  }
};

// Eliminar un evento por ID (soft delete)
const deleteEvent = async (id) => {
  try {
    // Event.destroy devuelve el número de filas eliminadas
    const deletedCount = await Event.destroy({
      where: { id },
    });
    return deletedCount;
  } catch (error) {
    console.error(`Error in deleteEvent service (id: ${id}):`, error);
    throw error;
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};