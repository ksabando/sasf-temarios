---
sidebar_label: "Cuestionario"
---

# Cuestionario M10 — Multi-stage Builds y Optimización

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funciona exactamente `docker-slim` (SlimToolkit) a nivel técnico? ¿Qué papel juegan ptrace, eBPF y el análisis estático en la minificación de imágenes?

**Respuesta**: docker-slim (creado por Kyle Quest, Slim.AI) usa tres fases para reducir imágenes: 1) **Análisis estático**: inspecciona la imagen existente (capas, archivos, metadatos) sin ejecutarla, identificando archivos potencialmente innecesarios (man pages, docs, locales). 2) **Análisis dinámico (profiling)**: ejecuta el contenedor con ptrace (o eBPF en versiones más recientes) para monitorear todos los accesos a archivos (open, read, stat) y syscalls realizadas durante la ejecución de tests o requests HTTP. Construye un mapa de "archivos realmente usados". 3) **Generación de imagen mínima**: crea una nueva imagen que contiene SOLO los archivos accedidos durante el profiling, más un conjunto base de bibliotecas esenciales (libc, ld-linux). A diferencia de un multi-stage manual, docker-slim puede reducir imágenes de 400 MB a 15 MB automáticamente, sin modificar el Dockerfile original.

**Por qué**: Kyle Quest documentó la arquitectura en github.com/slimtoolkit/slim. La fase de profiling usa `ptrace` para interceptar syscalls de acceso a archivos, similar a cómo `strace` funciona pero optimizado para tracking de archivos (no solo syscalls). El eBPF (en versiones más recientes) permite profiling con menor overhead (~1% vs ~5-10% de ptrace). La limitación principal: si tus tests no cubren todos los paths de ejecución (ej. un endpoint de admin que no se testea), docker-slim puede eliminar archivos necesarios para funcionalidades no probadas, causando errores en producción. Por eso docker-slim recomienda un "http probe" o "test command" que ejercite la aplicación exhaustivamente durante el profiling.

---

### 2. [Investigar] ¿Qué son los "reproducible builds" en el contexto de imágenes Docker y por qué son difíciles de lograr? ¿Qué herramientas existen para verificar que dos builds producen la misma imagen?

**Respuesta**: Un build reproducible produce una imagen idéntica bit-a-bit cuando se ejecuta con los mismos inputs, en cualquier máquina y en cualquier momento. En Docker, la reproducibilidad es difícil porque: 1) timestamps en archivos cambian con cada build, 2) órdenes de archivos en capas tar pueden variar, 3) `apt-get update` descarga versiones diferentes si el repositorio cambió, 4) valores aleatorios (UUIDs, nonces). Herramientas: **diffoci** (de Akihiro Suda, compara dos imágenes OCI capa por capa y archivo por archivo mostrando diferencias), **dive** (puede mostrar qué archivos cambiaron entre builds), **cosign** (verifica que el digest de la imagen coincide con el esperado). BuildKit tiene soporte experimental para reproducible builds con `--timestamp` y `SOURCE_DATE_EPOCH`.

**Por qué**: La reproducibilidad es importante para seguridad (supply chain security: podés verificar que la imagen en el registry fue construida desde el source code sin modificaciones). El proyecto Reproducible Builds (reproducible-builds.org) documenta las fuentes de no-determinismo. Para imágenes Docker, las prácticas para mejorar reproducibilidad: 1) setear `SOURCE_DATE_EPOCH` para timestamps determinísticos, 2) pinear versiones exactas en apt/apk (`curl=7.88.1-1`), 3) usar imágenes base con digest SHA, no tags, 4) usar BuildKit con `--output` para verificar el digest antes de push. Nix (nixpkgs.dockerTools) garantiza builds reproducibles por construcción (cada derivación es un hash determinístico del input).

---

### 3. [Investigar] ¿Qué son exactamente los "cache mounts" de BuildKit (`--mount=type=cache`) y cómo permiten cachear directorios entre builds de DIFERENTES imágenes? ¿Qué diferencia hay con el cache de capas tradicional?

**Respuesta**: Los cache mounts de BuildKit permiten que un directorio específico (ej. `/root/.cache/go-build`, `/var/cache/apt`, `~/.npm`) PERSISTA entre builds de diferentes imágenes y diferentes invocaciones de `docker build`. Se declaran en el Dockerfile: `RUN --mount=type=cache,target=/root/.cache/go-build go build ...`. A diferencia del cache de capas tradicional (que solo cachea el filesystem resultante de una instrucción RUN completa): 1) el cache mount sobrevive incluso si la instrucción RUN se re-ejecuta (porque el texto cambió), 2) el cache mount es compartido por múltiples imágenes (no está acoplado a una capa específica), 3) podés tener cache mounts de lectura/escritura (rw) o shared (compartido entre builds concurrentes). Esto es revolucionario para CI/CD: el cache de dependencias de Go, Rust, npm, pip sobrevive entre builds y entre imágenes diferentes, acelerando builds en órdenes de magnitud.

