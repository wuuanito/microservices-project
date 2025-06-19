-- Script de inicialización para MySQL
-- Crear la base de datos y tabla de defectos

USE laboratorio_db;

-- Crear tabla de defectos
CREATE TABLE IF NOT EXISTS Defectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigoDefecto VARCHAR(50) NOT NULL UNIQUE,
    tipoArticulo ENUM('Materia Prima', 'Producto Intermedio', 'Producto Terminado', 'Material de Empaque', 'Insumo') NOT NULL,
    descripcionArticulo TEXT NOT NULL,
    tipoDesviacion ENUM('Físico', 'Químico', 'Microbiológico', 'Documental', 'Proceso') NOT NULL,
    descripcionDefecto TEXT NOT NULL,
    codigo VARCHAR(100),
    decision ENUM('Aprobado', 'Rechazado', 'Reproceso', 'Cuarentena', 'Pendiente') NOT NULL DEFAULT 'Pendiente',
    estado ENUM('activo', 'inactivo', 'archivado') NOT NULL DEFAULT 'activo',
    
    -- Campos de imagen
    imagenFilename VARCHAR(255),
    imagenOriginalName VARCHAR(255),
    imagenMimetype VARCHAR(100),
    imagenSize INT,
    
    -- Timestamps
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_codigo_defecto (codigoDefecto),
    INDEX idx_tipo_articulo (tipoArticulo),
    INDEX idx_tipo_desviacion (tipoDesviacion),
    INDEX idx_decision (decision),
    INDEX idx_estado (estado),
    INDEX idx_created_at (createdAt),
    INDEX idx_codigo (codigo),
    
    -- Índice compuesto para consultas comunes
    INDEX idx_estado_tipo_decision (estado, tipoArticulo, decision),
    
    -- Índice de texto completo para búsquedas
    FULLTEXT INDEX idx_fulltext_search (descripcionArticulo, descripcionDefecto, codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo
INSERT INTO Defectos (
    codigoDefecto,
    tipoArticulo,
    descripcionArticulo,
    tipoDesviacion,
    descripcionDefecto,
    codigo,
    decision,
    estado
) VALUES 
(
    'DEF-001',
    'Materia Prima',
    'Lote de azúcar refinada para producción de jarabe',
    'Físico',
    'Presencia de partículas extrañas en el azúcar, posibles restos de empaque',
    'AZ-2024-001',
    'Rechazado',
    'activo'
),
(
    'DEF-002',
    'Producto Terminado',
    'Jarabe de glucosa lote JG-240115',
    'Químico',
    'Concentración de glucosa fuera del rango especificado (85-90%). Resultado: 82%',
    'JG-240115-QC',
    'Reproceso',
    'activo'
),
(
    'DEF-003',
    'Material de Empaque',
    'Etiquetas adhesivas para frascos de 500ml',
    'Físico',
    'Adhesivo defectuoso, las etiquetas se despegan fácilmente',
    'ET-500ML-001',
    'Rechazado',
    'activo'
),
(
    'DEF-004',
    'Producto Intermedio',
    'Solución base para jarabe sabor fresa',
    'Microbiológico',
    'Conteo de levaduras superior al límite permitido (>10 UFC/ml)',
    'SB-FRESA-024',
    'Cuarentena',
    'activo'
),
(
    'DEF-005',
    'Insumo',
    'Colorante rojo carmín para productos',
    'Documental',
    'Certificado de análisis vencido, falta documentación de trazabilidad',
    'COL-ROJO-003',
    'Pendiente',
    'activo'
);

-- Mostrar información de inicialización
SELECT 'Base de datos MySQL inicializada correctamente' AS mensaje;
SELECT COUNT(*) AS total_defectos FROM Defectos;
SELECT decision, COUNT(*) AS cantidad FROM Defectos GROUP BY decision;
SELECT tipoArticulo, COUNT(*) AS cantidad FROM Defectos GROUP BY tipoArticulo;