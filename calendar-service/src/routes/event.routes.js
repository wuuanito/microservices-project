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

// Crear un nuevo evento
router.post('/', validateEventData, eventController.createEvent);

// Obtener todos los eventos
router.get('/', eventController.getAllEvents);

// Obtener un evento por ID
router.get('/:id', eventController.getEventById);

// Actualizar un evento por ID
router.put('/:id', validateEventData, eventController.updateEvent);

// Eliminar un evento por ID (soft delete)
router.delete('/:id', eventController.deleteEvent);

module.exports = router;