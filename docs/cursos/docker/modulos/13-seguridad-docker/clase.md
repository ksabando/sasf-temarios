---
sidebar_label: "Clase"
---

﻿# Clase 13 -” Seguridad en Docker

## 1. Principios de Seguridad
- Ejecutar como no-root
- Minimos privilegios
- Imagenes pequenas = menor superficie de ataque
- Escaneo de vulnerabilidades

## 2. Usuario No-Root
`
FROM node:20-alpine
RUN adduser -D appuser
USER appuser
WORKDIR /home/appuser
COPY --chown=appuser . .
`

## 3. Capacidades de Linux
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx
docker run --rm alpine getcap -r /

## 4. Opciones de Seguridad
docker run --security-opt no-new-privileges:true nginx
docker run --security-opt seccomp=default.json nginx
docker run --security-opt apparmor=docker-default nginx

## 5. Escaneo de Vulnerabilidades
trivy image nginx:alpine
docker scout quickview nginx:alpine

## 6. Docker Content Trust
export DOCKER_CONTENT_TRUST=1
docker pull nginx:alpine  # solo imagenes firmadas
