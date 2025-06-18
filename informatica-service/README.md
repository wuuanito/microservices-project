# Servicio de Gestión de Equipos de Informática

Este servicio proporciona una API REST completa para la gestión de equipos de informática, incluyendo operaciones CRUD para diferentes categorías de dispositivos y sistemas.

## 🚀 Características

- **API REST completa** con operaciones CRUD para 8 categorías de equipos
- **Base de datos MySQL** con esquemas optimizados
- **Validación de datos** usando Joi
- **Paginación y búsqueda** en todos los endpoints
- **Manejo de errores** robusto
- **Documentación completa** de la API

## 📋 Categorías de Equipos

1. **Equipos** - Computadoras de escritorio, laptops, workstations
2. **Servidores** - Servidores web, de base de datos, archivos, backup
3. **Switches** - Equipos de red y conectividad
4. **Usuarios de Dominio** - Gestión de usuarios del dominio corporativo
5. **Cuentas Office** - Licencias y cuentas de Microsoft Office 365
6. **Cámaras de Seguridad** - Sistema de videovigilancia
7. **Programas** - Software y aplicaciones con credenciales
8. **Raspberry Pi** - Dispositivos IoT y proyectos especiales

## 🛠️ Instalación

### Prerrequisitos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd informatica-service
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=informatica_db
   DB_PORT=3306
   ```

4. **Inicializar la base de datos**
   ```bash
   npm run init-db
   ```

5. **Iniciar el servidor**
   ```bash
   # Modo desarrollo
   npm run dev
   
   # Modo producción
   npm start
   ```

## 📚 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Health Check
```http
GET /api/health
```

### Endpoints por Categoría

Todos los endpoints siguen el mismo patrón CRUD:

#### Equipos
- `GET /api/equipos` - Listar todos los equipos
- `GET /api/equipos/:id` - Obtener equipo por ID
- `POST /api/equipos` - Crear nuevo equipo
- `PUT /api/equipos/:id` - Actualizar equipo
- `DELETE /api/equipos/:id` - Eliminar equipo

#### Servidores
- `GET /api/servidores` - Listar todos los servidores
- `GET /api/servidores/:id` - Obtener servidor por ID
- `POST /api/servidores` - Crear nuevo servidor
- `PUT /api/servidores/:id` - Actualizar servidor
- `DELETE /api/servidores/:id` - Eliminar servidor

#### Switches
- `GET /api/switches` - Listar todos los switches
- `GET /api/switches/:id` - Obtener switch por ID
- `POST /api/switches` - Crear nuevo switch
- `PUT /api/switches/:id` - Actualizar switch
- `DELETE /api/switches/:id` - Eliminar switch

#### Usuarios de Dominio
- `GET /api/usuarios-dominio` - Listar todos los usuarios
- `GET /api/usuarios-dominio/:id` - Obtener usuario por ID
- `POST /api/usuarios-dominio` - Crear nuevo usuario
- `PUT /api/usuarios-dominio/:id` - Actualizar usuario
- `DELETE /api/usuarios-dominio/:id` - Eliminar usuario

#### Cuentas Office
- `GET /api/cuentas-office` - Listar todas las cuentas
- `GET /api/cuentas-office/:id` - Obtener cuenta por ID
- `POST /api/cuentas-office` - Crear nueva cuenta
- `PUT /api/cuentas-office/:id` - Actualizar cuenta
- `DELETE /api/cuentas-office/:id` - Eliminar cuenta

#### Cámaras de Seguridad
- `GET /api/camaras-seguridad` - Listar todas las cámaras
- `GET /api/camaras-seguridad/:id` - Obtener cámara por ID
- `POST /api/camaras-seguridad` - Crear nueva cámara
- `PUT /api/camaras-seguridad/:id` - Actualizar cámara
- `DELETE /api/camaras-seguridad/:id` - Eliminar cámara

#### Programas
- `GET /api/programas` - Listar todos los programas
- `GET /api/programas/:id` - Obtener programa por ID
- `POST /api/programas` - Crear nuevo programa
- `PUT /api/programas/:id` - Actualizar programa
- `DELETE /api/programas/:id` - Eliminar programa

#### Raspberry Pi
- `GET /api/raspberry` - Listar todos los dispositivos
- `GET /api/raspberry/:id` - Obtener dispositivo por ID
- `POST /api/raspberry` - Crear nuevo dispositivo
- `PUT /api/raspberry/:id` - Actualizar dispositivo
- `DELETE /api/raspberry/:id` - Eliminar dispositivo

### Parámetros de Consulta

Todos los endpoints GET de listado soportan:

- `page` - Número de página (default: 1)
- `limit` - Elementos por página (default: 10)
- `search` - Término de búsqueda
- `sortBy` - Campo para ordenar (default: 'id')
- `sortOrder` - Orden: 'ASC' o 'DESC' (default: 'ASC')

**Ejemplo:**
```http
GET /api/equipos?page=1&limit=5&search=laptop&sortBy=nombre&sortOrder=DESC
```

## 📝 Ejemplos de Uso

### Crear un nuevo equipo
```http
POST /api/equipos
Content-Type: application/json

