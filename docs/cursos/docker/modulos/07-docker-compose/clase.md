---
sidebar_label: "Clase"
---

﻿# Clase 07 -” Docker Compose

## 1. Que es Docker Compose?
Herramienta para definir y ejecutar aplicaciones multi-contenedor.

## 2. docker-compose.yml
```
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## 3. Comandos Esenciales
docker compose up -d       # levantar servicios
docker compose down        # detener y eliminar
docker compose ps          # listar servicios
docker compose logs -f     # logs en tiempo real
docker compose exec web sh # ejecutar comando
docker compose build       # construir imagenes

## 4. depends_on
```
services:
  app:
    depends_on:
      - db
      - redis
```

## 5. Healthchecks
```
services:
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```
