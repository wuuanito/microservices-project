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

// Crear evento rutinario con instancias futuras
const createRecurringEvent = async (eventData) => {
  try {
    // Crear el evento padre
    const parentEvent = await Event.create({
      ...eventData,
      isRecurring: true
    });

    // Generar instancias futuras del evento
    const instances = generateRecurringInstances(parentEvent);
    
    // Crear todas las instancias
    const createdInstances = await Event.bulkCreate(instances);
    
    return {
      parentEvent,
      instances: createdInstances
    };
  } catch (error) {
    console.error('Error in createRecurringEvent service:', error);
    throw error;
  }
};

// Generar instancias de eventos rutinarios
const generateRecurringInstances = (parentEvent) => {
  const instances = [];
  const startDate = new Date(parentEvent.startTime);
  const endDate = new Date(parentEvent.endTime);
  const duration = endDate.getTime() - startDate.getTime();
  
  // Determinar fecha límite (6 meses por defecto si no se especifica)
  const limitDate = parentEvent.recurrenceEndDate 
    ? new Date(parentEvent.recurrenceEndDate)
    : new Date(startDate.getTime() + (6 * 30 * 24 * 60 * 60 * 1000)); // 6 meses
  
  let currentDate = new Date(startDate);
  
  // Generar instancias según el patrón
  while (currentDate <= limitDate) {
    // Calcular siguiente fecha según el patrón
    switch (parentEvent.recurrencePattern) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + parentEvent.recurrenceInterval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * parentEvent.recurrenceInterval));
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + parentEvent.recurrenceInterval);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + parentEvent.recurrenceInterval);
        break;
      default:
        throw new Error('Patrón de recurrencia no válido');
    }
    
    if (currentDate <= limitDate) {
      const instanceEndTime = new Date(currentDate.getTime() + duration);
      
      instances.push({
        title: parentEvent.title,
        description: parentEvent.description,
        responsible: parentEvent.responsible,
        participants: parentEvent.participants,
        roomReserved: parentEvent.roomReserved,
        startTime: new Date(currentDate),
        endTime: instanceEndTime,
        eventType: parentEvent.eventType,
        isRecurring: false, // Las instancias no son rutinarias
        parentEventId: parentEvent.id
      });
    }
  }
  
  return instances;
};

// Actualizar evento rutinario
const updateRecurringEvent = async (id, eventData, updateType = 'single') => {
  try {
    const event = await Event.findByPk(id);
    if (!event) {
      return [0, []];
    }

    if (updateType === 'single') {
      // Actualizar solo esta instancia
      const [updatedCount, updatedEvents] = await Event.update(eventData, {
        where: { id },
        returning: true,
      });
      return [updatedCount, updatedEvents];
    } else if (updateType === 'all') {
      // Actualizar el evento padre y todas las instancias futuras
      const parentId = event.parentEventId || id;
      
      // Actualizar evento padre
      await Event.update(eventData, {
        where: { id: parentId }
      });
      
      // Actualizar todas las instancias futuras
      const [updatedCount, updatedEvents] = await Event.update(eventData, {
        where: {
          parentEventId: parentId,
          startTime: { [Op.gte]: new Date() }
        },
        returning: true,
      });
      
      return [updatedCount, updatedEvents];
    }
  } catch (error) {
    console.error(`Error in updateRecurringEvent service (id: ${id}):`, error);
    throw error;
  }
};

// Eliminar evento rutinario
const deleteRecurringEvent = async (id, deleteType = 'single') => {
  try {
    const event = await Event.findByPk(id);
    if (!event) {
      return 0;
    }

    if (deleteType === 'single') {
      // Eliminar solo esta instancia
      return await Event.destroy({ where: { id } });
    } else if (deleteType === 'all') {
      // Eliminar el evento padre y todas las instancias
      const parentId = event.parentEventId || id;
      
      // Eliminar todas las instancias
      await Event.destroy({
        where: { parentEventId: parentId }
      });
      
      // Eliminar evento padre
      return await Event.destroy({ where: { id: parentId } });
    }
  } catch (error) {
    console.error(`Error in deleteRecurringEvent service (id: ${id}):`, error);
    throw error;
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  createRecurringEvent,
  updateRecurringEvent,
  deleteRecurringEvent,
};