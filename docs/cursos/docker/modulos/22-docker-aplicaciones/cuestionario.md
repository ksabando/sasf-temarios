---
sidebar_label: "Cuestionario"
---

# Cuestionario M22 — Docker con Aplicaciones

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente WebAssembly (Wasm) en el contexto de contenedores y cómo Docker lo soporta? ¿Qué ventajas tiene Wasm sobre contenedores tradicionales?

**Respuesta**: WebAssembly (Wasm) es un formato de bytecode portable que se ejecuta en un sandbox aislado con near-native performance. Docker soporta Wasm a través de `containerd` con el shim `runwasi` (de Microsoft/Deislabs). En lugar de ejecutar un contenedor Linux con un SO completo, Wasm ejecuta un módulo `.wasm` directamente en un runtime Wasm (WasmEdge, Wasmtime, Wasmer). Ventajas: 1) Arranque en microsegundos (vs milisegundos de Linux container), 2) Imagen mucho más pequeña (módulo Wasm ~1-5 MB vs imagen Docker mínima ~5 MB + app), 3) Sandbox por defecto (capability-based security, no depende de namespaces del kernel), 4) Portable entre OS y arquitecturas (wasm es cross-platform por diseño). Desventajas: no soporta todas las syscalls de Linux (limitado a WASI - WebAssembly System Interface), no puede ejecutar binarios Linux existentes sin recompilar, ecosistema temprano.

**Por qué**: Docker anunció soporte para Wasm en Docker Desktop 4.15 (octubre 2022) junto con WasmEdge. Michael Yuan (WasmEdge) y el equipo de Docker demostraron contenedores Wasm que arrancan en <1ms. CNCF aceptó WasmEdge como proyecto Sandbox (2021). Wasm es prometedor para edge computing y serverless (Cloudflare Workers usa Wasm a escala masiva). No reemplaza Docker, lo complementa: para workloads que requieren máximo rendimiento, mínimo overhead, y sandbox security, Wasm es superior.

---

### 2. [Investigar] ¿Qué es exactamente "Nix" y cómo construye imágenes Docker sin Docker? ¿Qué ventajas ofrece el modelo de build puramente funcional de Nix?

**Respuesta**: Nix (Eelco Dolstra, 2006) es un gestor de paquetes y sistema de builds puramente funcional: cada paquete se construye en un entorno aislado con hash de todas las dependencias (incluyendo compilador, flags, bibliotecas). Nix puede construir imágenes Docker sin Docker usando `nixpkgs.dockerTools.buildImage` (o `buildLayeredImage`). El proceso: 1) Nix resuelve el closure de dependencias (todas las bibliotecas, binarios, archivos necesarios), 2) Construye cada componente en un sandbox sin acceso a internet (build determinístico), 3) Empaqueta el closure en capas de imagen OCI sin necesidad de Docker daemon. Ventajas: 1) Reproducibilidad perfecta (mismo hash de input → mismo output, bit a bit), 2) Sin capas innecesarias (Nix conoce exactamente qué archivos son necesarios, sin carry-on de `apt`/`apk`), 3) Actualizaciones atómicas (cada nueva versión es un nuevo path, sin mutar el estado anterior).

**Por qué**: Nix resuelve el problema de "dependency hell" que Docker parcialmente resuelve (contenedor aísla dependencias, pero dentro del contenedor el build puede ser no determinístico). El paper de Dolstra (2006) y las charlas de Graham Christensen (Determinate Systems) muestran que Nix produce imágenes más pequeñas y seguras porque conoce cada archivo exactamente. La desventaja: curva de aprendizaje empinada (lenguaje Nix), ecosistema más pequeño. Para equipos que priorizan seguridad y reproducibilidad extrema (financial, defense), Nix es una opción seria.

---

### 3. [Investigar] ¿Cómo funciona exactamente el "hot reload" con `docker compose watch` (nuevo en Compose v2.22+) y cómo se compara con bind mounts + nodemon? ¿Qué mejoras trae para el inner loop de desarrollo?

