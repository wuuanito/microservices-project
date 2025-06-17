const eventService = require('../services/event.service'); // Asegúrate que la ruta sea correcta
const { formatResponse, formatError } = require('../utils/response-formatter'); // Asegúrate que la ruta sea correcta
const { sendEventInvitationEmail } = require('../utils/email.service'); // Importar el servicio de correo

// Crear un nuevo evento
const createEvent = async (req, res, io) => { // <--- Añadir io como parámetro
  try {
    const eventData = req.body; 
    const event = await eventService.createEvent(eventData);
    io.emit('newEvent', event); // <--- Emitir evento WebSocket

    // Enviar correos de invitación si hay participantes
    if (event.participants && event.participants.length > 0) {
      try {
        await sendEventInvitationEmail(event.participants, event);
      } catch (emailError) {
        console.error('Error al intentar enviar correos de invitación:', emailError);
        // No bloquear la respuesta principal por error de correo, pero sí loggearlo.
      }
    }

    res.status(201).json(formatResponse(event, 'Evento creado exitosamente.'));
  } catch (error) {
    // Manejo de errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json(formatError(messages, 'Error de validación al crear el evento.'));
    }
    // Para otros errores, puedes usar un middleware de errores global si lo tienes
    // next(error);
    // O responder directamente
    console.error('Error en createEvent:', error); // Log para debugging
    res.status(400).json(formatError(error.message || 'Error desconocido', 'Error al crear el evento.'));
  }
};

// Obtener todos los eventos
const getAllEvents = async (req, res, next) => {
  try {
    // Aquí se podrían añadir filtros desde req.query, incluyendo eventType
    // Ejemplo:
    // const filters = { ...req.query }; // Copia los query params
    // if (req.query.eventType) {
    //   filters.eventType = req.query.eventType;
    // }
    // const events = await eventService.getAllEvents(filters);
    const events = await eventService.getAllEvents(req.query);
    if (events.rows && typeof events.count !== 'undefined') { // Si el servicio devuelve paginación
        res.status(200).json(formatResponse({ totalItems: events.count, items: events.rows, totalPages: events.totalPages, currentPage: events.currentPage }));
    } else {
        res.status(200).json(formatResponse(events));
    }
  } catch (error) {
    // next(error);
    console.error('Error en getAllEvents:', error);
    res.status(500).json(formatError(error.message || 'Error desconocido', 'Error al obtener los eventos.'));
  }
};

// Obtener un evento por ID
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    if (!event) {
      return res.status(404).json(formatError(null, 'Evento no encontrado.'));
    }
    res.status(200).json(formatResponse(event));
  } catch (error) {
    // next(error);
    console.error('Error en getEventById:', error);
    res.status(500).json(formatError(error.message || 'Error desconocido', 'Error al obtener el evento.'));
  }
};

// Actualizar un evento por ID
const updateEvent = async (req, res, io) => { // <--- Añadir io como parámetro
  try {
    const { id } = req.params;
    const eventData = req.body; 

    const [updatedCount, updatedEvents] = await eventService.updateEvent(id, eventData);

    if (updatedCount === 0) {
      const eventExists = await eventService.getEventById(id);
      if (!eventExists) {
        return res.status(404).json(formatError(null, 'Evento no encontrado.'));
      }
      return res.status(200).json(formatResponse(eventExists, 'Datos idénticos, no se realizó ninguna actualización.'));
    }
    io.emit('updateEvent', updatedEvents[0]); // <--- Emitir evento WebSocket
    res.status(200).json(formatResponse(updatedEvents[0], 'Evento actualizado exitosamente.'));
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json(formatError(messages, 'Error de validación al actualizar el evento.'));
    }
    // next(error);
    console.error('Error en updateEvent:', error);
    res.status(400).json(formatError(error.message || 'Error desconocido', 'Error al actualizar el evento.'));
  }
};

// Eliminar un evento por ID (soft delete debido a `paranoid: true` en el modelo)
const deleteEvent = async (req, res, io) => { // <--- Añadir io como parámetro
  try {
    const { id } = req.params;
    const deletedCount = await eventService.deleteEvent(id); 
    if (deletedCount === 0) {
      return res.status(404).json(formatError(null, 'Evento no encontrado.'));
    }
    io.emit('deleteEvent', { id }); // <--- Emitir evento WebSocket
    res.status(200).json(formatResponse(null, 'Evento eliminado exitosamente (marcado como eliminado).'));
  } catch (error) {
    // next(error);
    console.error('Error en deleteEvent:', error);
    res.status(500).json(formatError(error.message || 'Error desconocido', 'Error al eliminar el evento.'));
  }
};

// Crear evento rutinario
const createRecurringEvent = async (req, res, io) => {
  try {
    const eventData = req.body;
    const result = await eventService.createRecurringEvent(eventData);
    
    // Emitir evento para el evento padre
    io.emit('newEvent', result.parentEvent);
    
    // Emitir eventos para todas las instancias
    result.instances.forEach(instance => {
      io.emit('newEvent', instance);
    });

    res.status(201).json(formatResponse(result, 'Evento rutinario creado exitosamente.'));
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json(formatError(messages, 'Error de validación al crear el evento rutinario.'));
    }
    console.error('Error en createRecurringEvent:', error);
    res.status(400).json(formatError(error.message || 'Error desconocido', 'Error al crear el evento rutinario.'));
  }
};

// Actualizar evento rutinario
const updateRecurringEvent = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { updateType = 'single', ...eventData } = req.body;

    const [updatedCount, updatedEvents] = await eventService.updateRecurringEvent(id, eventData, updateType);

    if (updatedCount === 0) {
      const eventExists = await eventService.getEventById(id);
      if (!eventExists) {
        return res.status(404).json(formatError(null, 'Evento no encontrado.'));
      }
      return res.status(200).json(formatResponse(eventExists, 'Datos idénticos, no se realizó ninguna actualización.'));
    }

    // Emitir eventos de actualización
    if (Array.isArray(updatedEvents)) {
      updatedEvents.forEach(event => {
        io.emit('updateEvent', event);
      });
    } else if (updatedEvents[0]) {
      io.emit('updateEvent', updatedEvents[0]);
    }

    const message = updateType === 'all' 
      ? 'Evento rutinario y todas sus instancias actualizados exitosamente.'
      : 'Evento actualizado exitosamente.';
    
    res.status(200).json(formatResponse(updatedEvents, message));
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json(formatError(messages, 'Error de validación al actualizar el evento rutinario.'));
    }
    console.error('Error en updateRecurringEvent:', error);
    res.status(400).json(formatError(error.message || 'Error desconocido', 'Error al actualizar el evento rutinario.'));
  }
};

// Eliminar evento rutinario
const deleteRecurringEvent = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { deleteType = 'single' } = req.body;
    
    const deletedCount = await eventService.deleteRecurringEvent(id, deleteType);
    
    if (deletedCount === 0) {
      return res.status(404).json(formatError(null, 'Evento no encontrado.'));
    }

    // Emitir evento de eliminación
    io.emit('deleteEvent', { id, deleteType });

    const message = deleteType === 'all'
      ? 'Evento rutinario y todas sus instancias eliminados exitosamente.'
      : 'Evento eliminado exitosamente.';
    
    res.status(200).json(formatResponse(null, message));
  } catch (error) {
    console.error('Error en deleteRecurringEvent:', error);
    res.status(500).json(formatError(error.message || 'Error desconocido', 'Error al eliminar el evento rutinario.'));
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