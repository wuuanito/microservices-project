# 🔄 Sincronización Automática de Bases de Datos

## 📋 Descripción

Este proyecto ahora incluye **sincronización automática de bases de datos** que se ejecuta cada vez que se inician los contenedores. Esto significa que:

- ✅ **Las bases de datos se crean automáticamente** si no existen
- ✅ **Las tablas se crean automáticamente** si no existen
- ✅ **Las tablas se actualizan automáticamente** si hay cambios en los modelos
- ✅ **No se pierden datos existentes** durante las actualizaciones

## 🚀 Inicio Rápido

### Opción 1: Script Automatizado (Recomendado)
```powershell
# Ejecutar el script que incluye inicialización de BD
.\start-with-db-init.ps1
```

### Opción 2: Comandos Manuales
```powershell
# 1. Instalar dependencias
npm install

# 2. Inicializar bases de datos
npm run init-db

# 3. Iniciar contenedores
docker-compose up -d
```

### Opción 3: Script Original (Requiere BD preexistente)
```powershell
# Usar el script original
.\start.ps1
```

## 🗄️ Configuración de Base de Datos

### Variables de Entorno (.env)
```env
# Configuración de MySQL
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root

# Nombres de las bases de datos
AUTH_DB_NAME=auth_service_db
CALENDAR_DB_NAME=calendar_service_db
```

### Bases de Datos Creadas Automáticamente

1. **auth_service_db**
   - Tabla: `users` (usuarios del sistema)
   - Tabla: `tokens` (tokens de autenticación)

2. **calendar_service_db**
   - Tabla: `events` (eventos del calendario)

## 🔧 Cómo Funciona

### 1. Inicialización de Bases de Datos
El script `init-databases.js` se ejecuta antes de iniciar los contenedores y:
- Se conecta a MySQL usando las credenciales del archivo `.env`
- Crea las bases de datos `auth_service_db` y `calendar_service_db` si no existen
- No afecta las bases de datos existentes

### 2. Sincronización de Modelos
Cada servicio (Auth y Calendar) ejecuta automáticamente:
```javascript
// En auth-service/src/main.js y calendar-service/src/main.js
await sequelize.sync({ alter: true });
```

Esto significa:
- **`alter: true`**: Actualiza las tablas existentes sin perder datos
- **Crea tablas nuevas** si no existen
- **Agrega columnas nuevas** si se añaden al modelo
- **Modifica tipos de datos** si cambian en el modelo
- **NO elimina columnas** existentes (seguro para producción)

## 📊 Modelos de Datos

### Auth Service
```javascript
// Modelo User
{
  id: INTEGER (Primary Key)
  username: STRING (Unique)
  email: STRING (Unique)
  password: STRING (Hashed)
  firstName: STRING
  lastName: STRING
  department: STRING
  role: ENUM('empleado', 'administrador', 'director')
  jobTitle: STRING
  isActive: BOOLEAN
  createdAt: DATE
  updatedAt: DATE
}

// Modelo Token
{
  id: INTEGER (Primary Key)
  token: STRING
  type: ENUM('refresh', 'reset')
  userId: INTEGER (Foreign Key)
  expiresAt: DATE
  createdAt: DATE
  updatedAt: DATE
}
```

### Calendar Service
```javascript
// Modelo Event
{
  id: INTEGER (Primary Key)
  title: STRING
  description: TEXT
  responsible: STRING
  participants: JSON (Array)
  roomReserved: STRING
  startTime: DATE
  endTime: DATE
  eventType: STRING
  createdAt: DATE
  updatedAt: DATE
  deletedAt: DATE (Soft Delete)
}
```

## 🛠️ Comandos Útiles

```powershell
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f auth-service
docker-compose logs -f calendar-service

# Reiniciar un servicio específico
docker-compose restart auth-service

# Detener todos los servicios
docker-compose down

# Reconstruir e iniciar
docker-compose up -d --build

# Verificar estado de contenedores
docker-compose ps
```

## 🔍 Solución de Problemas

### Error: "Database connection failed"
1. Verifica que MySQL esté ejecutándose
2. Confirma las credenciales en el archivo `.env`
3. Asegúrate de que el puerto 3306 esté disponible

### Error: "Table doesn't exist"
1. Ejecuta `npm run init-db` manualmente
2. Reinicia los contenedores: `docker-compose restart`
3. Verifica los logs: `docker-compose logs -f`

### Error: "Cannot connect to MySQL server"
1. Si usas MySQL local, asegúrate de que esté ejecutándose
2. Si usas Docker MySQL, agrega el servicio al `docker-compose.yml`
3. Verifica la configuración de red

### Error: "Database creation permission denied"
- **Solución 1**: Usa el script SQL manual:
  ```sql
  -- Ejecuta create-databases-manual.sql en tu cliente MySQL
  ```
- **Solución 2**: Otorga privilegios CREATE:
  ```sql
  GRANT CREATE ON *.* TO 'root'@'%';
  FLUSH PRIVILEGES;
  ```
- **Solución 3**: Crea las bases de datos manualmente:
  ```sql
  CREATE DATABASE IF NOT EXISTS auth_service_db;
  CREATE DATABASE IF NOT EXISTS calendar_service_db;
  ```

## 🚨 Consideraciones de Producción

- **Backups**: Siempre haz backup antes de actualizar en producción
- **Migraciones**: Para cambios complejos, considera usar migraciones de Sequelize
- **Monitoreo**: Supervisa los logs durante las actualizaciones
- **Testing**: Prueba los cambios en un ambiente de desarrollo primero

## 📝 Logs de Sincronización

Busca estos mensajes en los logs para confirmar que la sincronización funciona:

```
✅ Database 'auth_service_db' created or already exists
✅ Database 'calendar_service_db' created or already exists
✅ All databases initialized successfully!
Database connection established successfully
Database synchronized successfully
```

## 🔄 Actualizaciones Futuras

Cuando agregues nuevos campos a los modelos:
1. Modifica el modelo en el archivo correspondiente
2. Reinicia el servicio: `docker-compose restart [service-name]`
3. La tabla se actualizará automáticamente

¡La sincronización automática hace que el desarrollo y despliegue sean mucho más simples! 🎉