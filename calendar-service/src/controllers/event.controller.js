const eventService = require('../services/event.service'); // Asegúrate que la ruta sea correcta
const { formatResponse, formatError } = require('../utils/response-formatter'); // Asegúrate que la ruta sea correcta

// Crear un nuevo evento
const createEvent = async (req, res, next) => {
  try {
    const eventData = req.body; // eventData ahora debería incluir eventType desde el cliente
    // Si necesitas agregar el ID del usuario creador desde la autenticación:
    // if (req.user && req.user.id) {
    //   eventData.createdBy = req.user.id;
    // }
    const event = await eventService.createEvent(eventData);
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
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventData = req.body; // eventData ahora podría incluir eventType para actualizar
    // Si necesitas agregar el ID del usuario que actualiza desde la autenticación:
    // if (req.user && req.user.id) {
    //   eventData.updatedBy = req.user.id;
    // }

    const [updatedCount, updatedEvents] = await eventService.updateEvent(id, eventData);

    if (updatedCount === 0) {
      // Podría ser que el evento no exista o que los datos enviados sean idénticos a los existentes.
      // Para diferenciar, podrías primero buscar el evento.
      const eventExists = await eventService.getEventById(id);
      if (!eventExists) {
        return res.status(404).json(formatError(null, 'Evento no encontrado.'));
      }
      return res.status(200).json(formatResponse(eventExists, 'Datos idénticos, no se realizó ninguna actualización.'));
    }
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
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedCount = await eventService.deleteEvent(id); // Asume que deleteEvent devuelve el número de filas afectadas
    if (deletedCount === 0) {
      return res.status(404).json(formatError(null, 'Evento no encontrado.'));
    }
    // No hay cuerpo de respuesta para 204, pero si usas 200 como en tu original:
    res.status(200).json(formatResponse(null, 'Evento eliminado exitosamente (marcado como eliminado).'));
    // Alternativamente, para DELETE es común usar 204 No Content
    // res.status(204).send();
  } catch (error) {
    // next(error);
    console.error('Error en deleteEvent:', error);
    res.status(500).json(formatError(error.message || 'Error desconocido', 'Error al eliminar el evento.'));
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};