---
sidebar_label: "Ejercicio"
---

﻿# Ejercicios -” Imagenes y Dockerfiles

## Ejercicio 1: Pull y explore
docker pull alpine:latest. Usa docker history alpine:latest para ver las capas.

## Ejercicio 2: Dockerfile simple
Crea un Dockerfile que use nginx:alpine, copie un index.html personalizado, exponga puerto 80.

## Ejercicio 3: Build con nombre
Construye: docker build -t my-nginx . y ejecuta el contenedor.

## Ejercicio 4: Cache
Crea un Dockerfile con 3 RUN commands. Build dos veces. Observa el uso de cache.

## Ejercicio 5: .dockerignore
Crea un .dockerignore, agrega archivos, verifica que no se copian al build.
