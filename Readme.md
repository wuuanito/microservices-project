# Proyecto de Microservicios

Este proyecto implementa una arquitectura de microservicios escalable con los siguientes componentes:

- **API Gateway**: Punto de entrada para todas las solicitudes
- **Auth Service**: Servicio de autenticación y gestión de usuarios
- **Calendar Service**: Servicio para la gestión de eventos del calendario

## Requisitos previos

- Docker y Docker Compose
- PowerShell (para Windows)
- MySQL local (fuera de Docker)
- Node.js y npm (para desarrollo local)

## Configuración inicial

### 🚀 Inicio Rápido con Sincronización Automática (Recomendado)

```powershell
# Opción 1: Script automatizado que incluye inicialización de BD
.\start-with-db-init.ps1

# Opción 2: Comandos paso a paso
npm install
npm run init-db
docker-compose up -d
```

### 📋 Configuración Manual (Alternativa)

1. **Crear las bases de datos manualmente:**
   ```sql
   CREATE DATABASE auth_service_db;
   CREATE DATABASE calendar_service_db;
   ```

2. **Iniciar los servicios:**
   ```bash
   .\start.ps1
   ```

> **✨ Novedad**: Ahora las bases de datos y tablas se crean/actualizan automáticamente al iniciar los contenedores. Ver [DATABASE_SYNC_README.md](DATABASE_SYNC_README.md) para más detalles.

## Endpoints de la API

### API Gateway

Todos los endpoints se acceden a través del API Gateway en `http://localhost:3000`.

### Autenticación y Gestión de Usuarios

(Endpoints gestionados por `auth-service`)

| Método | Endpoint | Descripción | Autenticación | Cuerpo de la solicitud |
|--------|----------|-------------|---------------|------------------------|
| GET | `/health` | Verificar estado del API Gateway | No | - |
| GET | `/diagnose` | Diagnóstico de servicios | No | - |
| POST | `/auth/register` | Registrar nuevo usuario | No | `username`, `email`, `password`, `firstName`, `lastName`, `department`, `role`, `jobTitle` |
| POST | `/auth/login` | Iniciar sesión | No | `username`/`email`, `password` |
| POST | `/auth/refresh-token` | Renovar token de acceso | No | `refreshToken` |
| POST | `/auth/logout` | Cerrar sesión | Sí | `refreshToken` |
| GET | `/auth/me` | Obtener perfil del usuario actual | Sí | - |
| PUT | `/auth/change-password` | Cambiar contraseña | Sí | `currentPassword`, `newPassword` |
| POST | `/auth/forgot-password` | Solicitar restablecimiento de contraseña | No | `email` |
| POST | `/auth/reset-password` | Restablecer contraseña | No | `token`, `newPassword` |

### Gestión de Eventos del Calendario

(Endpoints gestionados por `calendar-service`, accesibles a través de `/calendar` en el API Gateway)

| Método | Endpoint                      | Descripción                                  | Autenticación | Cuerpo de la solicitud (ejemplo)                                                                                                                               |
|--------|-------------------------------|----------------------------------------------|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| POST   | `/calendar/api/events`        | Crear un nuevo evento                        | Sí            | `{ "title": "Reunión de equipo", "description": "Discutir avances", "responsible": "usuario_id", "participants": ["id1", "id2"], "roomReserved": "Sala A", "startTime": "2024-07-30T10:00:00Z", "endTime": "2024-07-30T11:00:00Z" }` |
| GET    | `/calendar/api/events`        | Obtener todos los eventos (con filtros opcionales) | Sí            | Query params: `startDate`, `endDate`, `responsible`, `room`                                                                                                    |
| GET    | `/calendar/api/events/:id`    | Obtener un evento por ID                     | Sí            | -                                                                                                                                                            |
| PUT    | `/calendar/api/events/:id`    | Actualizar un evento existente               | Sí            | `{ "title": "Reunión de equipo (Actualizado)", ... }`                                                                                                       |
| DELETE | `/calendar/api/events/:id`    | Eliminar (soft delete) un evento             | Sí            | -                                                                                                                                                            |

### Autenticación y Gestión de Usuarios (Original - mantener por si acaso, pero la tabla de arriba es la correcta)

| Método | Endpoint | Descripción | Autenticación | Cuerpo de la solicitud |
|--------|----------|-------------|---------------|------------------------|
| GET | `/health` | Verificar estado del API Gateway | No | - |
| GET | `/diagnose` | Diagnóstico de servicios | No | - |
| POST | `/auth/register` | Registrar nuevo usuario | No | `username`, `email`, `password`, `firstName`, `lastName`, `department`, `role`, `jobTitle` |
| POST | `/auth/login` | Iniciar sesión | No | `username`/`email`, `password` |
| POST | `/auth/refresh-token` | Renovar token de acceso | No | `refreshToken` |
| POST | `/auth/logout` | Cerrar sesión | Sí | `refreshToken` |
| GET | `/auth/me` | Obtener perfil del usuario actual | Sí | - |
| PUT | `/auth/change-password` | Cambiar contraseña | Sí | `currentPassword`, `newPassword` |
| POST | `/auth/forgot-password` | Solicitar restablecimiento de contraseña | No | `email` |
| POST | `/auth/reset-password` | Restablecer contraseña | No | `token`, `newPassword` |