**Por qué**: BuildKit implementa cache mounts en el snapshotter. La documentación en github.com/moby/buildkit detalla los tipos de cache: `type=cache` (local al builder), `type=gha` (GitHub Actions cache), `type=registry` (registry OCI como backend de cache), `type=s3` (S3 como backend). El modo `sharing=shared` permite que builds concurrentes lean/escriban el mismo cache (con bloqueo). Para Go: `RUN --mount=type=cache,target=/root/.cache/go-build go build -o /app/binary .` cachea los artefactos de compilación, reduciendo builds subsiguientes de 5 min a 5 segundos. Esto va más allá del cache de capas, que NO puede compartir caches entre diferentes imágenes.

---

### 4. [Investigar] ¿Qué es el análisis SBOM (Software Bill of Materials) en imágenes de contenedores y por qué es un requisito emergente de compliance? ¿Qué herramientas generan SBOMs para imágenes Docker?

**Respuesta**: Un SBOM es un inventario formal de todos los componentes de software (paquetes, bibliotecas, versiones) incluidos en una imagen de contenedor. Es un requisito emergente por la orden ejecutiva 14028 de la Casa Blanca (2021) sobre ciberseguridad, que exige SBOMs para software vendido al gobierno de EE.UU. Herramientas para generar SBOMs: **Syft** (Anchore, genera SBOM en formatos SPDX y CycloneDX desde imágenes Docker, filesystems, o código fuente), **Trivy** (Aqua, incluye generación de SBOM además de escaneo de vulnerabilidades), **Docker Scout** (genera SBOM como parte del análisis). El SBOM se puede adjuntar como artefacto OCI (usando Cosign/ORAS) en el mismo registry. Formato estándar: SPDX (Linux Foundation) y CycloneDX (OWASP).

**Por qué**: La orden ejecutiva 14028 (mayo 2021) catalizó la adopción de SBOMs. NIST SP 800-53 y CISA recomiendan SBOMs como práctica de supply chain security. En la práctica, un SBOM permite: 1) saber exactamente qué versiones de log4j tenés en producción (durante Log4Shell, las empresas con SBOMs respondieron en horas, las que no en semanas), 2) cumplir con compliance (PCI, HIPAA, FedRAMP empiezan a requerir SBOMs), 3) automatizar la evaluación de impacto de CVEs (Trivy cruza el SBOM con la base de CVEs). Syft es la herramienta más popular: `syft nginx:alpine -o spdx-json` genera el SBOM. Cosign puede adjuntar el SBOM a la imagen y firmarlo.

---

### 5. [Conectar] La clase menciona Dive y Hadolint. ¿Cómo se integran estas herramientas en un pipeline CI/CD moderno y qué métricas de "calidad de imagen" se pueden medir objetivamente?

**Respuesta**: Integración en pipeline:
1. **Hadolint** (linting pre-build): falla el pipeline si el Dockerfile viola reglas. Objetivo: zero warnings.
2. **Build** (con BuildKit): construye la imagen.
3. **Dive** (análisis post-build): calcula el "efficiency score" (porcentaje de espacio de la imagen que es realmente útil vs desperdiciado). Objetivo: >90% efficiency.
4. **Trivy** (escaneo de seguridad): falla si hay CVEs CRITICAL/HIGH. Objetivo: zero CRITICAL.
5. **Syft** (generación SBOM): genera y firma el SBOM.
6. **Cosign** (firma de imagen): firma la imagen antes del push. Objetivo: 100% de imágenes firmadas.

Métricas objetivas de calidad: **Image size** (objetivo: <200 MB para apps web, <100 MB para microservicios), **Number of layers** (objetivo: <15), **Efficiency score** (Dive, objetivo: >90%), **CVEs by severity** (zero CRITICAL, <5 HIGH), **Time since last base image update** (objetivo: <30 días), **Non-root user** (sí/no, debe ser sí).

