---
sidebar_label: "Soluciones"
---

# Soluciones M22 — Docker con Aplicaciones

## Ejercicio 1: Dockerizar Spring Boot
**Solución esperada**:
```dockerfile
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
```
Multi-stage: builder con Maven, runtime con JRE-alpine. Imagen ~200 MB en lugar de ~600 MB.

**Posibles mejoras**:
- Usar `layertools` de Spring Boot (2.3+) para separar dependencias/código en capas independientes y maximizar cache de build: `java -Djarmode=layertools -jar app.jar extract`.
- Agregar `USER` no-root y HEALTHCHECK: `HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:8080/actuator/health || exit 1`.
- Usar `eclipse-temurin:21-jre-alpine` con JVM flags de producción: `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0` para que la JVM respete los límites de cgroups.

---

## Ejercicio 2: Dockerizar Node.js
**Solución esperada**:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```
Multi-stage: builder con npm ci, runtime con solo producción.

**Posibles mejoras**:
- Agregar HEALTHCHECK para verificar que la app responde: `HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:3000/health || exit 1`.
- Usar `USER node` (usuario no-root predefinido en la imagen `node:*-alpine`).
- Agregar `.dockerignore` con `node_modules`, `npm-debug.log`, `.git` para minimizar el build context.
- Considerar `distroless/nodejs` como imagen final para producción sin shell ni package manager.

---

## Ejercicio 3: Docker Compose con múltiples servicios
**Solución esperada**:
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
volumes:
  pgdata:
```
`docker compose up -d` levanta los 3 servicios. App conecta a db y redis usando los nombres de servicio como hostnames.

**Posibles mejoras**:
- Agregar HEALTHCHECK a todos los servicios y usar `condition: service_healthy` en `depends_on` para garantizar orden de inicio y readiness.
- Configurar variables de entorno para credenciales usando archivo `.env` (no versionado) en lugar de hardcodear en el compose file.
- Agregar `restart: unless-stopped` en servicios de infraestructura para que sobrevivan a reinicios del daemon.

---

## Ejercicio 4: Hot reload para desarrollo
**Solución esperada**:
```yaml
services:
  app:
    image: node:20-alpine
    working_dir: /app
    command: npx nodemon src/index.js
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
```
Montar código fuente como bind mount + nodemon (file watcher) para hot reload. Volumen anónimo para `node_modules` previene sobrescritura lenta.

**Posibles mejoras**:
- En WSL 2 / macOS, usar `:delegated` o `:cached` en el bind mount para mejor rendimiento: `- .:/app:delegated`.
- Usar `docker compose watch` (Compose v2.22+) para recarga automática sin nodemon dentro del contenedor: define reglas de `sync` y `rebuild` en el compose file.
- Para Python: `uvicorn --reload` o `flask run --reload`. Para Go: `air`. Para Spring Boot: `spring-boot-devtools` + bind mount del directorio `target/classes`.

---

## Ejercicio 5: condition: service_healthy
**Solución esperada**:
```yaml
app:
  depends_on:
    db:
      condition: service_healthy
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
    start_period: 30s
```
`condition: service_healthy` en `depends_on` para orden de inicio con verificación de readiness.

**Posibles mejoras**:
- Implementar retry logic en la aplicación como defensa en profundidad (la app debe reconectarse si la BD se reinicia después del deploy).
- Ajustar `start_period` según el tiempo real de inicialización del servicio (PostgreSQL puede tardar 20-30s en crear la BD la primera vez).
- Monitorear los tiempos de `healthy`: si consistentemente toma más de 60s, investigar la causa (falta de recursos, configuración incorrecta).
