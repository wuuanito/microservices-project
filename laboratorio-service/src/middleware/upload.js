const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads/defectos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `defecto_${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// Filtro de archivos - solo imágenes
const fileFilter = (req, file, cb) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Solo un archivo por request
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'Demasiados archivos. Solo se permite un archivo por solicitud'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: 'Campo de archivo inesperado'
        });
      default:
        return res.status(400).json({
          error: 'Error al subir el archivo: ' + error.message
        });
    }
  }
  
  if (error.message.includes('Solo se permiten archivos de imagen')) {
    return res.status(400).json({
      error: error.message
    });
  }
  
  next(error);
};

// Middleware para procesar la imagen subida
const processUploadedImage = (req, res, next) => {
  if (req.files && req.files.imagenDefecto && req.files.imagenDefecto[0]) {
    const file = req.files.imagenDefecto[0];
    // Agregar información adicional del archivo al request
    req.imageInfo = {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/defectos/${file.filename}`
    };
  }
  next();
};

// Función para eliminar archivo
const deleteFile = (filename) => {
  if (filename) {
    const filePath = path.join(uploadsDir, filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error al eliminar archivo:', err);
      }
    });
  }
};

module.exports = {
  upload: upload.fields([
    { name: 'imagenDefecto', maxCount: 1 },
    { name: 'codigoDefecto' },
    { name: 'tipoArticulo' },
    { name: 'descripcionArticulo' },
    { name: 'codigo' },
    { name: 'versionDefecto' },
    { name: 'descripcionDefecto' },
    { name: 'tipoDesviacion' },
    { name: 'decision' },
    { name: 'observacionesAdicionales' },
    { name: 'creadoPor' }
  ]),
  handleMulterError,
  processUploadedImage,
  deleteFile
};