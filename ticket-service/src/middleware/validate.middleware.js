const { body, query, param } = require('express-validator');

const validateTicketCreation = [
  body('asunto')
    .notEmpty()
    .withMessage('El asunto es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El asunto debe tener entre 1 y 255 caracteres'),
  
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida'),
  
  body('departamento')
    .notEmpty()
    .withMessage('El departamento es requerido'),
  
  body('usuario')
    .notEmpty()
    .withMessage('El usuario es requerido'),
  
  body('usuarioEmail')
    .optional()
    .isEmail()
    .withMessage('El email debe ser válido'),
  
  body('prioridad')
    .optional()
    .isIn(['Baja', 'Media', 'Alta', 'Crítica'])
    .withMessage('La prioridad debe ser: Baja, Media, Alta o Crítica'),
  
  body('categoria')
    .optional()
    .isString()
    .withMessage('La categoría debe ser una cadena de texto'),
  
  body('etiquetas')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array')
];

const validateTicketUpdate = [
  body('asunto')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('El asunto debe tener entre 1 y 255 caracteres'),
  
  body('descripcion')
    .optional()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía'),
  
  body('departamento')
    .optional()
    .notEmpty()
    .withMessage('El departamento no puede estar vacío'),
  
  body('usuario')
    .optional()
    .notEmpty()
    .withMessage('El usuario no puede estar vacío'),
  
  body('usuarioEmail')
    .optional()
    .isEmail()
    .withMessage('El email debe ser válido'),
  
  body('prioridad')
    .optional()
    .isIn(['Baja', 'Media', 'Alta', 'Crítica'])
    .withMessage('La prioridad debe ser: Baja, Media, Alta o Crítica'),
  
  body('estado')
    .optional()
    .isIn(['Abierto', 'En Progreso', 'Pendiente', 'Cerrado'])
    .withMessage('El estado debe ser: Abierto, En Progreso, Pendiente o Cerrado'),
  
  body('asignadoA')
    .optional()
    .isString()
    .withMessage('El asignado debe ser una cadena de texto'),
  
  body('categoria')
    .optional()
    .isString()
    .withMessage('La categoría debe ser una cadena de texto'),
  
  body('etiquetas')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array')
];

const validateConversation = [
  body('autor')
    .notEmpty()
    .withMessage('El autor es requerido'),
  
  body('autorEmail')
    .optional()
    .isEmail()
    .withMessage('El email del autor debe ser válido'),
  
  body('texto')
    .notEmpty()
    .withMessage('El texto es requerido'),
  
  body('esInterno')
    .optional()
    .isBoolean()
    .withMessage('esInterno debe ser un valor booleano'),
  
  body('adjuntos')
    .optional()
    .isArray()
    .withMessage('Los adjuntos deben ser un array')
];

const validateAssignment = [
  body('asignadoA')
    .notEmpty()
    .withMessage('El asignado es requerido')
    .isString()
    .withMessage('El asignado debe ser una cadena de texto')
];

const validateTicketQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  
  query('estado')
    .optional()
    .isIn(['Todos', 'Abierto', 'En Progreso', 'Pendiente', 'Cerrado'])
    .withMessage('El estado debe ser válido'),
  
  query('prioridad')
    .optional()
    .isIn(['Baja', 'Media', 'Alta', 'Crítica'])
    .withMessage('La prioridad debe ser válida')
];

const validateTicketId = [
  param('id')
    .notEmpty()
    .withMessage('El ID del ticket es requerido')
    .matches(/^TICK-\d{3}$/)
    .withMessage('El ID del ticket debe tener el formato TICK-XXX')
];

module.exports = {
  validateTicketCreation,
  validateTicketUpdate,
  validateConversation,
  validateAssignment,
  validateTicketQuery,
  validateTicketId
};