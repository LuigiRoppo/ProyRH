# Usa una imagen base oficial de Node.js
FROM node:18

# Establece el directorio de trabajo para el frontend
WORKDIR /ProyRH

# Copia los archivos package.json y package-lock.json para el frontend
COPY package.json package-lock.json ./

# Instala las dependencias del frontend
RUN npm install

# Copia el resto del código del frontend
COPY . .

# Cambia al directorio de control-horario y copia sus archivos package.json y package-lock.json
WORKDIR /ProyRH/control-horario
COPY control-horario/package*.json ./

# Instala las dependencias de control-horario
RUN npm install

# Construye la aplicación frontend
RUN npm run build

# Cambia al directorio de control-horario-backend y copia sus archivos package.json y package-lock.json
WORKDIR /ProyRH/control-horario-backend
COPY control-horario-backend/package*.json ./

# Instala las dependencias del backend
RUN npm install

# Copia todo el código del backend al contenedor
COPY control-horario-backend/ .

# Exponer el puerto que usará la aplicación backend
EXPOSE 3001

# Comando para ejecutar la aplicación backend
CMD ["npm", "start"]
