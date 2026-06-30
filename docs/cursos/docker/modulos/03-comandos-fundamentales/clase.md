---
sidebar_label: "Clase"
---

﻿# Clase 03 -” Comandos Fundamentales de Docker

## 1. Ciclo de Vida de un Contenedor
docker run -> docker stop -> docker start -> docker restart -> docker rm

## 2. Comandos Esenciales
docker run: Crear y ejecutar contenedor
docker ps: Listar contenedores activos
docker ps -a: Listar todos los contenedores
docker stop: Detener contenedor graceful (SIGTERM)
docker kill: Detener contenedor forzado (SIGKILL)
docker rm: Eliminar contenedor
docker logs: Ver logs del contenedor
docker exec: Ejecutar comando en contenedor activo
docker inspect: Metadatos detallados en JSON
docker stats: Estadisticas de uso de recursos

## 3. Flags Importantes
-d (detach): ejecutar en background
-it (interactive + tty): modo interactivo
--rm: eliminar contenedor al detenerse
--name: asignar nombre
-p HOST:CONTAINER: mapear puertos
-e VAR=value: variables de entorno

## 4. Ejemplos Rapidos
docker run -d --name web -p 80:80 nginx
docker exec -it web bash
docker logs -f web
docker inspect web | grep IPAddress
