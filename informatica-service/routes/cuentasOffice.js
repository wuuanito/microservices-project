const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Esquema de validación para cuentas Office
const cuentaOfficeSchema = Joi.object({
  id: Joi.string().required().max(20),
  nombre: Joi.string().email().required().max(100),
  licencia: Joi.string().required().max(100),
  estado: Joi.string().valid('Activa', 'Suspendida', 'Expirada').default('Activa'),
  fecha_expiracion: Joi.date().allow(null),
  aplicaciones: Joi.string().allow('').max(500),
  almacenamiento: Joi.string().allow('').max(20)
});

const cuentaOfficeUpdateSchema = cuentaOfficeSchema.fork(['id'], (schema) => schema.optional()).keys({
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

// GET - Obtener todas las cuentas Office
router.get('/', async (req, res) => {
  try {
    // 1) Paginación
    const validPage = Math.max(1, parseInt(req.query.page, 10) || 1);
    const validLimit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset = (validPage - 1) * validLimit;

    // 2) Orden y columnas seguras
    const cols = ['id', 'nombre', 'licencia', 'estado', 'fecha_expiracion', 'aplicaciones', 'almacenamiento', 'created_at', 'updated_at'];
    const sortBy = cols.includes(req.query.sortBy) ? req.query.sortBy : 'id';
    const sortOrder = ['ASC', 'DESC'].includes(req.query.sortOrder?.toUpperCase())
                       ? req.query.sortOrder.toUpperCase()
                       : 'ASC';

    // 3) Filtro de búsqueda
    let whereSQL = '';
    const searchParams = [];
    if (req.query.search) {
      whereSQL = ` WHERE nombre LIKE ? OR licencia LIKE ? OR estado LIKE ? OR aplicaciones LIKE ? OR almacenamiento LIKE ?`;
      const term = `%${req.query.search}%`;
      for (let i = 0; i < 5; i++) searchParams.push(term);
    }

    // 4) Construir SQL incrustando LIMIT/OFFSET
    const dataSQL = `
      SELECT *
      FROM cuentas_office${whereSQL}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    const countSQL = `
      SELECT COUNT(*) AS total
      FROM cuentas_office${whereSQL}
    `;

    console.log('DataSQL:', dataSQL.trim());
    console.log('Params:', searchParams);

    // 5) Ejecutar consultas
    const [cuentas] = await req.db.execute(dataSQL, searchParams);
    const [countRow] = await req.db.execute(countSQL, searchParams);
    const totalItems = countRow[0].total;
    const totalPages = Math.ceil(totalItems / validLimit);

    // 6) Devolver paginación
    res.json({
      data: cuentas,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit
      }
    });

  } catch (err) {
    console.error('Error al obtener cuentas Office:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener una cuenta Office por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [cuentas] = await req.db.execute('SELECT * FROM cuentas_office WHERE id = ?', [id]);
    
    if (cuentas.length === 0) {
      return res.status(404).json({ error: 'Cuenta Office no encontrada' });
    }
    
    res.json(cuentas[0]);
  } catch (error) {
    console.error('Error al obtener cuenta Office:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear una nueva cuenta Office
router.post('/', async (req, res) => {
  try {
    const { error, value } = cuentaOfficeSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { id, nombre, licencia, estado, fecha_expiracion, aplicaciones, almacenamiento } = value;
    
    // Verificar si el ID ya existe
    const [existing] = await req.db.execute('SELECT id FROM cuentas_office WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El ID de la cuenta ya existe' });
    }
    
    // Verificar si el nombre (email) ya existe
    const [existingEmail] = await req.db.execute('SELECT id FROM cuentas_office WHERE nombre = ?', [nombre]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    
    await req.db.execute(
      'INSERT INTO cuentas_office (id, nombre, licencia, estado, fecha_expiracion, aplicaciones, almacenamiento) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, licencia, estado, fecha_expiracion, aplicaciones, almacenamiento]
    );
    
    res.status(201).json({ message: 'Cuenta Office creada exitosamente', id });
  } catch (error) {
    console.error('Error al crear cuenta Office:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar una cuenta Office
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = cuentaOfficeUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Verificar si la cuenta existe
    const [existing] = await req.db.execute('SELECT id FROM cuentas_office WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Cuenta Office no encontrada' });
    }
    
    // Si se está actualizando el nombre (email), verificar que no esté en uso
    if (value.nombre) {
      const [existingEmail] = await req.db.execute('SELECT id FROM cuentas_office WHERE nombre = ? AND id != ?', [value.nombre, id]);
      if (existingEmail.length > 0) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
    }
    
    // Extraer solo los campos permitidos para actualización (excluir created_at/updated_at)
    const { nombre, licencia, estado, fecha_expiracion, aplicaciones, almacenamiento } = value;
    
    await req.db.execute(
      'UPDATE cuentas_office SET nombre = ?, licencia = ?, estado = ?, fecha_expiracion = ?, aplicaciones = ?, almacenamiento = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nombre, licencia, estado, fecha_expiracion, aplicaciones, almacenamiento, id]
    );
    
    res.json({ message: 'Cuenta Office actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cuenta Office:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar una cuenta Office
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await req.db.execute('DELETE FROM cuentas_office WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cuenta Office no encontrada' });
    }
    
    res.json({ message: 'Cuenta Office eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cuenta Office:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;