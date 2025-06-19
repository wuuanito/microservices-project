const Defecto = require('../models/Defecto');
const { deleteFile } = require('../middleware/upload');
const { Op } = require('sequelize');

// @desc    Obtener todos los defectos con paginación y filtros
// @route   GET /api/defectos
// @access  Public
const getDefectos = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      tipoArticulo,
      tipoDesviacion,
      decision,
      estado,
      search
    } = req.validatedQuery;

    // Construir filtros
    const where = { estado };
    
    if (tipoArticulo) where.tipoArticulo = tipoArticulo;
    if (tipoDesviacion) where.tipoDesviacion = tipoDesviacion;
    if (decision) where.decision = decision;
    
    // Búsqueda de texto
    if (search) {
      where[Op.or] = [
        { codigoDefecto: { [Op.like]: `%${search}%` } },
        { descripcionArticulo: { [Op.like]: `%${search}%` } },
        { descripcionDefecto: { [Op.like]: `%${search}%` } },
        { codigo: { [Op.like]: `%${search}%` } }
      ];
    }

    // Configurar ordenamiento - mapear nombres de campos
    const sortFieldMap = {
      'fechaCreacion': 'createdAt',
      'createdAt': 'createdAt',
      'codigoDefecto': 'codigoDefecto',
      'tipoDesviacion': 'tipoDesviacion',
      'decision': 'decision'
    };
    
    const actualSortField = sortFieldMap[sortBy] || sortBy;
    const order = [[actualSortField, sortOrder.toUpperCase()]];

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Ejecutar consulta con paginación
    const { count: total, rows: defectos } = await Defecto.findAndCountAll({
      where,
      order,
      limit,
      offset,
      attributes: {
        include: [
          // Agregar campo virtual para imagenUrl
          ['imagenFilename', 'imagenDefecto_filename'],
          ['imagenOriginalName', 'imagenDefecto_originalName'],
          ['imagenMimetype', 'imagenDefecto_mimetype'],
          ['imagenSize', 'imagenDefecto_size']
        ]
      }
    });

    // Transformar datos para mantener compatibilidad con el frontend
    const transformedDefectos = defectos.map(defecto => {
      const data = defecto.toJSON();
      
      // Crear objeto imagenDefecto para compatibilidad
      data.imagenDefecto = {
        filename: data.imagenFilename,
        originalName: data.imagenOriginalName,
        mimetype: data.imagenMimetype,
        size: data.imagenSize,
        url: data.imagenFilename ? `${process.env.BASE_URL || 'http://localhost:3004'}/uploads/defectos/${data.imagenFilename}` : null
      };
      
      // Agregar campos de compatibilidad
      data.fechaCreacion = data.createdAt;
      data.fechaActualizacion = data.updatedAt;
      
      return data;
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: transformedDefectos,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        tipoArticulo,
        tipoDesviacion,
        decision,
        estado,
        search
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un defecto por ID
// @route   GET /api/defectos/:id
// @access  Public
const getDefectoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de defecto no válido'
      });
    }

    const defecto = await Defecto.findByPk(id);

    if (!defecto) {
      return res.status(404).json({
        success: false,
        error: 'Defecto no encontrado'
      });
    }

    // Transformar datos para compatibilidad
    const data = defecto.toJSON();
    data.imagenDefecto = {
      filename: data.imagenFilename,
      originalName: data.imagenOriginalName,
      mimetype: data.imagenMimetype,
      size: data.imagenSize,
      url: data.imagenFilename ? `${process.env.BASE_URL || 'http://localhost:3004'}/uploads/defectos/${data.imagenFilename}` : null
    };
    data.fechaCreacion = data.createdAt;
    data.fechaActualizacion = data.updatedAt;

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un defecto por código
// @route   GET /api/defectos/codigo/:codigo
// @access  Public
const getDefectoByCodigo = async (req, res, next) => {
  try {
    const { codigo } = req.params;

    const defecto = await Defecto.findByCodigoDefecto(codigo);

    if (!defecto) {
      return res.status(404).json({
        success: false,
        error: 'Defecto no encontrado'
      });
    }

    // Transformar datos para compatibilidad
    const data = defecto.toJSON();
    data.imagenDefecto = {
      filename: data.imagenFilename,
      originalName: data.imagenOriginalName,
      mimetype: data.imagenMimetype,
      size: data.imagenSize,
      url: data.imagenFilename ? `${process.env.BASE_URL || 'http://localhost:3004'}/uploads/defectos/${data.imagenFilename}` : null
    };
    data.fechaCreacion = data.createdAt;
    data.fechaActualizacion = data.updatedAt;

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Crear un nuevo defecto
// @route   POST /api/defectos
// @access  Private
const createDefecto = async (req, res, next) => {
  try {
    const defectoData = req.validatedData;

    // Verificar si ya existe un defecto con el mismo código
    const existingDefecto = await Defecto.findByCodigoDefecto(defectoData.codigoDefecto);
    if (existingDefecto) {
      // Si hay imagen subida, eliminarla
      if (req.imageInfo) {
        deleteFile(req.imageInfo.filename);
      }
      return res.status(400).json({
        success: false,
        error: `Ya existe un defecto con el código ${defectoData.codigoDefecto}`
      });
    }

    // Agregar información de la imagen si fue subida
    if (req.imageInfo) {
      defectoData.imagenFilename = req.imageInfo.filename;
      defectoData.imagenOriginalName = req.imageInfo.originalName;
      defectoData.imagenMimetype = req.imageInfo.mimetype;
      defectoData.imagenSize = req.imageInfo.size;
    }

    // Crear el defecto
    const defecto = await Defecto.create(defectoData);

    // Transformar datos para compatibilidad
    const data = defecto.toJSON();
    data.imagenDefecto = {
      filename: data.imagenFilename,
      originalName: data.imagenOriginalName,
      mimetype: data.imagenMimetype,
      size: data.imagenSize,
      url: data.imagenFilename ? `${process.env.BASE_URL || 'http://localhost:3004'}/uploads/defectos/${data.imagenFilename}` : null
    };
    data.fechaCreacion = data.createdAt;
    data.fechaActualizacion = data.updatedAt;

    res.status(201).json({
      success: true,
      message: 'Defecto creado exitosamente',
      data
    });
  } catch (error) {
    // Si hay error y se subió una imagen, eliminarla
    if (req.imageInfo) {
      deleteFile(req.imageInfo.filename);
    }
    next(error);
  }
};

// @desc    Actualizar un defecto
// @route   PUT /api/defectos/:id
// @access  Private
const updateDefecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;

    // Validar que el ID sea un número
    if (isNaN(parseInt(id))) {
      // Si hay imagen subida, eliminarla
      if (req.imageInfo) {
        deleteFile(req.imageInfo.filename);
      }
      return res.status(400).json({
        success: false,
        error: 'ID de defecto no válido'
      });
    }

    // Buscar el defecto existente
    const existingDefecto = await Defecto.findByPk(id);
    if (!existingDefecto) {
      // Si hay imagen subida, eliminarla
      if (req.imageInfo) {
        deleteFile(req.imageInfo.filename);
      }
      return res.status(404).json({
        success: false,
        error: 'Defecto no encontrado'
      });
    }

    // Si se subió una nueva imagen
    if (req.imageInfo) {
      // Eliminar la imagen anterior si existe
      if (existingDefecto.imagenFilename) {
        deleteFile(existingDefecto.imagenFilename);
      }
      
      // Agregar la nueva imagen
      updateData.imagenFilename = req.imageInfo.filename;
      updateData.imagenOriginalName = req.imageInfo.originalName;
      updateData.imagenMimetype = req.imageInfo.mimetype;
      updateData.imagenSize = req.imageInfo.size;
    }

    // Actualizar el defecto
    await existingDefecto.update(updateData);
    
    // Recargar el defecto actualizado
    await existingDefecto.reload();

    // Transformar datos para compatibilidad
    const data = existingDefecto.toJSON();
    data.imagenDefecto = {
      filename: data.imagenFilename,
      originalName: data.imagenOriginalName,
      mimetype: data.imagenMimetype,
      size: data.imagenSize,
      url: data.imagenFilename ? `${process.env.BASE_URL || 'http://localhost:3004'}/uploads/defectos/${data.imagenFilename}` : null
    };
    data.fechaCreacion = data.createdAt;
    data.fechaActualizacion = data.updatedAt;

    res.status(200).json({
      success: true,
      message: 'Defecto actualizado exitosamente',
      data
    });
  } catch (error) {
    // Si hay error y se subió una imagen, eliminarla
    if (req.imageInfo) {
      deleteFile(req.imageInfo.filename);
    }
    next(error);
  }
};

