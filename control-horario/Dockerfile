# Usa una imagen base oficial de Node.js
FROM node:18

# Establece el directorio de trabajo para el frontend
WORKDIR /ProyRH/control-horario

# Copia los archivos package.json y package-lock.json para el frontend
COPY control-horario/package*.json ./

# Instala las dependencias del frontend
RUN npm install

# Copia el resto del código del frontend
COPY control-horario/ .

# Construye la aplicación frontend
RUN npm run build

# Servir la aplicación frontend
RUN npm install -g serve
CMD ["serve", "-s", "build"]
