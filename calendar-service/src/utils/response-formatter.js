// src/utils/response-formatter.js

/**
 * Formatea una respuesta exitosa.
 * @param {any} data - Los datos a enviar en la respuesta.
 * @param {string} [message='Operación exitosa'] - Un mensaje descriptivo.
 * @returns {object} Objeto de respuesta formateado.
 */
const formatResponse = (data, message = 'Operación exitosa') => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Formatea una respuesta de error.
 * @param {Error|null} error - El objeto de error (opcional).
 * @param {string} [defaultMessage='Ocurrió un error'] - Mensaje por defecto si no se provee uno específico.
 * @param {number} [statusCode=500] - Código de estado HTTP (informativo, no se usa directamente aquí).
 * @returns {object} Objeto de error formateado.
 */
const formatError = (error, defaultMessage = 'Ocurrió un error', statusCode = 500) => {
  let message = defaultMessage;
  let details = null;

  if (error) {
    // Si es un error de validación de Sequelize u otro error con múltiples mensajes
    if (error.errors && Array.isArray(error.errors)) {
      message = error.errors.map(e => e.message).join('; ');
    } else if (error.message) {
      message = error.message;
    }
    // En desarrollo, podríamos querer enviar más detalles del error
    if (process.env.NODE_ENV === 'development') {
      details = {
        name: error.name,
        stack: error.stack?.split('\n').map(line => line.trim()), // Stack trace como array
      };
    }
  }

  return {
    success: false,
    message,
    error: details, // Solo se poblará en desarrollo o si se desea explícitamente
  };
};

module.exports = {
  formatResponse,
  formatError,
};