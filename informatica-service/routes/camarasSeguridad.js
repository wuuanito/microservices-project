const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Esquema de validación para cámaras de seguridad
const camaraSeguridadSchema = Joi.object({
  id: Joi.string().required().max(20),
  ip: Joi.string().required().max(15).pattern(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
  ubicacion: Joi.string().required().max(100),
  usuario: Joi.string().required().max(50),
  contraseña: Joi.string().required().max(100)
});

const camaraSeguridadUpdateSchema = camaraSeguridadSchema.fork(['id'], (schema) => schema.optional()).keys({
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

// GET - Obtener todas las cámaras de seguridad
router.get('/', async (req, res) => {
  try {
    // 1) Paginación
    const validPage = Math.max(1, parseInt(req.query.page, 10) || 1);
    const validLimit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset = (validPage - 1) * validLimit;

    // 2) Orden y columnas seguras
    const cols = ['id', 'ip', 'ubicacion', 'usuario', 'contraseña', 'created_at', 'updated_at'];
    const sortBy = cols.includes(req.query.sortBy) ? req.query.sortBy : 'id';
    const sortOrder = ['ASC', 'DESC'].includes(req.query.sortOrder?.toUpperCase())
                       ? req.query.sortOrder.toUpperCase()
                       : 'ASC';

    // 3) Filtro de búsqueda
    let whereSQL = '';
    const searchParams = [];
    if (req.query.search) {
      whereSQL = ` WHERE ip LIKE ? OR ubicacion LIKE ? OR usuario LIKE ?`;
      const term = `%${req.query.search}%`;
      for (let i = 0; i < 3; i++) searchParams.push(term);
    }

    // 4) Construir SQL incrustando LIMIT/OFFSET
    const dataSQL = `
      SELECT *
      FROM camaras_seguridad${whereSQL}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    const countSQL = `
      SELECT COUNT(*) AS total
      FROM camaras_seguridad${whereSQL}
    `;

    console.log('DataSQL:', dataSQL.trim());
    console.log('Params:', searchParams);

    // 5) Ejecutar consultas
    const [camaras] = await req.db.execute(dataSQL, searchParams);
    const [countRow] = await req.db.execute(countSQL, searchParams);
    const totalItems = countRow[0].total;
    const totalPages = Math.ceil(totalItems / validLimit);

    // 6) Devolver paginación
    res.json({
      data: camaras,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit
      }
    });

  } catch (err) {
    console.error('Error al obtener cámaras de seguridad:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener una cámara de seguridad por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [camaras] = await req.db.execute('SELECT * FROM camaras_seguridad WHERE id = ?', [id]);
    
    if (camaras.length === 0) {
      return res.status(404).json({ error: 'Cámara de seguridad no encontrada' });
    }
    
    res.json(camaras[0]);
  } catch (error) {
    console.error('Error al obtener cámara de seguridad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear una nueva cámara de seguridad
router.post('/', async (req, res) => {
  try {
    const { error, value } = camaraSeguridadSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { id, ip, ubicacion, usuario, contraseña } = value;
    
    // Verificar si el ID ya existe
    const [existing] = await req.db.execute('SELECT id FROM camaras_seguridad WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El ID de la cámara ya existe' });
    }
    
    // Verificar si la IP ya existe
    const [existingIP] = await req.db.execute('SELECT id FROM camaras_seguridad WHERE ip = ?', [ip]);
    if (existingIP.length > 0) {
      return res.status(409).json({ error: 'La IP ya está asignada a otra cámara' });
    }
    
    await req.db.execute(
      'INSERT INTO camaras_seguridad (id, ip, ubicacion, usuario, contraseña) VALUES (?, ?, ?, ?, ?)',
      [id, ip, ubicacion, usuario, contraseña]
    );
    
    res.status(201).json({ message: 'Cámara de seguridad creada exitosamente', id });
  } catch (error) {
    console.error('Error al crear cámara de seguridad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar una cámara de seguridad
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = camaraSeguridadUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Verificar si la cámara existe
    const [existing] = await req.db.execute('SELECT id FROM camaras_seguridad WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Cámara de seguridad no encontrada' });
    }
    
    // Si se está actualizando la IP, verificar que no esté en uso
    if (value.ip) {
      const [existingIP] = await req.db.execute('SELECT id FROM camaras_seguridad WHERE ip = ? AND id != ?', [value.ip, id]);
      if (existingIP.length > 0) {
        return res.status(409).json({ error: 'La IP ya está asignada a otra cámara' });
      }
    }
    
    // Extraer solo los campos permitidos para actualización (excluir created_at/updated_at)
    const { ip, ubicacion, usuario, contraseña } = value;
    
    await req.db.execute(
      'UPDATE camaras_seguridad SET ip = ?, ubicacion = ?, usuario = ?, contraseña = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [ip, ubicacion, usuario, contraseña, id]
    );
    
    res.json({ message: 'Cámara de seguridad actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cámara de seguridad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar una cámara de seguridad
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await req.db.execute('DELETE FROM camaras_seguridad WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cámara de seguridad no encontrada' });
    }
    
    res.json({ message: 'Cámara de seguridad eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cámara de seguridad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;