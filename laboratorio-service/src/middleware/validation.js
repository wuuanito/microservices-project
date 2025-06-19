const Joi = require('joi');

// Schema para validar tarea
const tareaSchema = Joi.object({
  titulo: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(255)
    .messages({
      'string.empty': 'El título es obligatorio',
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede exceder 255 caracteres'
    }),
    
  descripcion: Joi.string()
    .allow('')
    .max(1000)
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
    
  asignado: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(255)
    .messages({
      'string.empty': 'El campo asignado es obligatorio',
      'string.min': 'El nombre del asignado debe tener al menos 2 caracteres',
      'string.max': 'El nombre del asignado no puede exceder 255 caracteres'
    }),
    
  prioridad: Joi.string()
    .valid('baja', 'media', 'alta')
    .default('media')
    .messages({
      'any.only': 'La prioridad debe ser: baja, media o alta'
    }),
    
  fechaVencimiento: Joi.date()
    .iso()
    .min('now')
    .allow(null)
    .messages({
      'date.format': 'La fecha de vencimiento debe tener formato YYYY-MM-DD',
      'date.min': 'La fecha de vencimiento no puede ser anterior a hoy'
    }),
    
  comentarios: Joi.string()
    .allow('')
    .max(1000)
    .messages({
      'string.max': 'Los comentarios no pueden exceder 1000 caracteres'
    })
});

// Schema para validar cambio de estado
const estadoSchema = Joi.object({
  estado: Joi.string()
    .required()
    .valid('pendiente', 'en_progreso', 'completada')
    .messages({
      'string.empty': 'El estado es obligatorio',
      'any.only': 'El estado debe ser: pendiente, en_progreso o completada'
    })
});

// Schema para validar defecto
const defectoSchema = Joi.object({
  codigoDefecto: Joi.string()
    .required()
    .trim()
    .uppercase()
    .min(3)
    .max(50)
    .pattern(/^[A-Z0-9-_]+$/)
    .messages({
      'string.empty': 'El código de defecto es obligatorio',
      'string.min': 'El código de defecto debe tener al menos 3 caracteres',
      'string.max': 'El código de defecto no puede exceder 50 caracteres',
      'string.pattern.base': 'El código de defecto solo puede contener letras mayúsculas, números, guiones y guiones bajos'
    }),
    
  tipoArticulo: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'El tipo de artículo es obligatorio',
      'string.min': 'El tipo de artículo debe tener al menos 1 caracter',
      'string.max': 'El tipo de artículo no puede exceder 100 caracteres'
    }),
    
  descripcionArticulo: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(500)
    .messages({
      'string.empty': 'La descripción del artículo es obligatoria',
      'string.min': 'La descripción del artículo debe tener al menos 3 caracteres',
      'string.max': 'La descripción del artículo no puede exceder 500 caracteres'
    }),
    
  codigo: Joi.string()
    .required()
    .trim()
    .uppercase()
    .min(2)
    .max(20)
    .pattern(/^[A-Z0-9-_]+$/)
    .messages({
      'string.empty': 'El código es obligatorio',
      'string.min': 'El código debe tener al menos 2 caracteres',
      'string.max': 'El código no puede exceder 20 caracteres',
      'string.pattern.base': 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'
    }),
    
  versionDefecto: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(10)
    .messages({
      'string.empty': 'La versión del defecto es obligatoria',
      'string.min': 'La versión del defecto debe tener al menos 1 caracter',
      'string.max': 'La versión del defecto no puede exceder 10 caracteres'
    }),
    
  descripcionDefecto: Joi.string()
    .allow('', null)
    .trim()
    .max(2000)
    .messages({
      'string.max': 'La descripción del defecto no puede exceder 2000 caracteres'
    }),
    
  tipoDesviacion: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'El tipo de desviación es obligatorio',
      'string.min': 'El tipo de desviación debe tener al menos 1 caracter',
      'string.max': 'El tipo de desviación no puede exceder 100 caracteres'
    }),
    
  decision: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'La decisión es obligatoria',
      'string.min': 'La decisión debe tener al menos 1 caracter',
      'string.max': 'La decisión no puede exceder 100 caracteres'
    }),
    
  observacionesAdicionales: Joi.string()
    .allow('', null)
    .trim()
    .max(1000)
    .messages({
      'string.max': 'Las observaciones adicionales no pueden exceder 1000 caracteres'
    }),
    
  creadoPor: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.empty': 'El usuario creador es obligatorio',
      'string.min': 'El usuario creador debe tener al menos 2 caracteres',
      'string.max': 'El usuario creador no puede exceder 100 caracteres'
    })
});