## Ejemplos de solicitudes

### Registro de usuario

```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "username": "tecnico1",
  "email": "tecnico1@example.com",
  "password": "password123",
  "firstName": "Carlos",
  "lastName": "Técnico",
  "department": "informatica",
  "role": "empleado",
  "jobTitle": "Técnico de Sistemas"
}
```

### Iniciar sesión

```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "tecnico1@example.com",
  "password": "password123"
}
```

### Obtener perfil del usuario (autenticado)

```
GET http://localhost:3000/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1...
```

### Cambiar contraseña (autenticado)

```
PUT http://localhost:3000/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1...
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

### Cerrar sesión (autenticado)

```
POST http://localhost:3000/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1...
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

## Departamentos y Roles

### Departamentos disponibles

- `informatica`
- `administracion`
- `internacional`
- `compras`
- `gerencia`
- `oficina_tecnica`
- `calidad`
- `laboratorio`
- `rrhh`
- `logistica`
- `mantenimiento`
- `softgel`
- `produccion`
- `sin_departamento` (valor predeterminado)

### Roles disponibles

- `director` - Acceso completo a todas las funciones
- `administrador` - Puede gestionar usuarios y funciones dentro de su departamento
- `empleado` - Acceso básico a funciones específicas de su departamento

## Autenticación

El sistema utiliza autenticación basada en JWT (JSON Web Tokens):

1. Al iniciar sesión, recibirás un `accessToken` y un `refreshToken`
2. El `accessToken` debe incluirse en el encabezado `Authorization` como un token Bearer
3. El `accessToken` expira después de un período (por defecto 1 hora)
4. Usa el endpoint `/auth/refresh-token` con el `refreshToken` para obtener nuevos tokens

## Gestión del proyecto

### Iniciar los servicios
```powershell
.\start.ps1
```

### Detener los servicios
```powershell
.\stop.ps1
```

### Verificar el estado de los servicios
```powershell
.\status.ps1
```

### Ver los logs de un servicio específico
```powershell
.\logs.ps1 api-gateway
.\logs.ps1 auth-service
.\logs.ps1 calendar-service # Logs para el nuevo servicio

.\logs.ps1 all
```

## Estructura del proyecto
```
microservices-project/
├── api-gateway/           # Servicio de API Gateway
├── auth-service/          # Servicio de autenticación
├── calendar-service/      # Servicio de calendario (NUEVO)

├── docker-compose.yml     # Configuración de Docker Compose
├── .env                   # Variables de entorno (ver .env.example en cada servicio)
├── start.ps1              # Script para iniciar los servicios
├── stop.ps1               # Script para detener los servicios
├── status.ps1             # Script para verificar el estado
└── logs.ps1               # Script para ver logs
```

## Sincronización de las bases de datos

Para sincronizar o reiniciar las bases de datos (esto eliminará todos los datos existentes):

- **Auth Service DB**:
  ```powershell
  cd microservices-project\auth-service
  node .\src\sync-db.js
  cd ..\..
  ```
- **Calendar Service DB**:
  ```powershell
  cd microservices-project\calendar-service
  node .\src\database\sync-db.js
  cd ..\..
  ```

## Usuario administrador predeterminado

Después de sincronizar la base de datos, se crea un usuario administrador con las siguientes credenciales:

- **Username**: `admin`
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `director`
- **Department**: `informatica`

## Solución de problemas

### Problemas de conexión a la base de datos

1. Verifica que MySQL esté en ejecución
2. Asegúrate de que las bases de datos `auth_service_db` y `calendar_service_db` existan
3. Verifica que el usuario configurado tenga permisos en estas bases de datos
4. Comprueba que las credenciales en los archivos de configuración sean correctas

### Problemas con el API Gateway

1. Verifica que ambos servicios estén en ejecución con `.\status.ps1`
2. Revisa los logs con `.\logs.ps1 api-gateway`, `.\logs.ps1 auth-service`, o `.\logs.ps1 calendar-service`
3. Comprueba la conectividad con el endpoint de diagnóstico: `GET http://localhost:3000/diagnose`

### Errores comunes

- **404 Not Found**: Verifica que estés accediendo a la ruta correcta
- **401 Unauthorized**: Asegúrate de incluir el token de acceso en el encabezado `Authorization`
- **500 Internal Server Error**: Revisa los logs para identificar el problema

## Desarrollo y extensión

Para añadir nuevos microservicios a la arquitectura:

1. Crea una nueva carpeta para el servicio con una estructura similar a los existentes
2. Añade la configuración del servicio en `docker-compose.yml`
3. Actualiza el API Gateway para enrutar las solicitudes al nuevo servicio
4. Reinicia los servicios con `.\stop.ps1` y `.\start.ps1`

---

Este proyecto implementa prácticas recomendadas para arquitecturas de microservicios, incluyendo:
- Separación de responsabilidades
- API Gateway centralizado
- Autenticación basada en tokens
- Control de acceso basado en roles y departamentos
- Docker para contenerización
- Scripts de gestión para facilitar la operación

Para cualquier duda o problema, revisa los logs de los servicios correspondientes y consulta la documentación de referencia.