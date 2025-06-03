# Guía de Pruebas con Postman - Arquitectura de Microservicios

## 📋 Descripción

Esta guía te ayudará a probar toda la arquitectura de microservicios usando Postman. La colección incluye todos los endpoints disponibles en el sistema, organizados por servicios.

## 🚀 Configuración Inicial

### 1. Importar Archivos en Postman

1. **Importar la Colección:**
   - Abre Postman
   - Haz clic en "Import"
   - Selecciona el archivo `Microservicios_Collection.postman_collection.json`

2. **Importar el Entorno:**
   - En Postman, ve a "Environments"
   - Haz clic en "Import"
   - Selecciona el archivo `Microservicios_Environment.postman_environment.json`
   - Activa el entorno "Microservicios - Desarrollo"

### 2. Verificar que los Servicios Estén Ejecutándose

Antes de usar la colección, asegúrate de que todos los servicios estén en funcionamiento:

```powershell
# Iniciar todos los servicios
.\start.ps1

# Verificar el estado
.\status.ps1
```

Los servicios deben estar disponibles en:
- **API Gateway:** http://localhost:3000
- **Auth Service:** http://localhost:4001 (acceso directo)
- **Calendar Service:** http://localhost:3003 (acceso directo)


## 📁 Estructura de la Colección

### 🔧 Health & Diagnostics
- **Health Check - API Gateway:** Verifica que el API Gateway esté funcionando
- **Diagnose Services:** Obtiene el estado de todos los servicios conectados

### 🔐 Authentication Service
- **Register User:** Registra un nuevo usuario
- **Login:** Inicia sesión (guarda automáticamente los tokens)
- **Login Admin:** Inicia sesión con el usuario administrador predeterminado
- **Get User Profile:** Obtiene el perfil del usuario autenticado
- **Change Password:** Cambia la contraseña del usuario
- **Refresh Token:** Renueva el token de acceso
- **Forgot Password:** Solicita restablecimiento de contraseña
- **Reset Password:** Restablece la contraseña con token
- **Logout:** Cierra la sesión del usuario

### 📅 Calendar Service
- **Get All Events:** Obtiene todos los eventos
- **Get Events with Filters:** Obtiene eventos con filtros opcionales
- **Create Event:** Crea un nuevo evento (guarda automáticamente el ID)
- **Get Event by ID:** Obtiene un evento específico
- **Update Event:** Actualiza un evento existente
- **Delete Event:** Elimina un evento (soft delete)

### 👥 User Management Examples
- **Register - Administrador:** Ejemplo de registro con rol administrador
- **Register - Director:** Ejemplo de registro con rol director
- **Register - Empleado Producción:** Ejemplo de registro de empleado

## 🔄 Flujo de Pruebas Recomendado

### 1. Verificación Inicial
1. Ejecuta **Health Check - API Gateway**
2. Ejecuta **Diagnose Services**

### 2. Autenticación
1. **Opción A:** Usa **Login Admin** para acceso inmediato
2. **Opción B:** Registra un nuevo usuario con **Register User** y luego **Login**

### 3. Gestión de Calendario
1. **Get All Events** - Ver eventos existentes
2. **Create Event** - Crear un nuevo evento
3. **Get Event by ID** - Verificar el evento creado
4. **Update Event** - Modificar el evento
5. **Get Events with Filters** - Probar filtros
6. **Delete Event** - Eliminar el evento

## 🔑 Variables de Entorno

La colección utiliza las siguientes variables que se configuran automáticamente:

- `base_url`: URL base del API Gateway (http://localhost:3000)
- `access_token`: Token de acceso JWT (se guarda automáticamente al hacer login)
- `refresh_token`: Token de renovación (se guarda automáticamente al hacer login)
- `user_id`: ID del usuario autenticado (se guarda automáticamente)
- `event_id`: ID del último evento creado (se guarda automáticamente)

## 👤 Usuarios Predeterminados

### Usuario Administrador
- **Username:** `admin`
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** `director`
- **Department:** `informatica`

## 🏢 Departamentos Disponibles

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

## 🎭 Roles Disponibles

- `director` - Acceso completo a todas las funciones
- `administrador` - Puede gestionar usuarios y funciones dentro de su departamento
- `empleado` - Acceso básico a funciones específicas de su departamento

## 🔍 Scripts Automáticos

La colección incluye scripts que automatizan el manejo de tokens y variables:

### Scripts de Login
- Guardan automáticamente `access_token`, `refresh_token` y `user_id`
- Se ejecutan en las peticiones de Login y Refresh Token

### Scripts de Eventos
- Guardan automáticamente el `event_id` al crear eventos
- Facilitan las pruebas de actualización y eliminación

## 🚨 Solución de Problemas

### Error 404 - Not Found
- Verifica que todos los servicios estén ejecutándose
- Comprueba que estés usando el entorno correcto
- Revisa que la URL base sea `http://localhost:3000`

### Error 401 - Unauthorized
- Asegúrate de haber hecho login primero
- Verifica que el token no haya expirado
- Usa **Refresh Token** si es necesario

### Error 500 - Internal Server Error
- Revisa los logs de los servicios:
  ```powershell
  .\logs.ps1 api-gateway
  .\logs.ps1 auth-service
  .\logs.ps1 calendar-service
  ```
- Verifica que las bases de datos estén configuradas correctamente

### Problemas de Conexión
- Verifica que MySQL esté ejecutándose
- Comprueba que las bases de datos `auth_service_db` y `calendar_service_db` existan
- Revisa las credenciales de base de datos en los archivos `.env`

## 📝 Notas Adicionales

1. **Orden de Ejecución:** Siempre ejecuta las peticiones de autenticación antes que las que requieren autorización

2. **Tokens JWT:** Los tokens tienen una duración limitada (por defecto 1 hora). Usa **Refresh Token** para renovarlos

3. **Soft Delete:** Los eventos eliminados no se borran físicamente, solo se marcan como eliminados

4. **Filtros de Eventos:** Puedes filtrar eventos por fecha, responsable y sala usando query parameters

5. **Validación:** Todos los endpoints incluyen validación de datos. Revisa los mensajes de error para información específica

## 🎯 Casos de Uso Comunes

### Flujo Completo de Usuario
1. Registrar usuario → Login → Ver perfil → Cambiar contraseña → Logout

### Flujo Completo de Eventos
1. Login → Crear evento → Ver eventos → Actualizar evento → Eliminar evento

### Prueba de Roles y Permisos
1. Registrar usuarios con diferentes roles
2. Probar acceso a diferentes funcionalidades
3. Verificar restricciones por departamento

---

¡Ahora estás listo para probar toda la arquitectura de microservicios! 🚀