{
  "id": "EQ005",
  "nombre": "PC-Desarrollo-01",
  "ip": "192.168.1.105",
  "usuario": "developer",
  "password": "Dev2024!",
  "tipo": "Desktop",
  "ubicacion": "Sala de Desarrollo"
}
```

### Actualizar un servidor
```http
PUT /api/servidores/SRV001
Content-Type: application/json

{
  "nombre": "Servidor-Web-Principal-Actualizado",
  "estado": "Mantenimiento"
}
```

### Buscar switches
```http
GET /api/switches?search=cisco&page=1&limit=10
```

## 🗄️ Esquemas de Base de Datos

### Equipos
```sql
CREATE TABLE equipos (
  id VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ip VARCHAR(15) NOT NULL,
  usuario VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  ubicacion VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Servidores
```sql
CREATE TABLE servidores (
  id VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ip VARCHAR(15) NOT NULL,
  usuario VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

*(Ver script `scripts/initDatabase.js` para todos los esquemas)*

## 🔧 Scripts Disponibles

- `npm start` - Iniciar servidor en modo producción
- `npm run dev` - Iniciar servidor en modo desarrollo con nodemon
- `npm run init-db` - Inicializar base de datos y crear tablas

## 🛡️ Validaciones

El servicio incluye validaciones robustas usando Joi:

- **IDs únicos** para cada categoría
- **Direcciones IP válidas** y únicas
- **Emails válidos** y únicos donde corresponde
- **Campos requeridos** según cada esquema
- **Longitudes máximas** para todos los campos de texto

## 📊 Respuestas de la API

### Respuesta exitosa (GET con paginación)
```json
{
  "data": [
    {
      "id": "EQ001",
      "nombre": "PC-Administración-01",
      "ip": "192.168.1.101",
      "usuario": "admin",
      "password": "Admin123!",
      "tipo": "Desktop",
      "ubicacion": "Oficina 1",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 25,
    "itemsPerPage": 5
  }
}
```

### Respuesta de error
```json
{
  "error": "El ID del equipo ya existe"
}
```

## 🚨 Códigos de Estado HTTP

- `200` - OK (operación exitosa)
- `201` - Created (recurso creado)
- `400` - Bad Request (datos inválidos)
- `404` - Not Found (recurso no encontrado)
- `409` - Conflict (conflicto, ej: ID duplicado)
- `500` - Internal Server Error (error del servidor)

## 🔒 Seguridad

- **Validación de entrada** en todos los endpoints
- **Sanitización de datos** para prevenir inyección SQL
- **Manejo seguro de contraseñas** (considera implementar hashing)
- **CORS configurado** para permitir requests del frontend

## 🤝 Integración con Frontend

Este servicio está diseñado para integrarse con el componente React `GestionEquipos.jsx`. Para conectar:

1. Actualizar las URLs base en el frontend
2. Implementar las llamadas a la API usando fetch o axios
3. Manejar la paginación y búsqueda del lado del cliente

## 📈 Próximas Mejoras

- [ ] Autenticación JWT
- [ ] Logging avanzado
- [ ] Tests unitarios e integración
- [ ] Documentación OpenAPI/Swagger
- [ ] Rate limiting
- [ ] Backup automático de base de datos
- [ ] Métricas y monitoreo

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
1. Verificar que MySQL esté ejecutándose
2. Comprobar las credenciales en `.env`
3. Asegurar que la base de datos existe

### Puerto en uso
1. Cambiar el puerto en `.env`
2. O detener el proceso que usa el puerto 3001

### Errores de validación
1. Revisar los esquemas de validación en cada ruta
2. Asegurar que todos los campos requeridos estén presentes
3. Verificar formatos (emails, IPs, etc.)

## 📞 Soporte

Para reportar problemas o solicitar nuevas características, contactar al Departamento de Informática.

---

**Versión:** 1.0.0  
**Autor:** Departamento de Informática  
**Licencia:** ISC