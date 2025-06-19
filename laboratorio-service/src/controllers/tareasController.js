const Tarea = require('../models/Tarea');
const { Op } = require('sequelize');

// Obtener todas las tareas con filtros opcionales
const obtenerTareas = async (req, res) => {
  try {
    const { estado, prioridad, asignado, fechaDesde, fechaHasta, page = 1, limit = 50 } = req.query;
    
    // Construir condiciones de filtro
    const whereConditions = {};
    
    if (estado && estado !== 'todas') {
      whereConditions.estado = estado;
    }
    
    if (prioridad) {
      whereConditions.prioridad = prioridad;
    }
    
    if (asignado) {
      whereConditions.asignado = {
        [Op.iLike]: `%${asignado}%`
      };
    }
    
    if (fechaDesde || fechaHasta) {
      whereConditions.fechaVencimiento = {};
      if (fechaDesde) {
        whereConditions.fechaVencimiento[Op.gte] = fechaDesde;
      }
      if (fechaHasta) {
        whereConditions.fechaVencimiento[Op.lte] = fechaHasta;
      }
    }
    
    // Calcular offset para paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: tareas } = await Tarea.findAndCountAll({
      where: whereConditions,
      order: [
        ['estado', 'ASC'], // Pendientes primero
        ['prioridad', 'DESC'], // Alta prioridad primero
        ['fechaVencimiento', 'ASC'] // Más próximas primero
      ],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.status(200).json({
      success: true,
      data: tareas,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener una tarea por ID
const obtenerTareaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tarea = await Tarea.findByPk(id);
    
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tarea
    });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nueva tarea
const crearTarea = async (req, res) => {
  try {
    const { titulo, descripcion, asignado, prioridad, fechaVencimiento, comentarios } = req.body;
    
    // Validaciones básicas
    if (!titulo || !asignado) {
      return res.status(400).json({
        success: false,
        message: 'Título y asignado son campos obligatorios'
      });
    }
    
    const nuevaTarea = await Tarea.create({
      titulo,
      descripcion,
      asignado,
      prioridad: prioridad || 'media',
      fechaVencimiento,
      comentarios,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString().split('T')[0]
    });
    
    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: nuevaTarea
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar tarea
const actualizarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, asignado, prioridad, fechaVencimiento, comentarios } = req.body;
    
    const tarea = await Tarea.findByPk(id);
    
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Actualizar campos
    await tarea.update({
      titulo: titulo || tarea.titulo,
      descripcion: descripcion !== undefined ? descripcion : tarea.descripcion,
      asignado: asignado || tarea.asignado,
      prioridad: prioridad || tarea.prioridad,
      fechaVencimiento: fechaVencimiento !== undefined ? fechaVencimiento : tarea.fechaVencimiento,
      comentarios: comentarios !== undefined ? comentarios : tarea.comentarios
    });
    
    res.status(200).json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: tarea
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado de tarea
const cambiarEstadoTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado || !['pendiente', 'en_progreso', 'completada'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: pendiente, en_progreso o completada'
      });
    }
    
    const tarea = await Tarea.findByPk(id);
    
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    await tarea.cambiarEstado(estado);
    
    res.status(200).json({
      success: true,
      message: `Tarea marcada como ${estado}`,
      data: tarea
    });
  } catch (error) {
    console.error('Error al cambiar estado de tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar tarea
const eliminarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tarea = await Tarea.findByPk(id);
    
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    await tarea.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de tareas
const obtenerEstadisticas = async (req, res) => {
  try {
    const [total, pendientes, enProgreso, completadas] = await Promise.all([
      Tarea.count(),
      Tarea.count({ where: { estado: 'pendiente' } }),
      Tarea.count({ where: { estado: 'en_progreso' } }),
      Tarea.count({ where: { estado: 'completada' } })
    ]);
    
    // Obtener tareas vencidas
    const hoy = new Date().toISOString().split('T')[0];
    const vencidas = await Tarea.count({
      where: {
        fechaVencimiento: {
          [Op.lt]: hoy
        },
        estado: {
          [Op.ne]: 'completada'
        }
      }
    });
    
    // Estadísticas por prioridad
    const [alta, media, baja] = await Promise.all([
      Tarea.count({ where: { prioridad: 'alta', estado: { [Op.ne]: 'completada' } } }),
      Tarea.count({ where: { prioridad: 'media', estado: { [Op.ne]: 'completada' } } }),
      Tarea.count({ where: { prioridad: 'baja', estado: { [Op.ne]: 'completada' } } })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total,
        porEstado: {
          pendientes,
          enProgreso,
          completadas
        },
        vencidas,
        porPrioridad: {
          alta,
          media,
          baja
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener tareas vencidas
const obtenerTareasVencidas = async (req, res) => {
  try {
    const tareasVencidas = await Tarea.obtenerVencidas();
    
    res.status(200).json({
      success: true,
      data: tareasVencidas
    });
  } catch (error) {
    console.error('Error al obtener tareas vencidas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  obtenerTareas,
  obtenerTareaPorId,
  crearTarea,
  actualizarTarea,
  cambiarEstadoTarea,
  eliminarTarea,
  obtenerEstadisticas,
  obtenerTareasVencidas
};