**Por qué**: El concepto de "image quality gates" fue popularizado por Adrian Mouat (autor de "Using Docker", O'Reilly) y por el equipo de Docker en las Best Practices. Hadolint y Dive son proyectos open-source mantenidos por la comunidad. Dive usa un algoritmo que calcula: `efficiency = (size of files in final image) / (total size of all layers)`. Archivos eliminados en capas posteriores (con whiteout) cuentan como desperdicio. Esta métrica es objetiva y automatizable. La integración típica en GitHub Actions usa `docker run --rm -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive --ci <image>` que sale con error si la eficiencia es menor al threshold.

---

### 6. [Conectar] ¿Cómo se relaciona el multi-stage build con el patrón "builder pattern" de Go y Rust? ¿Por qué estos lenguajes tienen ventaja natural en la construcción de imágenes pequeñas?

**Respuesta**: Go y Rust compilan a binarios estáticos (sin dependencias externas si usás `CGO_ENABLED=0` en Go o `target-feature=+crt-static` en Rust). El multi-stage build para Go es óptimo:
```dockerfile
FROM golang:1.22 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server .

FROM scratch
COPY --from=builder /app/server /server
ENTRYPOINT ["/server"]
```
La imagen final es SOLO el binario (~5-15 MB). La ventaja natural: no necesitás runtime (no hay JRE, Node.js, Python). El binario se enlaza estáticamente con todo lo que necesita (incluso certificados CA si los embeber con `go:embed`). Rust es similar con `musl` target. Lenguajes interpretados (Python, Node.js, Java) necesitan el runtime + dependencias en la imagen final, resultando en imágenes de 50-200 MB como mínimo. Esta es una de las razones por las que Go y Rust son populares para CLI tools y microservicios cloud-native.

**Por qué**: La filosofía de Go (Kelsey Hightower, Rob Pike) enfatiza "static binaries" como ventaja operativa. Con `CGO_ENABLED=0`, Go no depende de libc (usa la implementación pura en Go de syscalls). `FROM scratch` es la imagen más mínima posible: 0 bytes, sin sistema de archivos, sin bibliotecas. El binario Go corre directamente sobre el kernel (el kernel carga el ELF y ejecuta). Para Rust, el target `x86_64-unknown-linux-musl` produce binarios estáticos con musl libc. En comparación, una imagen Java mínima con JRE alpino es ~180 MB (JRE + dependencias de la app). Esto explica la tendencia de "rewrite en Go/Rust" para herramientas de infraestructura (Docker mismo está escrito en Go).

---

### 7. [Conectar] La clase menciona "no usar latest" para imágenes base. ¿Cómo se implementa una estrategia de "dependency pinning" robusta que balancee seguridad (actualizaciones) con reproducibilidad?

**Respuesta**: La estrategia de pinning robusto:
1. **Pin a versión mayor y menor, NO a patch**: `FROM node:20.11-alpine` (no `node:20.11.1-alpine`). La versión major.minor recibe parches de seguridad automáticos del maintainer, pero no breaking changes.
2. **Digest pinning para producción**: `FROM node:20.11-alpine@sha256:abc123...`. Combina el tag semántico con el digest inmutable. Si el tag se actualiza, tu build no lo usa automáticamente (protegido por el digest), pero el digest te dice exactamente qué bytes descargaste.
3. **Renovación automática**: herramientas como Renovate o Dependabot abren PRs automáticos cuando la imagen base se actualiza (nuevo digest o nueva versión). Con CI/CD que ejecuta tests en el PR, validás la actualización antes de mergear.
4. **Vulnerability-driven updates**: Trivy en CI escanea la imagen. Si la imagen base tiene un CVE CRITICAL, el pipeline fuerza una actualización incluso si no hay PR de Renovate.

**Por qué**: La tensión entre "siempre actualizar" (seguridad) y "nunca cambiar" (estabilidad) se resuelve con automation + testing. Dependabot/Renovate monitorean los tags de imágenes base y abren PRs (ej. cuando `node:20.11-alpine` apunta a un nuevo digest). El CI del PR ejecuta todos los tests. Si pasan, mergeás con confianza. Si fallan, investigás antes de actualizar. Esto es superior a "actualizar manualmente cuando nos acordamos" (ventana de vulnerabilidad) o "pinear a un digest fijo para siempre" (acumula CVEs). La práctica recomendada por Google (Container Security Best Practices) y CNCF: digest pinning + automated updates + CI validation.

---

### 8. [Cuestionar] ¿Deben las imágenes de producción tener shell (/bin/sh)? ¿Vale la pena usar Distroless o es overkill?

**Respuesta**: Para producción, SÍ vale la pena eliminar el shell. Distroless (Google) elimina `/bin/sh`, `bash`, `apt`, `apk`, y cualquier herramienta que un atacante podría usar para moverse lateralmente después de comprometer la aplicación (ejecutar `curl` para descargar malware, `nc` para reverse shell, `cat` para leer archivos). La contrapartida: debugging se vuelve más difícil (no podés `docker exec -it <container> sh`). Alternativas para debugging: 1) ephemeral containers en K8s (`kubectl debug`), 2) imágenes de debug separadas (misma app pero con shell, solo para debugging), 3) observabilidad externa (logs, métricas, traces) en lugar de debugging interactivo. Para imágenes de desarrollo y herramientas internas, mantener shell es aceptable.