// @desc    Eliminar un defecto
// @route   DELETE /api/defectos/:id
// @access  Private
const deleteDefecto = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de defecto no válido'
      });
    }

    const defecto = await Defecto.findByPk(id);

    if (!defecto) {
      return res.status(404).json({
        success: false,
        error: 'Defecto no encontrado'
      });
    }

    // Eliminar la imagen asociada si existe
    if (defecto.imagenFilename) {
      deleteFile(defecto.imagenFilename);
    }

    // Eliminar el defecto
    await defecto.destroy();

    res.status(200).json({
      success: true,
      message: 'Defecto eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener estadísticas de defectos
// @route   GET /api/defectos/stats
// @access  Public
const getEstadisticas = async (req, res, next) => {
  try {
    const stats = await Defecto.getEstadisticas();

    // Transformar los resultados para que coincidan con el formato esperado
    const porTipoDesviacion = {};
    const porDecision = {};
    const porTipoArticulo = {};

    // Procesar estadísticas por tipo de desviación
    if (stats.porTipoDesviacion) {
      stats.porTipoDesviacion.forEach(item => {
        porTipoDesviacion[item.tipoDesviacion] = parseInt(item.count);
      });
    }

    // Procesar estadísticas por decisión
    if (stats.porDecision) {
      stats.porDecision.forEach(item => {
        porDecision[item.decision] = parseInt(item.count);
      });
    }

    // Obtener estadísticas adicionales por tipo de artículo
    const { sequelize } = require('../config/database');
    const [tipoArticuloResult] = await sequelize.query(
      'SELECT tipoArticulo, COUNT(*) as count FROM Defectos WHERE estado = "activo" GROUP BY tipoArticulo'
    );
    
    tipoArticuloResult.forEach(item => {
      porTipoArticulo[item.tipoArticulo] = parseInt(item.count);
    });

    const estadisticas = {
      total: parseInt(stats.total) || 0,
      porTipoDesviacion,
      porDecision,
      porTipoArticulo
    };

    res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archivar/desarchivar un defecto
// @route   PATCH /api/defectos/:id/estado
// @access  Private
const cambiarEstadoDefecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el ID sea un número
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de defecto no válido'
      });
    }

    // Validar estado
    if (!['activo', 'inactivo', 'archivado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Estado no válido. Debe ser: activo, inactivo o archivado'
      });
    }

    const defecto = await Defecto.findByPk(id);

    if (!defecto) {
      return res.status(404).json({
        success: false,
        error: 'Defecto no encontrado'
      });
    }

    // Actualizar el estado
    await defecto.update({ estado });

    // Transformar datos para compatibilidad
    const data = defecto.toJSON();
    data.imagenDefecto = {
      filename: data.imagenFilename,
      originalName: data.imagenOriginalName,
      mimetype: data.imagenMimetype,
      size: data.imagenSize,
      url: data.imagenFilename ? `${process.env.BASE_URL || 'http://localhost:3004'}/uploads/defectos/${data.imagenFilename}` : null
    };
    data.fechaCreacion = data.createdAt;
    data.fechaActualizacion = data.updatedAt;

    res.status(200).json({
      success: true,
      message: `Defecto ${estado} exitosamente`,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDefectos,
  getDefectoById,
  getDefectoByCodigo,
  createDefecto,
  updateDefecto,
  deleteDefecto,
  getEstadisticas,
  cambiarEstadoDefecto
};