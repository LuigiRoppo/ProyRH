# Etapa 1: Construcción del frontend
FROM node:18 AS build

WORKDIR /app/frontend

# Copiar archivos de configuración del frontend
COPY control-horario/package*.json ./
RUN npm install

# Copiar el resto del código del frontend y construir
COPY control-horario ./
RUN npm run build

# Etapa 2: Configuración del backend
FROM node:18

WORKDIR /app/backend

# Copiar archivos de configuración del backend
COPY control-horario-backend/package*.json ./
RUN npm install

# Copiar el código del backend
COPY control-horario-backend ./

# Copiar el build del frontend al directorio público del backend
COPY --from=build /app/frontend/build ./public

# Exponer el puerto que usará la aplicación backend
EXPOSE 3001

# Comando para ejecutar la aplicación backend
CMD ["npm", "start"]
