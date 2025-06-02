# Calendar Service

Microservicio para la gestión de calendario y eventos.

## Requisitos Previos

- Node.js (v18+ recomendado)
- MySQL (o una base de datos compatible con Sequelize)

## Configuración

1.  **Clonar el repositorio principal** (si aún no lo has hecho):
    ```bash
    git clone <URL_DEL_REPOSITORIO_PRINCIPAL>
    cd microservices-project/calendar-service
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**:
    -   Copia el archivo `.env.example` a `.env`:
        ```bash
        cp .env.example .env
        ```
    -   Edita el archivo `.env` y configura tus credenciales de base de datos, especialmente `DB_PASSWORD` y `DB_NAME`.
        ```env
        PORT=3003
        DB_HOST=localhost
        DB_PORT=3306
        DB_USER=root
        DB_PASSWORD=TU_CONTRASEÑA_MYSQL_AQUÍ
        DB_NAME=calendar_service_db
        NODE_ENV=development
        ```

4.  **Crear la base de datos**:
    Asegúrate de tener una base de datos MySQL creada con el nombre especificado en `DB_NAME` (por defecto `calendar_service_db`). Puedes usar un cliente MySQL como MySQL Workbench, DBeaver, o la línea de comandos:
    ```sql
    CREATE DATABASE calendar_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
    Asegúrate de que el usuario `DB_USER` tenga los permisos necesarios sobre esta base de datos.

5.  **Sincronizar la base de datos**:
    Este comando creará las tablas necesarias en la base de datos según los modelos definidos.
    ```bash
    npm run sync-db
    ```
    *Nota: La primera vez, o si haces cambios en los modelos, necesitarás ejecutar esto.*

## Iniciar el Servicio

-   Para desarrollo (con reinicio automático ante cambios):
    ```bash
    npm run dev
    ```
-   Para producción:
    ```bash
    npm start
    ```

El servicio estará disponible en `http://localhost:3003` (o el puerto que hayas configurado).

## Endpoints de la API (Ejemplos)

-   `GET /`: Estado del servicio.
-   `POST /api/events`: Crear un nuevo evento.
-   `GET /api/events`: Obtener todos los eventos.
-   `GET /api/events/:id`: Obtener un evento por su ID.
-   `PUT /api/events/:id`: Actualizar un evento por su ID.
-   `DELETE /api/events/:id`: Eliminar (soft delete) un evento por su ID.

### Ejemplo de cuerpo para POST /api/events:
```json
{
  "title": "Reunión de equipo semanal",
  "description": "Discusión de avances y próximos pasos.",
  "responsible": "Juan Pérez",
  "participants": ["Ana Gómez", "Carlos López"],
  "roomReserved": "Sala de Juntas A",
  "startTime": "2024-07-15T10:00:00.000Z",
  "endTime": "2024-07-15T11:00:00.000Z"
}
```

## Estructura del Proyecto

```
calendar-service/
├── src/
│   ├── controllers/    # Controladores (lógica de solicitud/respuesta)
│   │   └── event.controller.js
│   ├── database/       # Configuración y scripts de BD
│   │   ├── sequelize.js
│   │   └── sync-db.js
│   ├── models/         # Modelos de Sequelize (definición de tablas)
│   │   └── event.model.js
│   ├── routes/         # Definición de rutas de la API
│   │   └── event.routes.js
│   ├── services/       # Lógica de negocio
│   │   └── event.service.js
│   ├── utils/          # Funciones de utilidad
│   │   └── response-formatter.js
│   └── main.js         # Punto de entrada de la aplicación
├── .env                # Variables de entorno (NO subir a Git)
├── .env.example        # Ejemplo de variables de entorno
├── package.json
├── README.md
└── ... (otros archivos de configuración como .gitignore)
```