const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Esquema de validación para programas
const programaSchema = Joi.object({
  id: Joi.string().required().max(20),
  programa: Joi.string().required().max(100),
  correo: Joi.string().email().required().max(100),
  contraseña: Joi.string().required().max(100)
});

const programaUpdateSchema = programaSchema.fork(['id'], (schema) => schema.optional()).keys({
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

// GET - Obtener todos los programas
router.get('/', async (req, res) => {
  try {
    // 1) Paginación
    const validPage = Math.max(1, parseInt(req.query.page, 10) || 1);
    const validLimit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset = (validPage - 1) * validLimit;

    // 2) Orden y columnas seguras
    const cols = ['id', 'programa', 'correo', 'contraseña', 'created_at', 'updated_at'];
    const sortBy = cols.includes(req.query.sortBy) ? req.query.sortBy : 'id';
    const sortOrder = ['ASC', 'DESC'].includes(req.query.sortOrder?.toUpperCase())
                       ? req.query.sortOrder.toUpperCase()
                       : 'ASC';

    // 3) Filtro de búsqueda
    let whereSQL = '';
    const searchParams = [];
    if (req.query.search) {
      whereSQL = ` WHERE programa LIKE ? OR correo LIKE ?`;
      const term = `%${req.query.search}%`;
      for (let i = 0; i < 2; i++) searchParams.push(term);
    }

    // 4) Construir SQL incrustando LIMIT/OFFSET
    const dataSQL = `
      SELECT *
      FROM programas${whereSQL}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    const countSQL = `
      SELECT COUNT(*) AS total
      FROM programas${whereSQL}
    `;

    console.log('DataSQL:', dataSQL.trim());
    console.log('Params:', searchParams);

    // 5) Ejecutar consultas
    const [programas] = await req.db.execute(dataSQL, searchParams);
    const [countRow] = await req.db.execute(countSQL, searchParams);
    const totalItems = countRow[0].total;
    const totalPages = Math.ceil(totalItems / validLimit);

    // 6) Devolver paginación
    res.json({
      data: programas,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit
      }
    });

  } catch (err) {
    console.error('Error al obtener programas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener un programa por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [programas] = await req.db.execute('SELECT * FROM programas WHERE id = ?', [id]);
    
    if (programas.length === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }
    
    res.json(programas[0]);
  } catch (error) {
    console.error('Error al obtener programa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear un nuevo programa
router.post('/', async (req, res) => {
  try {
    const { error, value } = programaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { id, programa, correo, contraseña } = value;
    
    // Verificar si el ID ya existe
    const [existing] = await req.db.execute('SELECT id FROM programas WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El ID del programa ya existe' });
    }
    
    // Verificar si el correo ya existe para el mismo programa
    const [existingEmail] = await req.db.execute('SELECT id FROM programas WHERE programa = ? AND correo = ?', [programa, correo]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado para este programa' });
    }
    
    await req.db.execute(
      'INSERT INTO programas (id, programa, correo, contraseña) VALUES (?, ?, ?, ?)',
      [id, programa, correo, contraseña]
    );
    
    res.status(201).json({ message: 'Programa creado exitosamente', id });
  } catch (error) {
    console.error('Error al crear programa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar un programa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = programaUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Verificar si el programa existe
    const [existing] = await req.db.execute('SELECT id FROM programas WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }
    
    // Si se está actualizando el correo, verificar que no esté en uso para el mismo programa
    if (value.correo && value.programa) {
      const [existingEmail] = await req.db.execute('SELECT id FROM programas WHERE programa = ? AND correo = ? AND id != ?', [value.programa, value.correo, id]);
      if (existingEmail.length > 0) {
        return res.status(409).json({ error: 'El correo ya está registrado para este programa' });
      }
    }
    
    // Extraer solo los campos permitidos para actualización (excluir created_at/updated_at)
    const { programa, correo, contraseña } = value;
    
    await req.db.execute(
      'UPDATE programas SET programa = ?, correo = ?, contraseña = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [programa, correo, contraseña, id]
    );
    
    res.json({ message: 'Programa actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar programa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar un programa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await req.db.execute('DELETE FROM programas WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }
    
    res.json({ message: 'Programa eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar programa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;