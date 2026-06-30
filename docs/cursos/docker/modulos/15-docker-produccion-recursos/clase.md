---
sidebar_label: "Clase"
---

﻿# Clase 15 -” Docker en Produccion

## 1. Limites de Recursos
docker run -d --memory=512m --memory-reservation=256m nginx
docker run -d --cpus=1.5 nginx
docker run -d --pids-limit=100 nginx

## 2. Politicas de Reinicio
no: No reiniciar (default)
on-failure[:max]: Reiniciar si exit code != 0
always: Siempre reiniciar
unless-stopped: Reiniciar siempre excepto si se detuvo manualmente

docker run -d --restart unless-stopped nginx
docker run -d --restart on-failure:5 nginx

## 3. Graceful Shutdown
docker stop --time=30 web  # espera 30s antes de SIGKILL

## 4. Limpieza
docker system df              # uso de disco
docker system prune -a        # limpiar todo lo no usado
docker container prune        # solo contenedores
docker image prune -a         # solo imagenes
docker volume prune           # solo volumenes
docker network prune          # solo redes

## 5. Actualizacion en Caliente
docker update --memory=1g --cpus=2 web
