---
sidebar_label: "Soluciones"
---

# Soluciones M10 — Multi-stage Builds y Optimización

## Ejercicio 1: Multi-stage build Node.js
**Solución esperada**:
```dockerfile
# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Posibles mejoras**:
- Ejecutar `npm ci --only=production` en el stage de build para evitar instalar devDependencies, reduciendo el tamaño de node_modules copiados a la imagen final.
- Usar `USER node` antes de CMD para ejecutar la aplicación como usuario no-root, reduciendo el riesgo de seguridad.
- Agregar HEALTHCHECK para monitoreo: `HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1`.
- Considerar `distroless/nodejs` como stage final para máxima seguridad en producción (sin shell, sin herramientas que un atacante pueda explotar).

---

## Ejercicio 2: Comparación de tamaños
**Solución esperada**:
Multi-stage reduce drásticamente el tamaño de imagen. Típicamente: de 1.2 GB (node:20 + todas las dependencias y toolchain) a aproximadamente 150 MB (node:20-alpine solo con dist y node_modules de producción).

**Posibles mejoras**:
- Medir con `docker images myapp` antes y después para cuantificar la reducción exacta.
- Usar `dive myapp` después del build para analizar la eficiencia de cada capa y detectar archivos innecesarios (wasted space).
- Implementar `.dockerignore` para excluir `node_modules`, `.git`, `tests`, y archivos de build locales del contexto, reduciendo el tiempo de transferencia al daemon.

---

## Ejercicio 3: Comparación Alpine vs Ubuntu
**Solución esperada**:
- Alpine: ~5-7 MB base, usa musl libc, package manager `apk`.
- Ubuntu: ~77-80 MB base, usa glibc, package manager `apt`.
- Alpine es más rápido para pull/push y tiene menor superficie de ataque, pero puede tener incompatibilidades con binarios que requieren glibc.

**Posibles mejoras**:
- Hacer el benchmark en un entorno real: `time docker pull alpine` vs `time docker pull ubuntu` y medir el tiempo de descarga.
- Probar la compatibilidad de Alpine con la aplicación específica: algunos paquetes nativos de Node.js (como `bcrypt`, `sharp`) requieren compilación y pueden fallar en Alpine por musl.
- Considerar `debian:bookworm-slim` (~25 MB) como punto intermedio entre Alpine y Ubuntu si hay problemas de compatibilidad con musl.

---

## Ejercicio 4: Analizar con Dive
**Solución esperada**:
```bash
dive myapp:latest
```
Dive muestra cada capa de la imagen, su tamaño, y archivos agregados/eliminados/modificados. El panel inferior muestra el filesystem de la capa seleccionada.

**Posibles mejoras**:
- Integrar Dive en CI/CD: `CI=true dive myapp:latest --highestWastedBytes 10000` para fallar el build si el wasted space excede 10 KB.
- Establecer un efficiency threshold: `CI=true dive myapp:latest --lowestEfficiency 0.95` para fallar si la eficiencia es menor al 95%.
- Ejecutar Dive después de cada cambio en el Dockerfile como parte del proceso de code review, no solo en CI.

---

## Ejercicio 5: Linting con Hadolint
**Solución esperada**:
```bash
hadolint Dockerfile
```
Hadolint sugiere mejoras como: usar tags específicos (`node:20-alpine` en lugar de `node:latest`), combinar RUN commands con `&&`, no usar `apt` sin `--no-install-recommends`, etc.

**Posibles mejoras**:
- Crear un archivo `.hadolint.yaml` para personalizar reglas: ignorar reglas específicas que no aplican al proyecto o configurar registries confiables.
- Integrar Hadolint en pre-commit hooks: `.pre-commit-config.yaml` con el hook `hadolint/hadolint` para validar Dockerfiles antes de cada commit.
- Agregar Hadolint al pipeline CI como paso obligatorio antes del build: `hadolint Dockerfile --failure-threshold warning` para rechazar Dockerfiles con violaciones.
