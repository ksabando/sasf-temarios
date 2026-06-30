---
sidebar_label: "Clase"
---

﻿# Clase 10 -” Multi-stage Builds y Optimizacion

## 1. El Problema
Las imagenes SDK son enormes (Java SDK ~700MB, Node SDK ~1GB).

## 2. Multi-stage Build
`
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
`

## 3. Imagenes Base Recomendadas
- Alpine: ~5MB, musl libc
- Distroless: solo la app y runtime, sin shell
- Slim: versiones reducidas de imagenes oficiales

## 4. Optimizacion de Capas
MAL - muchas capas:
RUN apt-get update
RUN apt-get install -y curl

BIEN - una capa:
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

## 5. Herramientas
- Dive: analiza capas de imagenes
- Hadolint: linter para Dockerfiles
- docker-slim: minimiza imagenes automaticamente
- Trivy: escaner de vulnerabilidades
