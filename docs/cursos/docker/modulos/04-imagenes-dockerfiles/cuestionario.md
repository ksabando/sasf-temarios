---
sidebar_label: "Cuestionario"
---

# Cuestionario M04 — Imágenes y Dockerfiles

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funciona exactamente BuildKit a nivel de arquitectura y por qué es superior al builder legacy de Docker? Describí el modelo de DAG (grafo acíclico dirigido) y la ejecución concurrente.

**Respuesta**: BuildKit (Tõnis Tiigi, Docker/Moby) es un builder declarativo que construye un DAG a partir del Dockerfile: cada stage y cada instrucción es un nodo con dependencias explícitas. A diferencia del builder legacy (que procesa el Dockerfile secuencialmente línea por línea en un contenedor temporal), BuildKit: 1) construye stages independientes en paralelo, 2) transfiere solo los archivos necesarios del contexto (no el tar completo), 3) usa `--mount=type=cache` para persistir cachés entre builds separados, 4) soporta secretos (`--mount=type=secret`) que no persisten en la imagen, 5) puede exportar la imagen a múltiples formatos (OCI tar, registry, docker daemon). El DAG se calcula en tiempo de parseo: si el stage `A` copia de `B`, BuildKit construye `B` primero (o en paralelo si A y C son independientes).

**Por qué**: BuildKit fue presentado en DockerCon 2018 y es el builder por defecto desde Docker 23.0 (2023). Tõnis Tiigi documentó la arquitectura en github.com/moby/buildkit. La principal innovación es el LLB (Low-Level Build) — un language-agnostic build graph — que permite que el Dockerfile sea traducido a un DAG optimizable. El cache en BuildKit es más granular: puede cachear instrucciones individuales basadas en checksums de contenido y metadata. El soporte para `--mount=type=cache,target=/root/.cache` permite que directorios de cache (npm, pip, go) persistan entre builds de diferentes imágenes, lo cual era imposible con el builder legacy. `DOCKER_BUILDKIT=1` fue necesario como flag hasta que se volvió default.

---

### 2. [Investigar] ¿Qué es exactamente un "distroless" image y cómo Google las construye usando Bazel? ¿Por qué `FROM scratch` no es lo mismo que Distroless?

**Respuesta**: Distroless (GoogleContainerTools, Matthew Moore) son imágenes que contienen SOLO la aplicación y sus dependencias runtime: no tienen shell, package manager, ni herramientas de sistema. Se construyen con Bazel (build system de Google) que rastrea dependencias precisas a nivel de archivo — sabe exactamente qué archivos de biblioteca necesita un binario y solo incluye esos. `FROM scratch` es una imagen completamente vacía (0 bytes). Distroless incluye bibliotecas runtime necesarias (glibc, libssl, ca-certificates) que tu aplicación probablemente necesita, y usuarios no-root preconfigurados. `FROM scratch` solo funciona para binarios estáticos (Go con CGO_ENABLED=0); cualquier app que necesite libc dinámica fallará en scratch.

**Por qué**: Matthew Moore (Google) presentó Distroless en 2017 en el blog de Google Cloud: "la mayoría de las imágenes incluyen un sistema operativo completo con cientos de paquetes innecesarios". Distroless usa Bazel para construir imágenes determinísticas: el BUILD file especifica exactamente qué archivos van en cada capa. La imagen `gcr.io/distroless/static-debian12` (~2 MB) incluye ca-certificates, /etc/passwd, /tmp, y licencias obligatorias. La imagen `gcr.io/distroless/java-debian12` incluye JRE, glibc, y libz. La ventaja de seguridad: sin shell, un atacante no puede ejecutar comandos arbitrarios aunque comprometa la app. La desventaja: debugging requiere ephemeral containers o sidecars.

---

### 3. [Investigar] ¿Cómo funciona la validación de Dockerfiles con Hadolint y qué reglas implementa que no están documentadas en las "Best Practices" oficiales de Docker?

**Respuesta**: Hadolint (Lukas Martinelli, ahora mantenido por la comunidad) es un linter para Dockerfiles que parsea el Dockerfile en un AST (Abstract Syntax Tree) usando el parser de Docker (moby/buildkit) y aplica reglas estáticas de análisis. Va más allá de las Best Practices oficiales: DL3006 (siempre usar tag específico, no `latest`), DL3008 (pinear versiones en apt-get install), DL3018 (no usar `apk upgrade` sin `--no-cache`), DL3025 (usar JSON array para CMD/ENTRYPOINT, no shell form), DL4000 (no usar `MAINTAINER`, deprecado), DL4001 (no usar `wget` sin `-q`), DL4006 (setear pipefail en RUN con pipes). Hadolint soporta configuración via `.hadolint.yaml` para ignorar reglas específicas y archivos de exclusiones.