**Por qué**: Google publicó Distroless en 2017 argumentando: "Your attack surface is every file in your container. Why include a shell if your app doesn't need one?" Los incidentes de seguridad en contenedores frecuentemente involucran atacantes usando shells para explorar el sistema después de una explotación inicial. Sin shell, la capacidad del atacante de hacer post-explotación se reduce drásticamente. La tendencia de la industria: imágenes "minimalistas" (Alpine primero, luego Distroless) es imparable. Incluso Alpine (~5 MB base) incluye `ash` y `apk`. Distroless va un paso más allá. Para equipos que valoran seguridad por encima de conveniencia, Distroless es el estándar.

---

### 9. [Cuestionar] ¿Son las "layer squashing" (`docker build --squash`) una buena práctica o un antipatrón que sacrifica el cache compartido por un tamaño marginalmente menor?

**Respuesta**: `--squash` es controvertido. Ventaja: reduce el número de capas a UNA, eliminando archivos borrados en capas intermedias (space waste) y simplificando la imagen. Desventajas: 1) pierde el cache compartido: si 10 imágenes comparten la capa base Alpine, usando squash cada imagen tiene su propia capa única (no comparten, aumentando almacenamiento global), 2) pierde el cache de build: la próxima build no puede reutilizar capas intermedias, 3) va contra el modelo de diseño de Docker (capas compartidas). Es un antipatrón en la mayoría de casos. La alternativa correcta: multi-stage build bien diseñado donde el stage final solo contiene lo necesario, sin archivos eliminados en capas posteriores. Si heredaste una imagen legacy con muchas capas y espacio desperdiciado, squash puede ser un mal necesario temporal mientras rediseñas el Dockerfile.

**Por qué**: La documentación de Docker marca `--squash` como experimental. Adrian Mouat y la comunidad de Docker recomiendan evitarlo en favor de multi-stage builds. El problema del espacio desperdiciado (ej. `RUN curl large.tar.gz && tar xf large.tar.gz && rm large.tar.gz` deja el .tar.gz en la capa anterior) se resuelve haciendo todo en un mismo RUN (el .tar.gz se elimina antes de commitear la capa). El verdadero uso de squash es para imágenes de release final donde el cache ya no importa (porque raramente se re-build). En CI/CD, squash es innecesario y contraproducente. BuildKit con `--output` puede generar una imagen con squash sin perder el cache local.

---

### 10. [Cuestionar] ¿Son las imágenes de menos de 10 MB siempre mejores? ¿Existe un punto de "demasiado pequeña" donde la optimización perjudica la mantenibilidad o la seguridad?

**Respuesta**: No siempre. Una imagen extremadamente pequeña puede ser contraproducente si: 1) no incluye ca-certificates (la app no puede hacer requests HTTPS), 2) no incluye timezone data (la app genera timestamps incorrectos), 3) no incluye usuarios no-root preconfigurados (la app corre como root por defecto), 4) usa `FROM scratch` sin bibliotecas esenciales y la app falla con errores crípticos ("exec format error", "no such file or directory"), 5) elimina herramientas de debugging que son necesarias para operaciones (incluso `curl` para healthchecks). La meta no es "la imagen más pequeña posible", sino "la imagen más pequeña que cumple todos los requisitos funcionales y de seguridad". Una imagen de 20 MB con ca-certificates, timezone data, y usuario no-root es objetivamente mejor que una de 5 MB que falla en producción porque no puede validar certificados TLS.

**Por qué**: El equipo de Distroless de Google aborda esto: `gcr.io/distroless/static-debian12` (~2 MB) incluye ca-certificates, /etc/passwd, /tmp, y licencias. `gcr.io/distroless/base-debian12` (~20 MB) agrega glibc, libssl, y libz. La diferencia es que `static` sirve para binarios Go (que embeben todo), `base` sirve para binarios que dependen de libc dinámico. La optimización debe ser consciente de lo que la app necesita. Docker Slim puede reducir una imagen de 400 MB a 15 MB, pero si los 15 MB no incluyen la biblioteca para conexiones TLS que la app usa en el endpoint /payment pero no en el test http, el error en producción es catastrófico. Siempre validar que la imagen optimizada funciona en un entorno de staging idéntico a producción.
