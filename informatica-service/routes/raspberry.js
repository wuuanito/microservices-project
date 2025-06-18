const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Esquema de validación para Raspberry Pi
const raspberrySchema = Joi.object({
  id: Joi.string().required().max(20),
  nombre: Joi.string().required().max(100),
  ip: Joi.string().required().max(15).pattern(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
  modelo: Joi.string().required().max(100),
  uso: Joi.string().required().max(100),
  estado: Joi.string().valid('Activo', 'Inactivo', 'Configuración', 'Mantenimiento').default('Activo'),
  ubicacion: Joi.string().required().max(100),
  usuario: Joi.string().required().max(50),
  password: Joi.string().required().max(100)
});

const raspberryUpdateSchema = raspberrySchema.fork(['id'], (schema) => schema.optional()).keys({
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

// GET - Obtener todos los dispositivos Raspberry Pi
router.get('/', async (req, res) => {
  try {
    // 1) Paginación
    const validPage = Math.max(1, parseInt(req.query.page, 10) || 1);
    const validLimit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset = (validPage - 1) * validLimit;

    // 2) Orden y columnas seguras
    const cols = ['id', 'nombre', 'ip', 'modelo', 'uso', 'estado', 'ubicacion', 'usuario', 'password', 'created_at', 'updated_at'];
    const sortBy = cols.includes(req.query.sortBy) ? req.query.sortBy : 'id';
    const sortOrder = ['ASC', 'DESC'].includes(req.query.sortOrder?.toUpperCase())
                       ? req.query.sortOrder.toUpperCase()
                       : 'ASC';

    // 3) Filtro de búsqueda
    let whereSQL = '';
    const searchParams = [];
    if (req.query.search) {
      whereSQL = ` WHERE nombre LIKE ? OR ip LIKE ? OR modelo LIKE ? OR uso LIKE ? OR estado LIKE ? OR ubicacion LIKE ? OR usuario LIKE ?`;
      const term = `%${req.query.search}%`;
      for (let i = 0; i < 7; i++) searchParams.push(term);
    }

    // 4) Construir SQL incrustando LIMIT/OFFSET
    const dataSQL = `
      SELECT *
      FROM raspberry${whereSQL}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    const countSQL = `
      SELECT COUNT(*) AS total
      FROM raspberry${whereSQL}
    `;

    console.log('DataSQL:', dataSQL.trim());
    console.log('Params:', searchParams);

    // 5) Ejecutar consultas
    const [raspberries] = await req.db.execute(dataSQL, searchParams);
    const [countRow] = await req.db.execute(countSQL, searchParams);
    const totalItems = countRow[0].total;
    const totalPages = Math.ceil(totalItems / validLimit);

    // 6) Devolver paginación
    res.json({
      data: raspberries,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit
      }
    });

  } catch (err) {
    console.error('Error al obtener dispositivos Raspberry Pi:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener un dispositivo Raspberry Pi por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [raspberries] = await req.db.execute('SELECT * FROM raspberry WHERE id = ?', [id]);
    
    if (raspberries.length === 0) {
      return res.status(404).json({ error: 'Dispositivo Raspberry Pi no encontrado' });
    }
    
    res.json(raspberries[0]);
  } catch (error) {
    console.error('Error al obtener dispositivo Raspberry Pi:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear un nuevo dispositivo Raspberry Pi
router.post('/', async (req, res) => {
  try {
    const { error, value } = raspberrySchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { id, nombre, ip, modelo, uso, estado, ubicacion, usuario, password } = value;
    
    // Verificar si el ID ya existe
    const [existing] = await req.db.execute('SELECT id FROM raspberry WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El ID del dispositivo Raspberry Pi ya existe' });
    }
    
    // Verificar si la IP ya existe
    const [existingIP] = await req.db.execute('SELECT id FROM raspberry WHERE ip = ?', [ip]);
    if (existingIP.length > 0) {
      return res.status(409).json({ error: 'La IP ya está asignada a otro dispositivo Raspberry Pi' });
    }
    
    await req.db.execute(
      'INSERT INTO raspberry (id, nombre, ip, modelo, uso, estado, ubicacion, usuario, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, ip, modelo, uso, estado, ubicacion, usuario, password]
    );
    
    res.status(201).json({ message: 'Dispositivo Raspberry Pi creado exitosamente', id });
  } catch (error) {
    console.error('Error al crear dispositivo Raspberry Pi:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar un dispositivo Raspberry Pi
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = raspberryUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Verificar si el dispositivo existe
    const [existing] = await req.db.execute('SELECT id FROM raspberry WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Dispositivo Raspberry Pi no encontrado' });
    }
    
    // Si se está actualizando la IP, verificar que no esté en uso
    if (value.ip) {
      const [existingIP] = await req.db.execute('SELECT id FROM raspberry WHERE ip = ? AND id != ?', [value.ip, id]);
      if (existingIP.length > 0) {
        return res.status(409).json({ error: 'La IP ya está asignada a otro dispositivo Raspberry Pi' });
      }
    }
    
    // Extraer solo los campos permitidos para actualización (excluir created_at/updated_at)
    const { nombre, ip, ubicacion, usuario, contraseña, proposito, estado } = value;
    
    await req.db.execute(
      'UPDATE raspberry SET nombre = ?, ip = ?, ubicacion = ?, usuario = ?, contraseña = ?, proposito = ?, estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nombre, ip, ubicacion, usuario, contraseña, proposito, estado, id]
    );
    
    res.json({ message: 'Dispositivo Raspberry Pi actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar dispositivo Raspberry Pi:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar un dispositivo Raspberry Pi
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await req.db.execute('DELETE FROM raspberry WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dispositivo Raspberry Pi no encontrado' });
    }
    
    res.json({ message: 'Dispositivo Raspberry Pi eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar dispositivo Raspberry Pi:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;