**Respuesta**: `docker compose watch` monitorea cambios en archivos del host y aplica acciones declarativas: `sync` (copia archivo al contenedor), `rebuild` (reconstruye la imagen y recrea el contenedor), `restart` (reinicia el contenedor). Se configura en el compose file bajo `x-develop` (o `develop`):
```yaml
services:
  app:
    develop:
      watch:
        - path: package.json; target: /app/package.json; action: rebuild
        - path: src/; target: /app/src; action: sync
```
A diferencia de bind mounts + nodemon: 1) `watch` no comparte el filesystem del host (copia archivos al filesystem del contenedor, que es mucho más rápido en macOS/WSL 2), 2) El file watcher corre en el HOST (no dentro del contenedor), eliminando la necesidad de instalar nodemon/watchers en la imagen de desarrollo, 3) La lógica de qué acción tomar según qué archivo cambió es declarativa (no en código de aplicación). "Mejoras para inner loop": elimina el overhead de filesystem compartido (9p en WSL 2, osxfs en macOS), que es ~10x más lento que el filesystem nativo. Los cambios se reflejan instantáneamente (sync) o en segundos (rebuild).

**Por qué**: `docker compose watch` fue introducido en Docker Compose v2.22 (octubre 2023) como parte del initiative "Docker for Developer Productivity". Reemplaza a `docker compose up` con bind mounts para desarrollo. Internamente, `sync` usa `docker cp` o APIs más eficientes para transferir solo los archivos cambiados. El watch corre nativamente en el host (usando inotify/FSEvents), sin contenedor intermedio.

---

### 4. [Investigar] ¿Qué estrategias de optimización existen para monorepos con Docker? ¿Cómo evitar rebuilds innecesarias cuando solo cambia un servicio?

**Respuesta**: Monorepo con múltiples servicios (microservicios) en Docker: 1) **Build context por servicio**: cada servicio tiene su propio subdirectorio y Dockerfile, y el build context apunta SOLO a ese directorio: `docker build -f services/payments/Dockerfile services/payments/`. Esto evita invalidar cache por cambios en servicios no relacionados. 2) **Dockerfile cache optimization**: separar `COPY package*.json` (dependencias) de `COPY . .` (código). Si solo cambia código, las dependencias no se recompilan. 3) **BuildKit con `--mount=type=cache`**: compartir cache de dependencias entre servicios (ej. `~/.npm` entre `frontend` y `admin`). 4) **Targeted builds con Compose profiles o `--build-arg`**: solo construir el servicio que cambió: `docker compose build payments`. 5) **Dependency graph con Nx/Turborepo**: estas herramientas determinan qué servicios se vieron afectados por un cambio y solo reconstruyen esos. Nx puede generar los build contexts óptimos para Docker.

**Por qué**: Nx (Nrwl) y Turborepo (Vercel) son herramientas de monorepo que construyen un grafo de dependencias entre proyectos. Al integrarlas con Docker, solo se reconstruyen los servicios cuyas dependencias (incluyendo shared libraries) cambiaron. El patrón de "build context mínimo" es esencial: sin él, un cambio en `services/auth/src/` invalida el build de `services/payments/` si el build context es el repo entero.

---

### 5. [Conectar] La clase muestra Dockerfiles para Spring Boot, Node.js, y Python. ¿Cómo se comparan estos ecosistemas en términos de tamaño final de imagen, complejidad de build, y seguridad de dependencias?

**Respuesta**: Comparativa Spring Boot vs Node.js vs Python vs Go:
- **Tamaño final**: Go (scratch, ~5-15 MB) < Spring Boot (JRE Alpine, ~180 MB) < Node.js (Alpine, ~150 MB) < Python (Alpine, ~80 MB pero con dependencias puede ser ~200+ MB).
- **Complejidad de build**: Go (simple: `go build`, binario estático) < Python (moderado: pip, posible compilación de extensiones C) < Node.js (moderado: npm ci, posible compilación de native modules) < Spring Boot (complejo: Maven/Gradle, JVM, multi-stage recomendado).
- **Seguridad de dependencias**: Go (go.sum, módulos verificados, sin runtime dependencies) > Spring Boot (Maven/Gradle con lockfiles, JVM es estable) > Python (pip sin lockfile fuerte, muchas dependencias) > Node.js (npm ecosystem es el más propenso a supply chain attacks, pero `npm ci` con package-lock.json mitiga).
- **Multi-stage gain**: enorme para todos (build stage con SDK, runtime stage con solo lo necesario).

