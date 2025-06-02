# Dockerfile para frontend-service
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 5173

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV VITE_API_URL=http://localhost:3000

# Comando para iniciar la aplicación en desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]