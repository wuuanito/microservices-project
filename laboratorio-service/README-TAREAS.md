# Sistema de Gestión de Tareas - Laboratorio Service

## Descripción
Este módulo implementa un sistema completo de gestión de tareas para el laboratorio, migrado desde el frontend `app-naturepharma` e integrado como funcionalidad backend.

## Funcionalidades Implementadas

### 🎯 Gestión de Tareas
- **CRUD completo**: Crear, leer, actualizar y eliminar tareas
- **Estados de tarea**: Pendiente, En Progreso, Completada
- **Prioridades**: Baja, Media, Alta
- **Asignación**: Asignar tareas a miembros del equipo
- **Fechas**: Fecha de vencimiento y seguimiento de fechas
- **Comentarios**: Sistema de comentarios para cada tarea

### 📊 Estadísticas y Reportes
- Conteo total de tareas
- Distribución por estados
- Tareas vencidas
- Distribución por prioridades
- Filtros avanzados

### 🔍 Filtros y Búsqueda
- Filtrar por estado
- Filtrar por prioridad
- Filtrar por asignado
- Filtrar por fechas
- Paginación de resultados

## Estructura de Archivos

```
laboratorio-service/
├── src/
│   ├── models/
│   │   └── Tarea.js              # Modelo Sequelize para tareas
│   ├── controllers/
│   │   └── tareasController.js   # Controlador con lógica de negocio
│   ├── routes/
│   │   └── tareas.js            # Rutas API para tareas
│   └── middleware/
│       └── validation.js        # Validaciones Joi actualizadas
├── scripts/
│   └── create-tareas-table.sql  # Script SQL para crear tabla
└── README-TAREAS.md             # Esta documentación
```

## API Endpoints

### Tareas
- `GET /api/tareas` - Obtener todas las tareas (con filtros y paginación)
- `GET /api/tareas/estadisticas` - Obtener estadísticas de tareas
- `GET /api/tareas/vencidas` - Obtener tareas vencidas
- `GET /api/tareas/:id` - Obtener tarea por ID
- `POST /api/tareas` - Crear nueva tarea
- `PUT /api/tareas/:id` - Actualizar tarea completa
- `PATCH /api/tareas/:id/estado` - Cambiar estado de tarea
- `DELETE /api/tareas/:id` - Eliminar tarea

### Parámetros de Consulta (GET /api/tareas)
- `estado`: pendiente, en_progreso, completada
- `prioridad`: baja, media, alta
- `asignado`: nombre del asignado
- `fechaDesde`: fecha desde (YYYY-MM-DD)
- `fechaHasta`: fecha hasta (YYYY-MM-DD)
- `page`: número de página (default: 1)
- `limit`: elementos por página (default: 10)

## Modelo de Datos

### Tarea
```javascript
{
  id: Integer (AUTO_INCREMENT),
  titulo: String (requerido, max 255),
  descripcion: Text (opcional),
  asignado: String (requerido, max 255),
  estado: Enum ['pendiente', 'en_progreso', 'completada'],
  prioridad: Enum ['baja', 'media', 'alta'],
  fechaVencimiento: Date (opcional),
  fechaCreacion: Date (requerido),
  fechaCompletada: DateTime (automático),
  comentarios: Text (opcional),
  creadoEn: DateTime (automático),
  actualizadoEn: DateTime (automático)
}
```

## Validaciones

### Crear/Actualizar Tarea
- `titulo`: Requerido, mínimo 3 caracteres, máximo 255
- `descripcion`: Opcional, máximo 1000 caracteres
- `asignado`: Requerido, mínimo 2 caracteres, máximo 255
- `estado`: Opcional, valores válidos: pendiente, en_progreso, completada
- `prioridad`: Opcional, valores válidos: baja, media, alta
- `fechaVencimiento`: Opcional, formato fecha válido
- `fechaCreacion`: Requerido, formato fecha válido
- `comentarios`: Opcional, máximo 500 caracteres

### Cambiar Estado
- `estado`: Requerido, valores válidos: pendiente, en_progreso, completada

## Instalación y Configuración

1. **Instalar dependencias** (si no están instaladas):
   ```bash
   npm install joi
   ```

2. **Ejecutar script de base de datos**:
   ```sql
   mysql -u root -p laboratorio_db < scripts/create-tareas-table.sql
   ```

3. **Verificar configuración**:
   - El modelo se sincroniza automáticamente en modo desarrollo
   - Las rutas están registradas en `app.js`
   - Las validaciones están configuradas

## Ejemplos de Uso

### Crear una nueva tarea
```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Análisis de muestra X",
    "descripcion": "Realizar análisis completo",
    "asignado": "Dr. Juan Pérez",
    "prioridad": "alta",
    "fechaVencimiento": "2024-01-30",
    "fechaCreacion": "2024-01-15"
  }'
```

### Obtener tareas con filtros
```bash
curl "http://localhost:3000/api/tareas?estado=pendiente&prioridad=alta&page=1&limit=5"
```

### Cambiar estado de tarea
```bash
curl -X PATCH http://localhost:3000/api/tareas/1/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "completada"}'
```

### Obtener estadísticas
```bash
curl "http://localhost:3000/api/tareas/estadisticas"
```

## Características Técnicas

- **ORM**: Sequelize con MySQL
- **Validación**: Joi para validación de datos
- **Paginación**: Implementada con offset/limit
- **Filtros**: Múltiples filtros combinables
- **Índices**: Optimización de consultas con índices en campos clave
- **Hooks**: Gestión automática de fechas de completado
- **Métodos estáticos**: Consultas optimizadas para casos comunes

## Migración desde Frontend

Este sistema fue migrado desde el componente `SeccionTareas.jsx` del frontend `app-naturepharma`, manteniendo todas las funcionalidades:

- ✅ Estados de tarea (pendiente, en progreso, completada)
- ✅ Sistema de prioridades
- ✅ Asignación de tareas
- ✅ Fechas de vencimiento
- ✅ Comentarios
- ✅ Estadísticas y métricas
- ✅ Filtros avanzados
- ✅ Operaciones CRUD completas

## Próximos Pasos

1. Implementar notificaciones para tareas vencidas
2. Agregar sistema de archivos adjuntos
3. Implementar historial de cambios
4. Agregar asignación múltiple
5. Integrar con sistema de usuarios/roles