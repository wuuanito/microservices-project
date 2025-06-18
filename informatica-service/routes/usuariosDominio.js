const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Esquema de validación para usuarios de dominio
const usuarioDominioSchema = Joi.object({
  id: Joi.string().required().max(20),
  nombre: Joi.string().required().max(100),
  email: Joi.string().email().required().max(100),
  departamento: Joi.string().required().max(50),
  estado: Joi.string().valid('Activo', 'Inactivo').default('Activo'),
  ultimo_acceso: Joi.date().allow(null),
  grupos: Joi.string().allow('').max(500)
});

const usuarioDominioUpdateSchema = usuarioDominioSchema.fork(['id'], (schema) => schema.optional()).keys({
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

// GET - Obtener todos los usuarios de dominio
router.get('/', async (req, res) => {
  try {
    // 1) Paginación
    const validPage = Math.max(1, parseInt(req.query.page, 10) || 1);
    const validLimit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset = (validPage - 1) * validLimit;

    // 2) Orden y columnas seguras
    const cols = ['id', 'nombre', 'usuario', 'email', 'departamento', 'activo', 'created_at', 'updated_at'];
    const sortBy = cols.includes(req.query.sortBy) ? req.query.sortBy : 'id';
    const sortOrder = ['ASC', 'DESC'].includes(req.query.sortOrder?.toUpperCase())
                       ? req.query.sortOrder.toUpperCase()
                       : 'ASC';

    // 3) Filtro de búsqueda
    let whereSQL = '';
    const searchParams = [];
    if (req.query.search) {
      whereSQL = ` WHERE nombre LIKE ? OR usuario LIKE ? OR email LIKE ? OR departamento LIKE ?`;
      const term = `%${req.query.search}%`;
      for (let i = 0; i < 4; i++) searchParams.push(term);
    }

    // 4) Construir SQL incrustando LIMIT/OFFSET
    const dataSQL = `
      SELECT *
      FROM usuarios_dominio${whereSQL}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    const countSQL = `
      SELECT COUNT(*) AS total
      FROM usuarios_dominio${whereSQL}
    `;

    console.log('DataSQL:', dataSQL.trim());
    console.log('Params:', searchParams);

    // 5) Ejecutar consultas
    const [usuarios] = await req.db.execute(dataSQL, searchParams);
    const [countRow] = await req.db.execute(countSQL, searchParams);
    const totalItems = countRow[0].total;
    const totalPages = Math.ceil(totalItems / validLimit);

    // 6) Devolver paginación
    res.json({
      data: usuarios,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit
      }
    });

  } catch (err) {
    console.error('Error al obtener usuarios de dominio:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener un usuario de dominio por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [usuarios] = await req.db.execute('SELECT * FROM usuarios_dominio WHERE id = ?', [id]);
    
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario de dominio no encontrado' });
    }
    
    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener usuario de dominio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear un nuevo usuario de dominio
router.post('/', async (req, res) => {
  try {
    const { error, value } = usuarioDominioSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { id, nombre, email, departamento, estado, ultimo_acceso, grupos } = value;
    
    // Verificar si el ID ya existe
    const [existing] = await req.db.execute('SELECT id FROM usuarios_dominio WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El ID del usuario ya existe' });
    }
    
    // Verificar si el email ya existe
    const [existingEmail] = await req.db.execute('SELECT id FROM usuarios_dominio WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    
    await req.db.execute(
      'INSERT INTO usuarios_dominio (id, nombre, email, departamento, estado, ultimo_acceso, grupos) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, email, departamento, estado, ultimo_acceso, grupos]
    );
    
    res.status(201).json({ message: 'Usuario de dominio creado exitosamente', id });
  } catch (error) {
    console.error('Error al crear usuario de dominio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar un usuario de dominio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = usuarioDominioUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Verificar si el usuario existe
    const [existing] = await req.db.execute('SELECT id FROM usuarios_dominio WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Usuario de dominio no encontrado' });
    }
    
    // Si se está actualizando el email, verificar que no esté en uso
    if (value.email) {
      const [existingEmail] = await req.db.execute('SELECT id FROM usuarios_dominio WHERE email = ? AND id != ?', [value.email, id]);
      if (existingEmail.length > 0) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
    }
    
    // Extraer solo los campos permitidos para actualización (excluir created_at/updated_at)
    const { nombre, email, departamento, estado, ultimo_acceso, grupos } = value;
    
    await req.db.execute(
      'UPDATE usuarios_dominio SET nombre = ?, email = ?, departamento = ?, estado = ?, ultimo_acceso = ?, grupos = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nombre, email, departamento, estado, ultimo_acceso, grupos, id]
    );
    
    res.json({ message: 'Usuario de dominio actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario de dominio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar un usuario de dominio
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await req.db.execute('DELETE FROM usuarios_dominio WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario de dominio no encontrado' });
    }
    
    res.json({ message: 'Usuario de dominio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario de dominio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;