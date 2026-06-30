---
sidebar_label: "Clase"
---

﻿# Clase 22 -” Docker con Aplicaciones

## 1. Spring Boot (multi-stage)
```
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1
CMD ["java", "-jar", "app.jar"]
```

## 2. Node.js (multi-stage)
```
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## 3. Python
```
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

## 4. Stack Completo con Compose
app + PostgreSQL + Redis con healthchecks y variables de entorno.

## 5. Hot Reload en Desarrollo
Montar codigo como bind mount + nodemon para desarrollo.
