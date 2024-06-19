FROM node:18

# Establece el directorio de trabajo para el backend
WORKDIR /app

# Copia los archivos package.json y package-lock.json para la instalación de dependencias del backend
COPY package*.json ./

# Instala las dependencias del backend
RUN npm install

# Copia el resto del código del backend al contenedor
COPY . .

# Exponer el puerto que usará la aplicación backend
EXPOSE 3001

# Comando para ejecutar la aplicación backend
CMD ["npm", "start"]
