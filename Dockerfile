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

# Copia el resto del código del backend al contenedor
COPY control-horario-backend/ .

# Exponer el puerto que usará la aplicación backend
EXPOSE 3001

# Comando para ejecutar la aplicación backend
CMD ["npm", "start"]



# Agregar script de verificación de conexión
RUN apt-get update && apt-get install -y postgresql-client
COPY check-db.sh /usr/local/bin/check-db.sh
RUN chmod +x /usr/local/bin/check-db.sh
CMD ["check-db.sh"]