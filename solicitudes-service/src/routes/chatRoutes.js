const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const chatController = require('../controllers/chatController');

// GET mensajes de una solicitud específica
router.get('/mensajes/:solicitudId', chatController.getMessagesBySolicitud);

// POST mensaje con archivos para una solicitud específica
router.post('/mensajes/:solicitudId', upload.array('archivos'), chatController.createMessage);

// GET todos los mensajes (mantener para compatibilidad)
router.get('/mensajes', chatController.getMessages);

module.exports = router;
