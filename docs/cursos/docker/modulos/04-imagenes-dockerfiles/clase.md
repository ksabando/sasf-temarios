---
sidebar_label: "Clase"
---

﻿# Clase 04 -” Imagenes y Dockerfiles

## 1. Imagenes Docker
Las imagenes son plantillas inmutables de solo lectura. Se construyen en capas.

## 2. Comandos de Imagenes
docker pull nginx:alpine   # descargar imagen
docker images               # listar imagenes locales
docker rmi nginx:alpine     # eliminar imagen
docker history nginx:alpine # ver capas
docker build -t myapp .     # construir desde Dockerfile

## 3. Sintaxis de Dockerfile
FROM: Imagen base
RUN: Ejecutar comando en build
COPY: Copiar archivos locales
ADD: Copiar con soporte URLs/tar
CMD: Comando por defecto al ejecutar
ENTRYPOINT: Comando principal (no sobreescribible)
EXPOSE: Puerto que escucha el contenedor
ENV: Variable de entorno
ARG: Variable de build-time
WORKDIR: Directorio de trabajo
USER: Usuario de ejecucion

## 4. Ejemplo Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]

## 5. .dockerignore
node_modules
.git
*.md
.DS_Store
