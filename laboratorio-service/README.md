# Laboratorio Service - Microservicio de Defectos de Fabricación

Microservicio para la gestión de defectos de fabricación en el laboratorio de NaturePharma.

## 🚀 Características

- ✅ CRUD completo de defectos de fabricación
- 📁 Subida y gestión de imágenes de defectos
- 🔍 Búsqueda y filtrado avanzado
- 📊 Estadísticas y reportes
- 📄 Paginación de resultados
- ✨ Validación robusta de datos
- 🛡️ Manejo de errores centralizado
- 🔒 Rate limiting para seguridad
- 📱 API RESTful bien documentada

## 📋 Requisitos

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   cd laboratorio-service
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   PORT=3003
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=laboratorio_db
   DB_USER=laboratorio_user
   DB_PASSWORD=laboratorio_password
   FRONTEND_URL=http://localhost:3000
   BASE_URL=http://localhost:3003
   ```

4. **Crear directorios necesarios**
   ```bash
   mkdir -p uploads/defectos
   ```

5. **Iniciar el servicio**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 📚 API Endpoints

### Defectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/defectos` | Obtener todos los defectos con paginación |
| GET | `/api/defectos/:id` | Obtener defecto por ID |
| GET | `/api/defectos/codigo/:codigo` | Obtener defecto por código |
| GET | `/api/defectos/stats` | Obtener estadísticas |
| POST | `/api/defectos` | Crear nuevo defecto |
| PUT | `/api/defectos/:id` | Actualizar defecto |
| PATCH | `/api/defectos/:id/estado` | Cambiar estado del defecto |
| DELETE | `/api/defectos/:id` | Eliminar defecto |

### Parámetros de Consulta (GET /api/defectos)

- `page` (number): Página actual (default: 1)
- `limit` (number): Elementos por página (default: 10, max: 100)
- `sortBy` (string): Campo de ordenamiento (fechaCreacion, codigoDefecto, tipoDesviacion, decision)
- `sortOrder` (string): Orden (asc, desc)
- `tipoArticulo` (string): Filtrar por tipo de artículo
- `tipoDesviacion` (string): Filtrar por tipo de desviación
- `decision` (string): Filtrar por decisión
- `estado` (string): Filtrar por estado (default: activo)
- `search` (string): Búsqueda de texto

### Ejemplo de Uso

```bash
# Obtener defectos con paginación
GET /api/defectos?page=1&limit=10&sortBy=fechaCreacion&sortOrder=desc

# Buscar defectos
GET /api/defectos?search=paracetamol&tipoDesviacion=critica

# Crear defecto con imagen
POST /api/defectos
Content-Type: multipart/form-data

{
  "codigoDefecto": "DEF-2024-001",
  "tipoArticulo": "medicamento",
  "descripcionArticulo": "Paracetamol 500mg",
  "codigo": "PAR-500",
  "versionDefecto": "v1.0",
  "descripcionDefecto": "Contaminación detectada en el lote",
  "tipoDesviacion": "critica",
  "decision": "rechazar",
  "observacionesAdicionales": "Requiere investigación inmediata",
  "creadoPor": "usuario@ejemplo.com",
  "imagenDefecto": [archivo de imagen]
}
```

## 📊 Modelo de Datos

### Defecto

```javascript
{
  "id": "Integer (Primary Key, Auto Increment)",
  "codigoDefecto": "String (único, requerido, max: 50)",
  "tipoArticulo": "Enum (Materia Prima, Producto Intermedio, Producto Terminado, Material de Empaque, Insumo)",
  "descripcionArticulo": "Text (requerido)",
  "codigo": "String (max: 100)",
  "descripcionDefecto": "Text (requerido)",
  "tipoDesviacion": "Enum (Físico, Químico, Microbiológico, Documental, Proceso)",
  "decision": "Enum (Aprobado, Rechazado, Reproceso, Cuarentena, Pendiente)",
  "imagenFilename": "String (max: 255)",
  "imagenOriginalName": "String (max: 255)",
  "imagenMimetype": "String (max: 100)",
  "imagenSize": "Integer",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp",
  "estado": "Enum (activo, inactivo, archivado, default: activo)"
}
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|----------|
| `PORT` | Puerto del servidor | 3003 |
| `NODE_ENV` | Entorno de ejecución | development |
| `DB_HOST` | Host de la base de datos MySQL | localhost |
| `DB_PORT` | Puerto de MySQL | 3306 |
| `DB_NAME` | Nombre de la base de datos | laboratorio_db |
| `DB_USER` | Usuario de MySQL | laboratorio_user |
| `DB_PASSWORD` | Contraseña de MySQL | laboratorio_password |
| `FRONTEND_URL` | URL del frontend para CORS | http://localhost:3000 |
| `BASE_URL` | URL base del servicio | http://localhost:3003 |

### Límites de Archivos

- Tamaño máximo: 5MB
- Tipos permitidos: JPG, PNG, GIF, WebP
- Directorio de almacenamiento: `uploads/defectos/`

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
```

## 📁 Estructura del Proyecto

```
laboratorio-service/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── defectosController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── upload.js
│   │   └── validation.js
│   ├── models/
│   │   └── Defecto.js
│   ├── routes/
│   │   └── defectos.js
│   └── app.js
├── uploads/
│   └── defectos/
├── .env.example
├── package.json
└── README.md
```

## 🚀 Despliegue

### Docker

```dockerfile
# Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3003
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  laboratorio-service:
    build: .
    ports:
      - "3003:3003"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=laboratorio_db
      - DB_USER=laboratorio_user
      - DB_PASSWORD=laboratorio_password
    depends_on:
      - mysql
    volumes:
      - ./uploads:/app/uploads
  
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=laboratorio_db
      - MYSQL_USER=laboratorio_user
      - MYSQL_PASSWORD=laboratorio_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init-mysql.sql:/docker-entrypoint-initdb.d/init-mysql.sql:ro
    command: --default-authentication-plugin=mysql_native_password
  
  phpmyadmin:
    image: phpmyadmin/phpmyadmin:latest
    ports:
      - "8081:80"
    environment:
      - PMA_HOST=mysql
      - PMA_USER=laboratorio_user
      - PMA_PASSWORD=laboratorio_password
    depends_on:
      - mysql

volumes:
  mysql_data:
```

## 🔍 Monitoreo

### Health Check

```bash
GET /health
```

Respuesta:
```json
{
  "status": "OK",
  "service": "laboratorio-service",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo de NaturePharma.

---

**Desarrollado con ❤️ para NaturePharma**