**Por qué**: El reporte "State of Container Security 2024" (Snyk) muestra que Node.js y Python tienen el mayor número de CVEs en dependencias de aplicación. Go tiene la menor superficie de ataque porque el binario es estático y no incluye runtime. Spring Boot (JVM) tiene buena seguridad intrínseca (JVM sandbox, GC) pero la imagen es grande.

---

### 6. [Conectar] La clase menciona HEALTHCHECK en Spring Boot con actuator. ¿Cómo se implementa un healthcheck de "liveness" vs "readiness" correctamente en Docker (y por qué K8s los separa)?

**Respuesta**: En Docker, un solo HEALTHCHECK cubre ambos (no distingue). La práctica es: HEALTHCHECK que verifica liveness (¿el proceso está respondiendo?). Para readiness, se usa `depends_on: condition: service_healthy`. El endpoint de Spring Boot Actuator `/actuator/health/liveness` y `/actuator/health/readiness` (disponibles con los módulos `liveness` y `readiness` desde Spring Boot 2.3) permiten separarlos. En Docker, se usa `/actuator/health/liveness` para HEALTHCHECK (el proceso está vivo) y `/actuator/health/readiness` para readiness (las dependencias como DB están listas). K8s los separa porque tienen comportamientos diferentes: liveness → si falla, K8s reinicia el Pod. Readiness → si falla, K8s remueve el Pod del Service endpoint (no recibe tráfico). Docker no puede remover automáticamente un contenedor del balanceo sin orquestador externo.

**Por qué**: La separación liveness/readiness en Spring Boot fue impulsada por la adopción de K8s. Phil Webb (Spring Boot lead) documentó que `/health` es un agregado que incluye liveness + readiness + componentes custom. En Docker, el HEALTHCHECK debe ser liviano (no incluir chequeo de DB en el healthcheck, porque si la DB falla temporalmente, Docker no reinicia el contenedor — solo reporta unhealthy).

---

### 7. [Conectar] ¿Qué patrones de logging y manejo de errores son específicos para aplicaciones containerizadas? ¿Por qué escribir a stdout/stderr es fundamental pero no suficiente?

**Respuesta**: Escribir a stdout/stderr es fundamental (12 Factor App) porque Docker captura estos streams para `docker logs` y cualquier logging driver. Pero no es suficiente para producción: necesitás: 1) **Structured logging**: logs en formato JSON (no texto plano) para que Fluentd/Loki/Elasticsearch puedan parsearlos automáticamente, 2) **Trace ID injection**: cada log debe incluir el trace ID (de OpenTelemetry) para correlacionar logs con traces distribuidas, 3) **Contexto**: cada log debe incluir metadata (servicio, versión, instance, request ID), 4) **No logs sincrónicos a disco o red**: escribir logs a un archivo dentro del contenedor o hacer HTTP sync para enviar logs es lento; usar stdout (bufferizado, async) o UDP (no bloqueante), 5) **Log levels configurables**: via variable de entorno (`LOG_LEVEL=debug`), no hardcodeado en la imagen.

**Por qué**: La guía de "Logging in containers" de Brendan Gregg y la documentación de OpenTelemetry recomiendan structured logs + trace context. Herramientas como `pino` (Node.js), `structlog` (Python), `zap`/`zerolog` (Go) emiten JSON a stdout nativamente, eliminando la necesidad de parseo en el pipeline de logs.

---

### 8. [Cuestionar] ¿Es "FROM scratch" el santo grial de las imágenes Docker o tiene limitaciones prácticas importantes?

