module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: './api-gateway/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        AUTH_SERVICE_URL: 'http://localhost:4001',
        CALENDAR_SERVICE_URL: 'http://localhost:3003',
        TICKET_SERVICE_URL: 'http://localhost:4003' // Asumiendo que ticket-service corre en 4003
      },
    },
    {
      name: 'auth-service',
      script: './auth-service/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4001,
        // Asegúrate de que las variables de entorno de la base de datos estén configuradas en el entorno de ejecución o aquí
      },
    },
    {
      name: 'calendar-service',
      script: './calendar-service/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3003,
        // Asegúrate de que las variables de entorno de la base de datos estén configuradas en el entorno de ejecución o aquí
      },
    },
    {
      name: 'ticket-service',
      script: './ticket-service/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4003, // Corregido para ticket-service
        AUTH_SERVICE_URL: 'http://localhost:4001',
        // Asegúrate de que las variables de entorno de la base de datos estén configuradas en el entorno de ejecución o aquí
      },
    },
  ],
};