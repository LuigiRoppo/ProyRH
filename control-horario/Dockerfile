FROM node:18

# Establece el directorio de trabajo para el frontend
WORKDIR /app

# Copia los archivos package.json y package-lock.json para la instalación de dependencias del frontend
COPY package*.json ./

# Instala las dependencias del frontend
RUN npm install

# Copia el resto del código del frontend al contenedor
COPY . .

# Construye la aplicación frontend
RUN npm run build

# Servir la aplicación
RUN npm install -g serve
CMD ["serve", "-s", "build"]

# Exponer el puerto que usará la aplicación frontend
EXPOSE 3000
