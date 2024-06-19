# Usa una imagen base oficial de Node.js
FROM node:18

# Establece el directorio de trabajo para el frontend
WORKDIR /app

# Copia los archivos package.json y package-lock.json para el frontend
COPY package.json package-lock.json ./

# Instala las dependencias del frontend
RUN npm install

# Copia el resto del código del frontend
COPY . .

# Construye la aplicación frontend
RUN npm run build

# Servir la aplicación frontend
RUN npm install -g serve
CMD ["serve", "-s", "build"]
