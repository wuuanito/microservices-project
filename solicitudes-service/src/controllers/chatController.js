const { Message, Solicitud } = require('../models');
const path = require('path');

const createMessage = async (req, res) => {
  try {
    const { solicitudId } = req.params;
    const { usuario, mensaje } = req.body;

    // Verificar que la solicitud existe
    if (solicitudId) {
      const solicitud = await Solicitud.findByPk(solicitudId);
      if (!solicitud) {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
      }
    }

    let archivos = [];

    if (req.files && req.files.length > 0) {
      archivos = req.files.map(file => ({
        nombre: file.originalname,
        url: `/uploads/${file.filename}`,
        tipo: file.mimetype
      }));
    }

    const nuevo = await Message.create({
      usuario,
      mensaje,
      solicitudId: solicitudId || null,
      archivos
    });

    res.status(201).json(nuevo);
  } catch (err) {
    console.error('💥 Error al guardar mensaje:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Obtener mensajes de una solicitud específica
const getMessagesBySolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;
    
    // Verificar que la solicitud existe
    const solicitud = await Solicitud.findByPk(solicitudId);
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const mensajes = await Message.findAll({ 
      where: { solicitudId },
      order: [['fecha', 'ASC']] 
    });
    
    res.json(mensajes);
  } catch (err) {
    console.error('💥 Error al obtener mensajes de solicitud:', err);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

// Obtener todos los mensajes (para compatibilidad)
const getMessages = async (req, res) => {
  try {
    const mensajes = await Message.findAll({ order: [['fecha', 'ASC']] });
    res.json(mensajes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

module.exports = {
  createMessage,
  getMessages,
  getMessagesBySolicitud
};
