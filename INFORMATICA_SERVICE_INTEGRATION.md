# Integración del Servicio de Informática

## Resumen
Este documento describe la integración completa del `informatica-service` en la arquitectura de microservicios, incluyendo dockerización y configuración del API Gateway.

## Componentes Implementados

### 1. Dockerización del Servicio
- ✅ **Dockerfile**: Creado en `informatica-service/Dockerfile`
  - Basado en Node.js 18 Alpine
  - Configuración de usuario no-root para seguridad
  - Health check integrado
  - Puerto 3001 expuesto

### 2. Configuración Docker Compose
- ✅ **docker-compose.yml**: Servicio agregado con:
  - Puerto: 3001
  - Variables de entorno para base de datos
  - Dependencia del auth-service
  - Volúmenes para desarrollo
  - Red de microservicios

### 3. Variables de Entorno
- ✅ **.env**: Agregadas variables:
  ```
  INFORMATICA_DB_NAME=informatica_db
  INFORMATICA_SERVICE_PORT=3001
  ```

### 4. Integración con API Gateway
- ✅ **Configuración**: `api-gateway/src/config/app.config.js`
  - URL del servicio: `http://informatica-service:3001`
- ✅ **Rutas**: `api-gateway/src/routes/informatica.routes.js`
  - Proxy middleware configurado
  - Autenticación requerida
  - Manejo de errores
  - Logging de requests
- ✅ **Routing**: Integrado en `api-gateway/src/routes/index.js`
  - Ruta base: `/api/informatica`

### 5. Base de Datos
- ✅ **Inicialización automática**: `init-databases.js`
  - Creación de `informatica_db`
- ✅ **Script manual**: `create-databases-manual.sql`
  - Comando SQL para creación manual
- ✅ **Inicialización de tablas**: Existente en `informatica-service/scripts/initDatabase.js`

### 6. Health Check
- ✅ **Endpoint**: `/health` agregado al servidor
  - Respuesta: `{"status": "ok", "service": "informatica-service"}`
  - Integrado con Docker health check

### 7. Documentación API
- ✅ **Postman Collection**: `informatica-service-postman.json`
  - Endpoints principales documentados
  - Configuración de autenticación
  - Ejemplos de requests

## Endpoints Disponibles

Todos los endpoints están disponibles a través del API Gateway con el prefijo `/api/informatica`:

### Gestión de Equipos
- `GET /api/informatica/equipos` - Listar equipos
- `POST /api/informatica/equipos` - Crear equipo
- `PUT /api/informatica/equipos/:id` - Actualizar equipo
- `DELETE /api/informatica/equipos/:id` - Eliminar equipo

### Gestión de Servidores
- `GET /api/informatica/servidores` - Listar servidores
- `POST /api/informatica/servidores` - Crear servidor
- `PUT /api/informatica/servidores/:id` - Actualizar servidor
- `DELETE /api/informatica/servidores/:id` - Eliminar servidor

### Otros Recursos
- `GET /api/informatica/switches` - Gestión de switches
- `GET /api/informatica/usuarios-dominio` - Usuarios de dominio
- `GET /api/informatica/cuentas-office` - Cuentas Office
- `GET /api/informatica/camaras-seguridad` - Cámaras de seguridad
- `GET /api/informatica/programas` - Programas instalados
- `GET /api/informatica/raspberry` - Dispositivos Raspberry Pi
- `GET /api/informatica/inventario` - Inventario general

## Instrucciones de Despliegue

### 1. Inicializar Base de Datos
```bash
# Opción 1: Automática
node init-databases.js

# Opción 2: Manual (si hay problemas de permisos)
# Ejecutar create-databases-manual.sql en MySQL
```

### 2. Inicializar Tablas del Servicio
```bash
cd informatica-service
npm run init-db
```

### 3. Levantar Servicios
```bash
# Desde el directorio raíz del proyecto
docker-compose up -d

# O usar el script de PowerShell
.\start.ps1
```

### 4. Verificar Funcionamiento
```bash
# Health check del API Gateway
curl http://localhost:3000/health

# Health check del servicio de informática
curl http://localhost:3000/api/informatica/health

# Diagnóstico completo
curl http://localhost:3000/diagnose
```

## Autenticación

Todos los endpoints del servicio de informática requieren autenticación JWT:

1. **Login**: `POST /api/auth/login`
2. **Usar token**: Incluir en header `Authorization: Bearer <token>`

## Estructura de Archivos Modificados/Creados

```
microservices-project/
├── informatica-service/
│   ├── Dockerfile                     # ✅ NUEVO
│   ├── server.js                      # ✅ MODIFICADO (health endpoint)
│   └── ...
├── api-gateway/
│   └── src/
│       ├── config/app.config.js       # ✅ MODIFICADO
│       └── routes/
│           ├── index.js               # ✅ MODIFICADO
│           └── informatica.routes.js  # ✅ NUEVO
├── docker-compose.yml                 # ✅ MODIFICADO
├── .env                              # ✅ MODIFICADO
├── init-databases.js                 # ✅ MODIFICADO
├── create-databases-manual.sql       # ✅ MODIFICADO
├── informatica-service-postman.json  # ✅ NUEVO
└── INFORMATICA_SERVICE_INTEGRATION.md # ✅ NUEVO
```

## Próximos Pasos

1. **Testing**: Importar la colección de Postman y probar todos los endpoints
2. **Monitoreo**: Configurar logs y métricas específicas
3. **Seguridad**: Revisar permisos y validaciones
4. **Performance**: Optimizar consultas de base de datos si es necesario

## Troubleshooting

### Problema: Servicio no responde
```bash
# Verificar logs
docker logs informatica-service

# Verificar conectividad de red
docker network ls
docker network inspect microservices-project_microservices-network
```

### Problema: Base de datos no conecta
```bash
# Verificar variables de entorno
docker exec informatica-service env | grep DB_

# Probar conexión manual
docker exec -it informatica-service npm run init-db
```

### Problema: API Gateway no enruta
```bash
# Verificar configuración del gateway
curl http://localhost:3000/diagnose

# Verificar logs del gateway
docker logs api-gateway
```