**Por qué**: Las reglas de Hadolint están basadas en las Best Practices de Docker (docs.docker.com/develop/develop-images/dockerfile_best-practices) pero agrega reglas de seguridad y optimización que no están explícitamente documentadas. Por ejemplo, DL3059 (RUN múltiples deben ser concatenados) y DL3060 (usar `--no-install-recommends` en apt-get) son reglas que detectan problemas sutiles. Hadolint también verifica que COPY tenga fuentes válidas, que no haya `cd` (no persiste entre RUN), y que las variables de entorno estén correctamente escapadas. Se integra en CI como: `docker run --rm -i hadolint/hadolint < Dockerfile`. La comunidad agregó reglas para el ShellCheck integrado (shellcheck en RUN scripts) y detección de credenciales hardcodeadas.

---

### 4. [Investigar] ¿Qué es el `ONBUILD` instruction en un Dockerfile y por qué su uso es controvertido? ¿En qué patrón de imágenes base es útil y cuándo es un antipatrón?

**Respuesta**: `ONBUILD` registra un trigger que se ejecutará cuando la imagen sea usada como base para OTRA build (no durante la build de la imagen actual). Es útil para imágenes base que establecen un patrón de build: por ejemplo, una imagen base para aplicaciones Python que define `ONBUILD COPY requirements.txt .` y `ONBUILD RUN pip install -r requirements.txt`. Cuando un desarrollador hace `FROM python-base:latest` y construye su imagen, el ONBUILD se dispara automáticamente. Es controvertido porque: 1) los triggers son invisibles (no aparecen en el Dockerfile hijo), 2) si cambian en una nueva versión de la imagen base, los builds hijos se rompen sin cambios aparentes, 3) hace que el comportamiento del build sea "mágico" e impredecible.

**Por qué**: La documentación oficial de Docker etiqueta ONBUILD como una instrucción que debe usarse con moderación. Fue popular en los primeros años de Docker (2015-2017) para imágenes base de lenguajes. La comunidad y las Best Practices actuales recomiendan evitarlo: es mejor usar templates o scaffolding (ej. `docker init`, `npm init`, `rails new`) que generen un Dockerfile explícito. El problema principal es la falta de transparencia: un desarrollador que hereda un proyecto no sabe que hay triggers ONBUILD a menos que inspeccione la imagen base. El patrón moderno es usar multi-stage builds y COPY --from en lugar de depender de ONBUILD.

---

### 5. [Conectar] La clase menciona `.dockerignore`. ¿Cómo se relaciona el build context con la seguridad y el rendimiento? ¿Qué pasa si accidentalmente incluís `.env` o secretos en el contexto?

**Respuesta**: El build context es el conjunto de archivos que `docker build` empaqueta en un tar y envía al daemon. Si `.dockerignore` no excluye archivos como `.env`, `.git/`, `keys/`, `credentials.json`, estos archivos: 1) se transmiten al daemon (posiblemente remoto, en CI), 2) quedan accesibles en el build context durante la construcción, 3) si un `COPY . .` los incluye, se hornean en la imagen permanentemente. Incluso si borrás el archivo en un RUN posterior, la capa anterior lo contiene. Peor: si alguien hace `docker history` o extrae la capa del registry, los secretos son recuperables. La práctica de seguridad es: `.dockerignore` debe ser agresivo (ignorar todo por defecto, permitir solo lo necesario) y nunca construir con el directorio home o directorios con secretos.

**Por qué**: GitHub Security Lab y Aqua Security han documentado innumerables fugas de secretos en imágenes Docker públicas. En 2023, Aqua Security escaneó Docker Hub y encontró más de 50,000 imágenes con secretos expuestos (claves API, tokens, credenciales de BD). El build context es el vector principal: si `docker build .` se ejecuta desde un directorio que contiene `.env.production`, ese archivo viaja al daemon y potencialmente al registry. La recomendación: `.dockerignore` debe listar explícitamente `*` como primera línea y luego `!` para archivos permitidos (whitelist en lugar de blacklist). BuildKit con `--mount=type=secret` es la solución definitiva para secretos durante el build.

