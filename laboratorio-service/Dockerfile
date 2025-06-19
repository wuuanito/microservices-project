# Usar imagen base de Node.js
FROM node:16-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para sharp
RUN apk add --no-cache \
    libc6-compat \
    vips-dev

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear directorio para uploads
RUN mkdir -p uploads/defectos

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S laboratorio -u 1001

# Cambiar permisos del directorio uploads
RUN chown -R laboratorio:nodejs uploads
RUN chmod -R 755 uploads

# Cambiar a usuario no-root
USER laboratorio

# Exponer puerto
EXPOSE 3004

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Comando para iniciar la aplicación
CMD ["npm", "start"]