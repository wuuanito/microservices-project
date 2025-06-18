const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Esquema de validación para switches
const switchSchema = Joi.object({
  id: Joi.string().required().max(20),
  nombre: Joi.string().required().max(100),
  ip: Joi.string().required().max(15).pattern(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
  usuario: Joi.string().required().max(50),
  password: Joi.string().required().max(100),
  modelo: Joi.string().required().max(100),
  puertos: Joi.string().required().max(10)
});

const switchUpdateSchema = switchSchema.fork(['id'], (schema) => schema.optional()).keys({
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

// GET - Obtener todos los switches
router.get('/', async (req, res) => {
  try {
    // 1) Paginación
    const validPage = Math.max(1, parseInt(req.query.page, 10) || 1);
    const validLimit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset = (validPage - 1) * validLimit;

    // 2) Orden y columnas seguras
    const cols = ['id', 'nombre', 'ip', 'usuario', 'modelo', 'puertos', 'created_at', 'updated_at'];
    const sortBy = cols.includes(req.query.sortBy) ? req.query.sortBy : 'id';
    const sortOrder = ['ASC', 'DESC'].includes(req.query.sortOrder?.toUpperCase())
                       ? req.query.sortOrder.toUpperCase()
                       : 'ASC';

    // 3) Filtro de búsqueda
    let whereSQL = '';
    const searchParams = [];
    if (req.query.search) {
      whereSQL = ` WHERE nombre LIKE ? OR ip LIKE ? OR usuario LIKE ? OR modelo LIKE ? OR puertos LIKE ?`;
      const term = `%${req.query.search}%`;
      for (let i = 0; i < 5; i++) searchParams.push(term);
    }

    // 4) Construir SQL incrustando LIMIT/OFFSET
    const dataSQL = `
      SELECT *
      FROM switches${whereSQL}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    const countSQL = `
      SELECT COUNT(*) AS total
      FROM switches${whereSQL}
    `;

    console.log('DataSQL:', dataSQL.trim());
    console.log('Params:', searchParams);

    // 5) Ejecutar consultas
    const [switches] = await req.db.execute(dataSQL, searchParams);
    const [countRow] = await req.db.execute(countSQL, searchParams);
    const totalItems = countRow[0].total;
    const totalPages = Math.ceil(totalItems / validLimit);

    // 6) Devolver paginación
    res.json({
      data: switches,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit
      }
    });

  } catch (err) {
    console.error('Error al obtener switches:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener un switch por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [switches] = await req.db.execute('SELECT * FROM switches WHERE id = ?', [id]);
    
    if (switches.length === 0) {
      return res.status(404).json({ error: 'Switch no encontrado' });
    }
    
    res.json(switches[0]);
  } catch (error) {
    console.error('Error al obtener switch:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear un nuevo switch
router.post('/', async (req, res) => {
  try {
    const { error, value } = switchSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { id, nombre, ip, usuario, password, modelo, puertos } = value;
    
    // Verificar si el ID ya existe
    const [existing] = await req.db.execute('SELECT id FROM switches WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El ID del switch ya existe' });
    }
    
    // Verificar si la IP ya existe
    const [existingIP] = await req.db.execute('SELECT id FROM switches WHERE ip = ?', [ip]);
    if (existingIP.length > 0) {
      return res.status(409).json({ error: 'La IP ya está asignada a otro switch' });
    }
    
    await req.db.execute(
      'INSERT INTO switches (id, nombre, ip, usuario, password, modelo, puertos) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, ip, usuario, password, modelo, puertos]
    );
    
    res.status(201).json({ message: 'Switch creado exitosamente', id });
  } catch (error) {
    console.error('Error al crear switch:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar un switch
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = switchUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Verificar si el switch existe
    const [existing] = await req.db.execute('SELECT id FROM switches WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Switch no encontrado' });
    }
    
    // Si se está actualizando la IP, verificar que no esté en uso
    if (value.ip) {
      const [existingIP] = await req.db.execute('SELECT id FROM switches WHERE ip = ? AND id != ?', [value.ip, id]);
      if (existingIP.length > 0) {
        return res.status(409).json({ error: 'La IP ya está asignada a otro switch' });
      }
    }
    
    // Extraer solo los campos permitidos para actualización (excluir created_at/updated_at)
    const { nombre, ip, usuario, password, modelo, puertos } = value;
    
    await req.db.execute(
      'UPDATE switches SET nombre = ?, ip = ?, usuario = ?, password = ?, modelo = ?, puertos = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nombre, ip, usuario, password, modelo, puertos, id]
    );
    
    res.json({ message: 'Switch actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar switch:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar un switch
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await req.db.execute('DELETE FROM switches WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Switch no encontrado' });
    }
    
    res.json({ message: 'Switch eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar switch:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;