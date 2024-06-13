# Usa una imagen base oficial de Node.js
FROM node:18

# Establece el directorio de trabajo para el frontend
WORKDIR /ProyRH

# Copia los archivos package.json y package-lock.json para el frontend
COPY package*.json ./

# Instala las dependencias del frontend
RUN npm install

# Copia el resto del código del frontend
COPY . .

# Construye la aplicación frontend
RUN npm run build --prefix control-horario

# Establece el directorio de trabajo para el backend
WORKDIR /ProyRH/control-horario-backend

# Copia los archivos package.json y package-lock.json para el backend
COPY control-horario-backend/package*.json ./

# Instala las dependencias del backend
RUN npm install

# Copia todo el código de la aplicación al contenedor
COPY control-horario-backend/ /ProyRH/control-horario-backend/

# Exponer el puerto que usará la aplicación backend
EXPOSE 3001

# Comando para ejecutar la aplicación backend
CMD ["npm", "start", "--prefix", "control-horario-backend"]
