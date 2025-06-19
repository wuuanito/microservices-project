const express = require('express');
const router = express.Router();

const {
  getDefectos,
  getDefectoById,
  getDefectoByCodigo,
  createDefecto,
  updateDefecto,
  deleteDefecto,
  getEstadisticas,
  cambiarEstadoDefecto
} = require('../controllers/defectosController');

const {
  validateDefecto,
  validateDefectoUpdate,
  validateQuery
} = require('../middleware/validation');

const {
  upload,
  handleMulterError,
  processUploadedImage
} = require('../middleware/upload');

// @route   GET /api/defectos/stats
// @desc    Obtener estadísticas de defectos
// @access  Public
router.get('/stats', getEstadisticas);

// @route   GET /api/defectos
// @desc    Obtener todos los defectos con paginación y filtros
// @access  Public
router.get('/', validateQuery, getDefectos);

// @route   GET /api/defectos/codigo/:codigo
// @desc    Obtener un defecto por código
// @access  Public
router.get('/codigo/:codigo', getDefectoByCodigo);

// @route   GET /api/defectos/:id
// @desc    Obtener un defecto por ID
// @access  Public
router.get('/:id', getDefectoById);

// @route   POST /api/defectos
// @desc    Crear un nuevo defecto
// @access  Private
router.post('/',
  upload,
  handleMulterError,
  processUploadedImage,
  validateDefecto,
  createDefecto
);

// @route   PUT /api/defectos/:id
// @desc    Actualizar un defecto
// @access  Private
router.put('/:id',
  upload,
  handleMulterError,
  processUploadedImage,
  validateDefectoUpdate,
  updateDefecto
);

// @route   PATCH /api/defectos/:id/estado
// @desc    Cambiar estado de un defecto (activo/inactivo/archivado)
// @access  Private
router.patch('/:id/estado', cambiarEstadoDefecto);

// @route   DELETE /api/defectos/:id
// @desc    Eliminar un defecto
// @access  Private
router.delete('/:id', deleteDefecto);

module.exports = router;