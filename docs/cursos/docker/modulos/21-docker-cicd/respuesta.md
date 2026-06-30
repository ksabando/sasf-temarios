---
sidebar_label: "Soluciones"
---

# Soluciones M21 — Docker en CI/CD

## Ejercicio 1: Workflow de GitHub Actions
**Solución esperada**:
```yaml
# .github/workflows/docker-build.yml
name: Docker Build and Push
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .
```
Workflow YAML en `.github/workflows/docker-build.yml` que construye la imagen en cada push a main.

**Posibles mejoras**:
- Agregar login al registry y push con `docker/login-action` y `docker/build-push-action` oficiales en lugar de `docker build` plano, para usar BuildKit, cache, y secrets de forma segura.
- Agregar linting del Dockerfile: `docker run --rm -i hadolint/hadolint < Dockerfile` para validar buenas prácticas antes del build.
- Agregar escaneo de vulnerabilidades post-build: `trivy image --severity CRITICAL,HIGH --exit-code 1 myapp:${{ github.sha }}` para fallar si hay vulnerabilidades.

---

## Ejercicio 2: Autenticación segura con secrets
**Solución esperada**:
Usar secrets de GitHub y `docker/login-action`:
```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USER }}
    password: ${{ secrets.DOCKER_TOKEN }}
```
El token debe ser un Personal Access Token (PAT) de Docker Hub, no la contraseña real. El login-action usa `--password-stdin` internamente.

**Posibles mejoras**:
- Usar un registry privado en lugar de Docker Hub para evitar rate limits y mantener imágenes internas.
- Para mayor seguridad, usar secrets enmascarados (GitHub los oculta automáticamente en los logs) y rotar los PATs periódicamente (cada 90 días).
- Si usás Harbor/GHCR/ECR, usar robot accounts con permisos mínimos (solo push al proyecto específico) en lugar de cuentas con acceso global.

---

## Ejercicio 3: Cacheo de builds en CI
**Solución esperada**:
```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```
`cache-from: type=gha` y `cache-to: type=gha,mode=max` aceleran builds usando el cache de GitHub Actions entre ejecuciones del pipeline.

**Posibles mejoras**:
- Agregar un scope específico para separar caches de diferentes servicios: `cache-from: type=gha,scope=backend` y `cache-to: type=gha,scope=backend,mode=max`.
- Para repositorios con múltiples workflows, usar el mismo scope para compartir cache entre diferentes pipelines.
- Considerar `type=registry` como alternativa cuando GitHub Actions cache no está disponible (ej. otros CI/CD como GitLab CI, Jenkins).

---

## Ejercicio 4: Build multi-arquitectura
**Solución esperada**:
```yaml
- uses: docker/setup-qemu-action@v3
- uses: docker/setup-buildx-action@v3
- uses: docker/build-push-action@v5
  with:
    platforms: linux/amd64,linux/arm64
    push: true
    tags: user/app:latest
```
Requiere QEMU para emulación y Buildx como builder. `platforms: linux/amd64,linux/arm64` genera un manifest list multi-arch.

**Posibles mejoras**:
- Si tenés runners nativos ARM (Graviton, Apple Silicon), usá builders nativos en lugar de QEMU para builds más rápidos y sin overhead de emulación.
- Verificar el manifest después del push: `docker buildx imagetools inspect user/app:latest` para confirmar que ambas arquitecturas están en el manifest list.
- Cachear con `cache-from: type=gha` también funciona con multi-arch, acelerando las builds subsecuentes.

---

## Ejercicio 5: Tests con Testcontainers
**Solución esperada**:
Testcontainers levanta y destruye contenedores automáticamente durante los tests:
```java
// Ejemplo Java
@Container
static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
```
En el pipeline, los tests se ejecutan con acceso al socket Docker. Testcontainers gestiona el ciclo de vida (start, wait for readiness, stop).

**Posibles mejoras**:
- Usar `@Testcontainers` y `@Container` annotations para gestión declarativa del ciclo de vida, con `singleton` containers compartidos entre tests para velocidad.
- Para pipelines sin Docker socket (ej. Kubernetes), usar Testcontainers Cloud o alternativas como `embedded-postgres` cuando no es posible levantar contenedores reales.
- Combinar con `docker compose` para servicios que no son fácilmente manejables con Testcontainers (ej. múltiples servicios interdependientes).