---

### 6. [Conectar] El `docker build` crea capas intermedias. ¿Cómo se relacionan estas capas con la seguridad de la cadena de suministro (supply chain)? ¿Qué información expone `docker history` que un atacante podría explotar?

**Respuesta**: `docker history <imagen>` muestra todas las capas con su instrucción, timestamp de creación, y tamaño. Expone: 1) todos los comandos RUN ejecutados (incluyendo URLs internas, paths de archivos), 2) ARG values si fueron usados en instrucciones (ej. `ARG TOKEN=abc123` en el historial), 3) estructura de directorios y dependencias instaladas. Un atacante puede usar esto para: identificar versiones de paquetes con CVEs conocidos, descubrir URLs de servicios internos, encontrar credenciales hardcodeadas, y mapear la arquitectura interna de la aplicación. La cadena de suministro se protege con: BuildKit secrets (no aparecen en history), `--squash` para ocultar capas intermedias (pero se pierde cache), y escaneo de la imagen final (Trivy, Docker Scout) en lugar de confiar en la ofuscación.

**Por qué**: `docker history --no-trunc <imagen>` es la herramienta de reconnaissance para atacantes. En un ejercicio de red team documentado por SANS Institute, los atacantes usaron `docker history` en imágenes públicas para encontrar API keys, contraseñas en `ENV`, y rutas de red internas en `curl` commands. La única protección real es: nunca hardcodear secretos (usar BuildKit secrets), limpiar en el mismo RUN (para que la capa no contenga archivos temporales), y aceptar que las capas son públicas si la imagen se publica en un registry accesible. La ofuscación (`--squash`) no es seguridad — un atacante determinado puede extraer capas del registry.

---

### 7. [Conectar] ¿Cómo difieren el Docker image format (v2.2) y el OCI image format en la práctica, y qué impacto tiene esta diferencia en la interoperabilidad entre registries?

**Respuesta**: El Docker image format v2.2 (o Docker Manifest V2, Schema 2) y el OCI Image Spec v1.0 son casi idénticos, con diferencias mínimas: 1) el campo `mediaType` en el manifiesto: Docker usa `application/vnd.docker.distribution.manifest.v2+json`, OCI usa `application/vnd.oci.image.manifest.v1+json`, 2) la configuración de imagen: Docker usa `application/vnd.docker.container.image.v1+json`, OCI usa `application/vnd.oci.image.config.v1+json`, 3) OCI permite anotaciones arbitrarias en el manifiesto y en el index, que Docker implementó posteriormente. En la práctica, todos los registries modernos (Docker Hub, ECR, GCR, ACR, Harbor) aceptan ambos formatos. Los clientes Docker crean formato Docker pero pueden leer ambos; containerd y CRI-O prefieren OCI.

**Por qué**: El OCI Image Spec fue diseñado para ser backward-compatible con Docker v2.2. La migración fue transparente para los usuarios — Docker Inc. participó en la definición de la spec OCI. La diferencia práctica más importante son las anotaciones OCI (`org.opencontainers.image.*`) que son un estándar abierto para metadata (source, revision, created, authors, license) que herramientas como Cosign, Syft, y Harbor pueden leer. Docker agregó soporte para anotaciones en buildx. La interoperabilidad es tal que podés hacer `docker push` a cualquier registry OCI-compliant (incluyendo registries que nunca han ejecutado código Docker, como ECR o GAR) sin problemas.

---

### 8. [Cuestionar] "Siempre usá Alpine para mantener imágenes chicas". ¿Es esto un dogma o un consejo matizado? ¿Cuándo Alpine es contraproducente?

**Respuesta**: Es un dogma que necesita matización. Alpine (~5 MB base) reduce tamaño de imagen y superficie de ataque, pero usa musl libc en lugar de glibc. Los problemas: 1) Paquetes Python/Node con extensiones C pueden no tener wheels precompilados para musl, forzando compilación desde source (lento, puede fallar), 2) DNS resolution en Alpine ha tenido bugs históricos (musl DNS resolver no soporta search domains correctamente en algunos casos), 3) Threading en musl tiene diferencias sutiles con glibc que afectan Java (antes de JDK 16, Alpine requería build especial de OpenJDK), 4) `apk` es más limitado que `apt` (menos paquetes disponibles). Para stacks maduros (Go, Node.js sin dependencias nativas, Rust), Alpine es excelente. Para Python data science (numpy, pandas, scipy) o Java legacy, Debian Slim suele ser más robusto.

