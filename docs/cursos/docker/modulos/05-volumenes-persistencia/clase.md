---
sidebar_label: "Clase"
---

﻿# Clase 05 -” Volumenes y Persistencia de Datos

## 1. El Problema
Los contenedores son efimeros: al eliminarlos se pierden los datos.

## 2. Tipos de Montaje
- Volumes: gestionados por Docker en /var/lib/docker/volumes/
- Bind mounts: directorio del host montado en el contenedor
- tmpfs: en memoria (solo Linux)

## 3. Comandos de Volumenes
docker volume create mydata
docker volume ls
docker volume inspect mydata
docker volume rm mydata
docker volume prune

## 4. Montar Volumenes
docker run -v mydata:/data ubuntu
docker run -v /host/path:/container/path ubuntu
docker run --mount source=mydata,target=/data ubuntu

## 5. Compartir Datos entre Contenedores
docker run -v shared-data:/data --name container1 ubuntu
docker run -v shared-data:/data --name container2 ubuntu

## 6. Backup y Restore
Backup: docker run --rm -v mydata:/source -v /backup:/backup alpine tar czf /backup/mydata.tar.gz -C /source .
Restore: docker run --rm -v mydata:/target -v /backup:/backup alpine tar xzf /backup/mydata.tar.gz -C /target