// Schema para actualizar defecto (todos los campos opcionales excepto algunos)
const defectoUpdateSchema = Joi.object({
  tipoArticulo: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.min': 'El tipo de artículo debe tener al menos 1 caracter',
      'string.max': 'El tipo de artículo no puede exceder 100 caracteres'
    }),
    
  descripcionArticulo: Joi.string()
    .trim()
    .min(3)
    .max(500)
    .messages({
      'string.min': 'La descripción del artículo debe tener al menos 3 caracteres',
      'string.max': 'La descripción del artículo no puede exceder 500 caracteres'
    }),
    
  codigo: Joi.string()
    .trim()
    .uppercase()
    .min(2)
    .max(20)
    .pattern(/^[A-Z0-9-_]+$/)
    .messages({
      'string.min': 'El código debe tener al menos 2 caracteres',
      'string.max': 'El código no puede exceder 20 caracteres',
      'string.pattern.base': 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'
    }),
    
  versionDefecto: Joi.string()
    .trim()
    .min(1)
    .max(10)
    .messages({
      'string.min': 'La versión del defecto debe tener al menos 1 caracter',
      'string.max': 'La versión del defecto no puede exceder 10 caracteres'
    }),
    
  descripcionDefecto: Joi.string()
    .allow('', null)
    .trim()
    .max(2000)
    .messages({
      'string.max': 'La descripción del defecto no puede exceder 2000 caracteres'
    }),
    
  tipoDesviacion: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.min': 'El tipo de desviación debe tener al menos 1 caracter',
      'string.max': 'El tipo de desviación no puede exceder 100 caracteres'
    }),
    
  decision: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.min': 'La decisión debe tener al menos 1 caracter',
      'string.max': 'La decisión no puede exceder 100 caracteres'
    }),
    
  observacionesAdicionales: Joi.string()
    .allow('', null)
    .trim()
    .max(1000)
    .messages({
      'string.max': 'Las observaciones adicionales no pueden exceder 1000 caracteres'
    }),
    
  estado: Joi.string()
    .valid('activo', 'inactivo', 'archivado')
    .messages({
      'any.only': 'Estado no válido'
    })
}).min(1); // Al menos un campo debe ser proporcionado

// Schema para parámetros de consulta
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('fechaCreacion', 'createdAt', 'codigoDefecto', 'tipoDesviacion', 'decision').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  tipoArticulo: Joi.string().trim().max(100),
  tipoDesviacion: Joi.string().trim().max(100),
  decision: Joi.string().trim().max(100),
  estado: Joi.string().valid('activo', 'inactivo', 'archivado').default('activo'),
  search: Joi.string().trim().max(100)
});

// Middleware de validación
const validateDefecto = (req, res, next) => {
  console.log('Datos recibidos en validateDefecto:');
  console.log('req.body:', req.body);
  console.log('req.files:', req.files);
  console.log('req.file:', req.file);
  
  // Transform specific fields to uppercase before validation
  if (req.body.codigoDefecto) {
    req.body.codigoDefecto = req.body.codigoDefecto.toString().toUpperCase();
  }
  if (req.body.codigo) {
    req.body.codigo = req.body.codigo.toString().toUpperCase();
  }
  
  const { error, value } = defectoSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    console.log('Error de validación:', error.details);
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.validatedData = value;
  next();
};

const validateDefectoUpdate = (req, res, next) => {
  const { error, value } = defectoUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      error: 'Datos de entrada no válidos',
      details: errors
    });
  }
  
  req.validatedData = value;
  next();
};

const validateQuery = (req, res, next) => {
  const { error, value } = querySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      error: 'Parámetros de consulta no válidos',
      details: errors
    });
  }
  
  req.validatedQuery = value;
  next();
};

// Middleware de validación para tareas
const validarTarea = (req, res, next) => {
  console.log('=== VALIDACIÓN TAREA ===');
  console.log('Datos recibidos:', req.body);
  
  const { error, value } = tareaSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    console.log('Errores de validación:', errors);
    
    return res.status(400).json({
      success: false,
      error: 'Datos de tarea no válidos',
      details: errors
    });
  }
  
  console.log('Datos validados:', value);
  req.validatedData = value;
  next();
};

// Middleware de validación para cambio de estado
const validarEstado = (req, res, next) => {
  console.log('=== VALIDACIÓN ESTADO ===');
  console.log('Datos recibidos:', req.body);
  
  const { error, value } = estadoSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    console.log('Errores de validación:', errors);
    
    return res.status(400).json({
      success: false,
      error: 'Estado no válido',
      details: errors
    });
  }
  
  console.log('Estado validado:', value);
  req.validatedData = value;
  next();
};

module.exports = {
  validateDefecto,
  validateDefectoUpdate,
  validateQuery,
  validarTarea,
  validarEstado
};