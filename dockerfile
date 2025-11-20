FROM node:20-alpine3.21

WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package.json ./
COPY package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# # Generar cliente de Prisma
# RUN npx prisma generate

# Exponer el puerto
EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npm run start:dev"]