**Respuesta**: `FROM scratch` es ideal para binarios estáticos (Go, Rust con musl) pero tiene limitaciones: 1) Sin CA certificates (la app no puede hacer HTTPS a endpoints externos — necesitás copiarlos de otra imagen: `COPY --from=alpine:latest /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/`), 2) Sin timezone data (la app usa UTC pero no puede convertir a otras zonas), 3) Sin usuarios no-root (debés crear `/etc/passwd` y `/etc/group` manualmente), 4) Sin /tmp (la app falla si intenta crear archivos temporales), 5) Debugging imposible (sin shell, sin herramientas). Para producción, `FROM gcr.io/distroless/static` es mejor: ~2 MB, incluye CA certs, /tmp, /etc/passwd, y es mantenido por Google. `FROM scratch` es el ideal teórico, pero en la práctica necesitás al menos CA certs y timezone data para casi cualquier aplicación.

**Por qué**: La experiencia práctica de equipos que usan `FROM scratch` (documentada en blogs de Google Cloud, Cloudflare) muestra que eventualmente necesitás copiar archivos de soporte. Distroless (Google) resuelve esto con imágenes base preconfiguradas para cada lenguaje. La diferencia: `scratch` es 0 bytes base, `static-debian12` es ~2 MB base (bien invertidos).

---

### 9. [Cuestionar] ¿Deben las aplicaciones ser "cloud-native" y stateful (con StatefulSets, operadores) o stateless (12 Factor) y delegar estado a servicios gestionados (RDS, ElastiCache)?

**Respuesta**: La tendencia es delegar estado a servicios gestionados (RDS en lugar de PostgreSQL en K8s, ElastiCache en lugar de Redis en K8s) para aplicaciones mainstream. Ventajas: zero operaciones de BD (backups, parches, HA), escalabilidad gestionada, compliance. Pero los operadores de K8s (CloudNativePG, StackGres, Redis Operator) están cerrando la brecha: ofrecen experiencia similar a servicios gestionados pero dentro de K8s (backups automáticos, auto-scaling, actualizaciones rolling). Para startups y empresas con presupuesto limitado, correr BD en K8s con operadores puede ser más barato que RDS (especialmente en multi-cloud o on-prem). Para empresas que pueden pagar servicios gestionados: delegar estado a RDS/ElastiCache/etc. reduce el riesgo operativo significativamente. La balanza se inclina a servicios gestionados para producción, operadores para entornos donde el costo o la portabilidad multi-cloud son prioritarios.

**Por qué**: El informe de Data on Kubernetes (DoKC, 2024) muestra que el 72% de las organizaciones usan servicios cloud gestionados para producción, pero el 28% que usa operadores en K8s crece rápidamente. La decisión es económica y de riesgo: un outage de BD auto-gestionada puede ser catastrófico si el equipo no tiene expertise.

---

### 10. [Cuestionar] ¿Vale la pena hacer "hot reload" con Docker en desarrollo o es mejor correr la aplicación directamente en el host (sin Docker) y solo containerizar para CI/producción?

**Respuesta**: Hot reload con Docker (bind mounts + file watchers o `docker compose watch`) es viable y preferible si todo el equipo usa Docker y querés paridad dev/prod (mismas dependencias, misma versión de runtime, mismos servicios de infraestructura). La alternativa (correr en host) es más rápida (sin overhead de Docker, sin bind mount lento) pero sacrifica paridad: los desarrolladores pueden tener versiones diferentes de Node.js/Python/Java que producción, causando bugs "en mi máquina funciona". La decisión: si el equipo puede estandarizar en Docker (todos usan Docker Desktop con Linux backend), hot reload con Docker es preferible. Si hay problemas de rendimiento (macOS con bind mounts lentos, Windows con WSL 2 overhead), correr la app en host para desarrollo + usar Docker solo para servicios de infraestructura (BD, Redis) vía `docker compose` es un buen compromiso.

**Por qué**: La comunidad debate esto: "Docker is great for deployment but slow for development" es una queja común en macOS/Windows. Docker Inc. responde con features como `docker compose watch` y VirtioFS (mejor rendimiento en macOS). Para equipos en Linux nativo, el overhead de Docker es mínimo (~2%) y hot reload con bind mounts funciona perfectamente. Para macOS/Windows, la recomendación es usar `docker compose watch` (sync mode) en lugar de bind mounts tradicionales para mejor rendimiento.
