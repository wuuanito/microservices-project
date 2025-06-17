const db = require('../models');

// Obtener todas las solicitudes con sus mensajes relacionados
exports.getAllSolicitudes = async (req, res) => {
  try {
    const solicitudes = await db.Solicitud.findAll({
      include: {
        model: db.Message,
        as: 'mensajes'
      },
      order: [['createdAt', 'DESC']]
    });
    res.json(solicitudes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
};

// Crear una nueva solicitud
exports.createSolicitud = async (req, res) => {
  try {
    let payload = req.body;

    // Validación extra por si frontend envía 'Invalid date'
    if (!payload.fecha || payload.fecha === 'Invalid date') {
      delete payload.fecha; // Sequelize usará defaultValue
    }

    const nueva = await db.Solicitud.create(payload);
    res.status(201).json(nueva);
  } catch (err) {
    console.error('❌ Error creando solicitud:', err);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  }
};
