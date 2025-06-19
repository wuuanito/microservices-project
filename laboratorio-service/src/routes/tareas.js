const express = require('express');
const router = express.Router();
const {
  obtenerTareas,
  obtenerTareaPorId,
  crearTarea,
  actualizarTarea,
  cambiarEstadoTarea,
  eliminarTarea,
  obtenerEstadisticas,
  obtenerTareasVencidas
} = require('../controllers/tareasController');
const { validarTarea, validarEstado } = require('../middleware/validation');

// Rutas para tareas

/**
 * @route GET /api/tareas
 * @desc Obtener todas las tareas con filtros opcionales
 * @query {string} estado - Filtrar por estado (pendiente, en_progreso, completada, todas)
 * @query {string} prioridad - Filtrar por prioridad (baja, media, alta)
 * @query {string} asignado - Filtrar por persona asignada
 * @query {string} fechaDesde - Filtrar desde fecha (YYYY-MM-DD)
 * @query {string} fechaHasta - Filtrar hasta fecha (YYYY-MM-DD)
 * @query {number} page - Número de página (default: 1)
 * @query {number} limit - Límite de resultados por página (default: 50)
 * @access Public
 */
router.get('/', obtenerTareas);

/**
 * @route GET /api/tareas/estadisticas
 * @desc Obtener estadísticas de tareas
 * @access Public
 */
router.get('/estadisticas', obtenerEstadisticas);

/**
 * @route GET /api/tareas/vencidas
 * @desc Obtener tareas vencidas
 * @access Public
 */
router.get('/vencidas', obtenerTareasVencidas);

/**
 * @route GET /api/tareas/:id
 * @desc Obtener una tarea específica por ID
 * @param {number} id - ID de la tarea
 * @access Public
 */
router.get('/:id', obtenerTareaPorId);

/**
 * @route POST /api/tareas
 * @desc Crear una nueva tarea
 * @body {string} titulo - Título de la tarea (requerido)
 * @body {string} descripcion - Descripción de la tarea
 * @body {string} asignado - Persona asignada (requerido)
 * @body {string} prioridad - Prioridad (baja, media, alta)
 * @body {string} fechaVencimiento - Fecha de vencimiento (YYYY-MM-DD)
 * @body {string} comentarios - Comentarios adicionales
 * @access Public
 */
router.post('/', validarTarea, crearTarea);

/**
 * @route PUT /api/tareas/:id
 * @desc Actualizar una tarea existente
 * @param {number} id - ID de la tarea
 * @body {string} titulo - Título de la tarea
 * @body {string} descripcion - Descripción de la tarea
 * @body {string} asignado - Persona asignada
 * @body {string} prioridad - Prioridad (baja, media, alta)
 * @body {string} fechaVencimiento - Fecha de vencimiento (YYYY-MM-DD)
 * @body {string} comentarios - Comentarios adicionales
 * @access Public
 */
router.put('/:id', actualizarTarea);

/**
 * @route PATCH /api/tareas/:id/estado
 * @desc Cambiar el estado de una tarea
 * @param {number} id - ID de la tarea
 * @body {string} estado - Nuevo estado (pendiente, en_progreso, completada)
 * @access Public
 */
router.patch('/:id/estado', validarEstado, cambiarEstadoTarea);

/**
 * @route DELETE /api/tareas/:id
 * @desc Eliminar una tarea
 * @param {number} id - ID de la tarea
 * @access Public
 */
router.delete('/:id', eliminarTarea);

module.exports = router;