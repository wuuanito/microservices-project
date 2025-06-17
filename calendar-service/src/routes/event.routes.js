const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

// Middleware para validar datos (ejemplo básico, se puede expandir)
const validateEventData = (req, res, next) => {
  const { title, responsible, startTime, endTime } = req.body;
  if (!title || !responsible || !startTime || !endTime) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: title, responsible, startTime, endTime.'
    });
  }
  // Aquí se podrían añadir más validaciones (formato de fecha, etc.)
  next();
};

// Middleware para validar datos de eventos rutinarios
const validateRecurringEventData = (req, res, next) => {
  const { title, responsible, startTime, endTime, isRecurring, recurrencePattern, recurrenceInterval } = req.body;
  
  if (!title || !responsible || !startTime || !endTime) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: title, responsible, startTime, endTime.'
    });
  }
  
  if (isRecurring) {
    if (!recurrencePattern) {
      return res.status(400).json({
        error: 'El patrón de recurrencia es obligatorio para eventos rutinarios.'
      });
    }
    
    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(recurrencePattern)) {
      return res.status(400).json({
        error: 'El patrón de recurrencia debe ser: daily, weekly, monthly o yearly.'
      });
    }
    
    if (!recurrenceInterval || recurrenceInterval < 1) {
      return res.status(400).json({
        error: 'El intervalo de recurrencia debe ser mayor a 0.'
      });
    }
  }
  
  next();
};

module.exports = (io) => {
  // Crear un nuevo evento
  router.post('/', validateEventData, (req, res) => eventController.createEvent(req, res, io));

  // Crear un evento rutinario
  router.post('/recurring', validateRecurringEventData, (req, res) => eventController.createRecurringEvent(req, res, io));

  // Obtener todos los eventos
  router.get('/', eventController.getAllEvents);

  // Obtener un evento por ID
  router.get('/:id', eventController.getEventById);

  // Actualizar un evento por ID
  router.put('/:id', validateEventData, (req, res) => eventController.updateEvent(req, res, io));

  // Actualizar evento rutinario
  router.put('/:id/recurring', (req, res) => eventController.updateRecurringEvent(req, res, io));

  // Eliminar un evento por ID (soft delete)
  router.delete('/:id', (req, res) => eventController.deleteEvent(req, res, io));

  // Eliminar evento rutinario
  router.delete('/:id/recurring', (req, res) => eventController.deleteRecurringEvent(req, res, io));

  return router;
};