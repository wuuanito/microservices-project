const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Esquema de validación para equipos
const equipoSchema = Joi.object({
  id: Joi.string().required().max(20),
  nombre: Joi.string().required().max(100),
  ip: Joi.string().required().max(15).pattern(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
  usuario: Joi.string().required().max(50),
  password: Joi.string().required().max(100),
  tipo: Joi.string().required().max(50),
  ubicacion: Joi.string().required().max(100)
});

const equipoUpdateSchema = equipoSchema.fork(['id'], (schema) => schema.optional()).keys({
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

// GET - Obtener todos los equipos
router.get('/', async (req, res) => {
  try {
    // 1) Paginación
    const validPage  = Math.max(1,   parseInt(req.query.page,  10) || 1);
    const validLimit = Math.max(1,   Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset     = (validPage - 1) * validLimit;

    // 2) Orden y columnas seguras
    const cols       = ['id','nombre','ip','usuario','tipo','ubicacion','created_at','updated_at'];
    const sortBy     = cols.includes(req.query.sortBy)      ? req.query.sortBy      : 'id';
    const sortOrder  = ['ASC','DESC'].includes(req.query.sortOrder?.toUpperCase())
                         ? req.query.sortOrder.toUpperCase()
                         : 'ASC';

    // 3) Filtro de búsqueda
    let whereSQL     = '';
    const searchParams = [];
    if (req.query.search) {
      whereSQL = ` WHERE nombre LIKE ? OR ip LIKE ? OR usuario LIKE ? OR tipo LIKE ? OR ubicacion LIKE ?`;
      const term = `%${req.query.search}%`;
      for (let i = 0; i < 5; i++) searchParams.push(term);
    }

    // 4) Construir SQL incrustando LIMIT/OFFSET
    const dataSQL = `
      SELECT * 
      FROM equipos${whereSQL}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    const countSQL = `
      SELECT COUNT(*) AS total
      FROM equipos${whereSQL}
    `;

    console.log('DataSQL:', dataSQL.trim());
    console.log('Params:', searchParams);

    // 5) Ejecutar consultas
    const [equipos]  = await req.db.execute(dataSQL,  searchParams);
    const [countRow] = await req.db.execute(countSQL, searchParams);
    const totalItems = countRow[0].total;
    const totalPages = Math.ceil(totalItems / validLimit);

    // 6) Devolver paginación
    res.json({
      data: equipos,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit
      }
    });

  } catch (err) {
    console.error('Error al obtener equipos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// GET - Obtener un equipo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [equipos] = await req.db.execute('SELECT * FROM equipos WHERE id = ?', [id]);
    
    if (equipos.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    res.json(equipos[0]);
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear un nuevo equipo
router.post('/', async (req, res) => {
  try {
    const { error, value } = equipoSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { id, nombre, ip, usuario, password, tipo, ubicacion } = value;
    
    // Verificar si el ID ya existe
    const [existing] = await req.db.execute('SELECT id FROM equipos WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El ID del equipo ya existe' });
    }
    
    // Verificar si la IP ya existe
    const [existingIP] = await req.db.execute('SELECT id FROM equipos WHERE ip = ?', [ip]);
    if (existingIP.length > 0) {
      return res.status(409).json({ error: 'La IP ya está asignada a otro equipo' });
    }
    
    await req.db.execute(
      'INSERT INTO equipos (id, nombre, ip, usuario, password, tipo, ubicacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, ip, usuario, password, tipo, ubicacion]
    );
    
    res.status(201).json({ message: 'Equipo creado exitosamente', id });
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar un equipo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = equipoUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Verificar si el equipo existe
    const [existing] = await req.db.execute('SELECT id FROM equipos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    // Si se está actualizando la IP, verificar que no esté en uso
    if (value.ip) {
      const [existingIP] = await req.db.execute('SELECT id FROM equipos WHERE ip = ? AND id != ?', [value.ip, id]);
      if (existingIP.length > 0) {
        return res.status(409).json({ error: 'La IP ya está asignada a otro equipo' });
      }
    }
    
    // Extraer solo los campos permitidos para actualización (excluir created_at/updated_at)
    const { nombre, ip, usuario, password, tipo, ubicacion } = value;
    
    await req.db.execute(
      'UPDATE equipos SET nombre = ?, ip = ?, usuario = ?, password = ?, tipo = ?, ubicacion = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nombre, ip, usuario, password, tipo, ubicacion, id]
    );
    
    res.json({ message: 'Equipo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar un equipo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await req.db.execute('DELETE FROM equipos WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;