const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('Error:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      statusCode: 400,
      message: 'Error de validación: ' + message
    };
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = {
      statusCode: 400,
      message: `El ${field} '${value}' ya existe en el sistema`
    };
  }

  // Error de ObjectId inválido de Mongoose
  if (err.name === 'CastError') {
    error = {
      statusCode: 400,
      message: 'ID no válido'
    };
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Token no válido'
    };
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token expirado'
    };
  }

  // Error de conexión a la base de datos
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    error = {
      statusCode: 503,
      message: 'Error de conexión a la base de datos'
    };
  }

  // Error de límite de tamaño de archivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      statusCode: 400,
      message: 'El archivo es demasiado grande'
    };
  }

  // Error de tipo de archivo no permitido
  if (err.message && err.message.includes('Solo se permiten archivos de imagen')) {
    error = {
      statusCode: 400,
      message: err.message
    };
  }

  // Respuesta de error
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;