**Por qué**: El debate Alpine vs Debian es recurrente en la comunidad DevOps. Itamar Turner-Trauring (Python DevOps expert, pythonspeed.com) documentó extensamente que para Python, Alpine puede ser más problema que solución: "Alpine for Python is not worth it". La recomendación moderna: usar Alpine para Go/Rust (binarios estáticos) y para imágenes multi-stage donde el stage final es `FROM alpine` (mínimo runtime). Para lenguajes con ecosistemas de paquetes nativos pesados, usar Debian Slim (~80 MB) o Distroless (específico por lenguaje). La optimización prematura de "imagen más chica" no debe sacrificar estabilidad y mantenibilidad.

---

### 9. [Cuestionar] ¿Son los Dockerfiles la mejor forma de definir imágenes o herramientas como Buildpacks (Cloud Native Buildpacks) y Nix son superiores para producción?

**Respuesta**: Dockerfiles son potentes y ubicuos pero tienen limitaciones: son scripts imperativos (no declarativos), la calidad depende del autor (fácil escribir uno malo), y el mantenimiento de seguridad (rebuild para CVE fixes) requiere intervención manual del desarrollador. Cloud Native Buildpacks (Heroku, Cloud Foundry, Paketo) detectan el lenguaje automáticamente, aplican mejores prácticas (multi-stage, layers, cache), y generan imágenes OCI sin Dockerfile. Nix (NixOS) va más allá: builds reproducible bit a bit, dependencias hasheadas, sin side effects. Para producción, Buildpacks ofrecen "security patches automáticos" (rebuild con nueva imagen base sin tocar código). Para desarrollo custom, Dockerfiles dan control total. La tendencia: Buildpacks para aplicaciones estándar (Spring Boot, Express, Django genérico). Dockerfiles para casos custom (dependencias nativas complejas, configuración avanzada).

**Por qué**: Cloud Native Buildpacks (CNB) es un proyecto CNCF incubado por Heroku y VMware. Stephen Levine (VMware) presentó CNB como "contenedores sin Dockerfile". La propuesta de valor: el desarrollador ejecuta `pack build myapp` y obtiene una imagen OCI optimizada, con layers separados para dependencias y código, y capaz de ser actualizada automáticamente (rebase) cuando la imagen base recibe parches de seguridad. Nix (Dolstra et al., 2006) es un sistema de builds puramente funcional que garantiza builds idénticas en cualquier máquina. El caso extremo: nixpkgs puede construir imágenes Docker con `dockerTools.buildImage` sin Docker, con hash verificable de todo el closure. Para la mayoría de equipos, Dockerfiles + multi-stage es el sweet spot entre control y complejidad.

---

### 10. [Cuestionar] ¿Debe `COPY . .` ser considerado un antipatrón en Dockerfiles? ¿Cuándo es aceptable y qué riesgos introduce en el cache y la seguridad?

**Respuesta**: `COPY . .` copia TODO el contexto de build al contenedor. Es un antipatrón cuando se usa ANTES de `RUN npm ci` o `RUN pip install` porque: 1) invalida el cache de instalación de dependencias con cada cambio de código (lento), 2) puede copiar archivos no deseados (`.env`, `.git`, `node_modules` locales) si `.dockerignore` no está bien configurado. Es aceptable como ÚLTIMO paso, después de instalar dependencias, cuando solo necesitás copiar el código fuente compilado. El patrón correcto: `COPY package*.json ./` → `RUN npm ci` → `COPY . .`. El riesgo de seguridad: si `.dockerignore` no es agresivo, `COPY . .` puede hornear secretos, bases de datos locales, y archivos de configuración con credenciales en la imagen.

**Por qué**: Las Docker Best Practices oficiales documentan explícitamente este antipatrón en la sección "Order your layers appropriately". La penalización en tiempo de build es severa: cada cambio en cualquier archivo del proyecto invalida el cache de `npm ci`, haciendo que cada build descargue todas las dependencias de nuevo (2-5 minutos en lugar de 2-5 segundos). En términos de seguridad, GitHub Security Lab recomienda nunca usar `COPY . .` sin un `.dockerignore` explícito. La alternativa segura: `COPY src/ ./src/` y `COPY config/ ./config/` para copiar solo directorios específicos, haciendo explícito qué archivos son parte de la imagen.
