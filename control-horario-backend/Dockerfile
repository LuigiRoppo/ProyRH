# Usa una imagen base oficial de Node.js
FROM node:18

# Establece el directorio de trabajo para el backend
WORKDIR /ProyRH/control-horario-backend

# Copia los archivos package.json y package-lock.json para el backend
COPY control-horario-backend/package*.json ./

# Instala las dependencias del backend
RUN npm install

# Copia el resto del código del backend
COPY control-horario-backend/ .

# Exponer el puerto que usará la aplicación backend
EXPOSE 3001

# Comando para ejecutar la aplicación backend
CMD ["npm", "start"]
