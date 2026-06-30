---
sidebar_label: "Clase"
---

﻿# Clase 09 -” Registros de Imagenes

## 1. Docker Hub
Repositorio publico por defecto.

## 2. Autenticacion
docker login
docker logout

## 3. Tag y Push
docker tag myapp:latest usuario/myapp:1.0
docker push usuario/myapp:1.0
docker pull usuario/myapp:1.0

## 4. Nomenclatura
[registry-host/][usuario/]imagen[:tag]

Ejemplos:
- nginx:alpine â†’ Docker Hub oficial
- usuario/miapp:1.0 â†’ repositorio de usuario
- ghcr.io/usuario/miapp:1.0 â†’ GitHub Container Registry

## 5. Registro Local
docker run -d -p 5000:5000 --name registry registry:2
docker tag myapp localhost:5000/myapp:1.0
docker push localhost:5000/myapp:1.0

## 6. Harbor
Registro enterprise con UI web, RBAC, escaneo de vulnerabilidades, replicacion.
