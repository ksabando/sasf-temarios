---
sidebar_label: "Clase"
---

﻿# Clase 08 -” Variables de Entorno y Configuracion

## 1. Variables en Dockerfile
ENV NODE_ENV=production
ENV PORT=3000
ARG BUILD_VERSION=1.0

## 2. Variables en runtime
docker run -e DB_HOST=localhost -e DB_PORT=5432 app
docker run --env-file .env app

## 3. Variables en Compose
`
services:
  app:
    environment:
      - DB_HOST=db
      - DB_PORT=5432
    env_file:
      - .env
`

## 4. Interpolacion en Compose
Archivo .env:
TAG=1.0.0

En compose: image: myapp:

## 5. Secrets en Compose (v3.1+)
`
services:
  app:
    secrets:
      - db_password

secrets:
  db_password:
    file: ./db_password.txt
`

## 6. Orden de Precedencia
1. -e flags en run
2. environment en Compose
3. env_file
4. .env file
5. Dockerfile ENV
