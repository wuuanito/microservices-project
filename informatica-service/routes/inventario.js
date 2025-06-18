const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Esquema de validación para inventario
const inventarioSchema = Joi.object({
  nombre: Joi.string().required().max(100),
  descripcion: Joi.string().required().max(255),
  cantidad: Joi.number().integer().min(0).required()
});

const inventarioUpdateSchema = inventarioSchema.keys({
  id: Joi.number().integer().optional(),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

// GET - Obtener todos los elementos del inventario
router.get('/', async (req, res) => {
  try {
    // 1) Paginación
    const validPage = Math.max(1, parseInt(req.query.page, 10) || 1);
    const validLimit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset = (validPage - 1) * validLimit;

    // 2) Orden y columnas seguras
    const cols = ['id', 'nombre', 'descripcion', 'cantidad', 'created_at', 'updated_at'];
    const sortBy = cols.includes(req.query.sortBy) ? req.query.sortBy : 'id';
    const sortOrder = ['ASC', 'DESC'].includes(req.query.sortOrder?.toUpperCase())
      ? req.query.sortOrder.toUpperCase()
      : 'ASC';

    // 3) Filtro de búsqueda
    let whereSQL = '';
    const searchParams = [];
    if (req.query.search) {
      whereSQL = ` WHERE nombre LIKE ? OR descripcion LIKE ?`;
      const term = `%${req.query.search}%`;
      searchParams.push(term, term);
    }

    // 4) Construir SQL
    const dataSQL = `
      SELECT * 
      FROM inventario${whereSQL}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    const countSQL = `
      SELECT COUNT(*) AS total
      FROM inventario${whereSQL}
    `;

    console.log('DataSQL:', dataSQL.trim());
    console.log('Params:', searchParams);

    // 5) Ejecutar consultas
    const [items] = await req.db.execute(dataSQL, searchParams);
    const [countRow] = await req.db.execute(countSQL, searchParams);
    const totalItems = countRow[0].total;
    const totalPages = Math.ceil(totalItems / validLimit);

    // 6) Devolver paginación
    res.json({
      data: items,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit
      }
    });

  } catch (err) {
    console.error('Error al obtener inventario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener un elemento del inventario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await req.db.execute('SELECT * FROM inventario WHERE id = ?', [id]);
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }
    
    res.json(items[0]);
  } catch (error) {
    console.error('Error al obtener elemento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear un nuevo elemento en el inventario
router.post('/', async (req, res) => {
  try {
    const { error, value } = inventarioSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { nombre, descripcion, cantidad } = value;
    
    const [result] = await req.db.execute(
      'INSERT INTO inventario (nombre, descripcion, cantidad) VALUES (?, ?, ?)',
      [nombre, descripcion, cantidad]
    );
    
    res.status(201).json({ 
      message: 'Elemento creado exitosamente', 
      id: result.insertId,
      data: { id: result.insertId, nombre, descripcion, cantidad }
    });
  } catch (error) {
    console.error('Error al crear elemento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar un elemento del inventario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = inventarioUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Verificar si el elemento existe
    const [existing] = await req.db.execute('SELECT id FROM inventario WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }
    
    const { nombre, descripcion, cantidad } = value;
    
    await req.db.execute(
      'UPDATE inventario SET nombre = ?, descripcion = ?, cantidad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nombre, descripcion, cantidad, id]
    );
    
    res.json({ message: 'Elemento actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar elemento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH - Actualizar solo la cantidad de un elemento
router.patch('/:id/cantidad', async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    
    // Validar cantidad
    if (typeof cantidad !== 'number' || cantidad < 0) {
      return res.status(400).json({ error: 'La cantidad debe ser un número mayor o igual a 0' });
    }
    
    // Verificar si el elemento existe
    const [existing] = await req.db.execute('SELECT id FROM inventario WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }
    
    await req.db.execute(
      'UPDATE inventario SET cantidad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [cantidad, id]
    );
    
    res.json({ message: 'Cantidad actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH - Incrementar cantidad
router.patch('/:id/incrementar', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el elemento existe
    const [existing] = await req.db.execute('SELECT id, cantidad FROM inventario WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }
    
    await req.db.execute(
      'UPDATE inventario SET cantidad = cantidad + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    // Obtener la nueva cantidad
    const [updated] = await req.db.execute('SELECT cantidad FROM inventario WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Cantidad incrementada exitosamente',
      nuevaCantidad: updated[0].cantidad
    });
  } catch (error) {
    console.error('Error al incrementar cantidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH - Decrementar cantidad
router.patch('/:id/decrementar', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el elemento existe y obtener cantidad actual
    const [existing] = await req.db.execute('SELECT id, cantidad FROM inventario WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }
    
    const cantidadActual = existing[0].cantidad;
    if (cantidadActual <= 0) {
      return res.status(400).json({ error: 'No se puede decrementar, la cantidad ya es 0' });
    }
    
    await req.db.execute(
      'UPDATE inventario SET cantidad = cantidad - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    // Obtener la nueva cantidad
    const [updated] = await req.db.execute('SELECT cantidad FROM inventario WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Cantidad decrementada exitosamente',
      nuevaCantidad: updated[0].cantidad
    });
  } catch (error) {
    console.error('Error al decrementar cantidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar un elemento del inventario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await req.db.execute('DELETE FROM inventario WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }
    
    res.json({ message: 'Elemento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar elemento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;