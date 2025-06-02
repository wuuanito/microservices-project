# Dockerfile para calendar-service
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
# Se recomienda usar --omit=dev en producción o si no necesitas las devDependencies en la imagen
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que corre la aplicación
EXPOSE 3003

# Variables de entorno (pueden ser sobrescritas en docker-compose.yml)
ENV NODE_ENV=development
ENV PORT=3003

# Comando para iniciar la aplicación
CMD ["npm", "start"]