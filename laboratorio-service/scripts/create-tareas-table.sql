-- Script para crear la tabla de tareas en el laboratorio service
-- Ejecutar este script en la base de datos laboratorio_db

USE laboratorio_db;

-- Crear tabla de tareas
CREATE TABLE IF NOT EXISTS tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  asignado VARCHAR(255) NOT NULL,
  estado ENUM('pendiente', 'en_progreso', 'completada') NOT NULL DEFAULT 'pendiente',
  prioridad ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
  fechaVencimiento DATE,
  fechaCreacion DATE NOT NULL,
  fechaCompletada DATETIME,
  comentarios TEXT,
  creadoEn DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizadoEn DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_estado (estado),
  INDEX idx_prioridad (prioridad),
  INDEX idx_asignado (asignado),
  INDEX idx_fecha_vencimiento (fechaVencimiento),
  INDEX idx_fecha_creacion (fechaCreacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo
INSERT INTO tareas (titulo, descripcion, asignado, estado, prioridad, fechaVencimiento, fechaCreacion) VALUES
('Análisis de muestras Q1', 'Realizar análisis microbiológico de las muestras del primer trimestre', 'Dr. María González', 'pendiente', 'alta', '2024-01-15', '2024-01-10'),
('Calibración de equipos', 'Calibrar espectrofotómetro y balanza analítica', 'Ing. Carlos Ruiz', 'en_progreso', 'media', '2024-01-12', '2024-01-08'),
('Reporte mensual de calidad', 'Generar reporte de control de calidad del mes anterior', 'Lic. Ana Pérez', 'completada', 'baja', '2024-01-05', '2024-01-01'),
('Validación de método analítico', 'Validar nuevo método para determinación de principio activo', 'Dr. Luis Martínez', 'pendiente', 'alta', '2024-01-20', '2024-01-12'),
('Mantenimiento preventivo HPLC', 'Realizar mantenimiento preventivo del equipo HPLC', 'Téc. Sandra López', 'pendiente', 'media', '2024-01-18', '2024-01-11'),
('Auditoría interna laboratorio', 'Preparar documentación para auditoría interna del laboratorio', 'Lic. Roberto García', 'en_progreso', 'alta', '2024-01-25', '2024-01-13');

SELECT 'Tabla de tareas creada exitosamente' AS mensaje;
SELECT COUNT(*) AS total_tareas FROM tareas;