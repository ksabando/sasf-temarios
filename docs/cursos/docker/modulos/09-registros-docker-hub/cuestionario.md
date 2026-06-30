---
sidebar_label: "Cuestionario"
---

# Cuestionario M09 — Registros de Imágenes y Docker Hub

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funciona exactamente la OCI Distribution Spec y qué endpoints define para push/pull de imágenes? ¿Qué diferencia hay entre un blob y un manifest en el modelo de distribución?

**Respuesta**: La OCI Distribution Spec (github.com/opencontainers/distribution-spec) define una API REST HTTP para subir y descargar artefactos OCI. Endpoints principales: 1) `GET /v2/` — verifica que el registry soporta la API, 2) `GET /v2/<name>/manifests/<reference>` — descarga el manifest (JSON con referencias a capas y configuración), 3) `PUT /v2/<name>/manifests/<reference>` — sube el manifest, 4) `HEAD /v2/<name>/blobs/<digest>` — verifica si el blob ya existe (para deduplicación en push), 5) `GET /v2/<name>/blobs/<digest>` — descarga un blob (capa comprimida), 6) `POST /v2/<name>/blobs/uploads/` — inicia upload de blob (monolithic o chunked). Un **manifest** es metadata que referencia los blobs (capas) y la configuración de la imagen por digest SHA256. Un **blob** es el contenido binario de una capa (tar.gz comprimido) o la configuración de la imagen (JSON). El registry almacena blobs por digest (content-addressable) y los manifiestos por tag.

**Por qué**: La especificación (actualmente v1.1.0-rc1) está implementada por Docker Hub, ECR, GCR, ACR, Harbor, Quay, y registry:2. El modelo content-addressable (blobs identificados por digest SHA256) permite deduplicación masiva: si 1000 imágenes usan la misma capa base `alpine:3.20`, el registry almacena el blob UNA vez. El manifest usa mediaTypes para identificar el formato: `application/vnd.oci.image.manifest.v1+json` (OCI) o `application/vnd.docker.distribution.manifest.v2+json` (Docker). La spec también define el manejo de rate limits, paginación de tags, y eliminación de manifests (soft delete con referencia al digest).

---

### 2. [Investigar] ¿Qué es exactamente un "manifest list" (o "fat manifest" / OCI Image Index) y cómo Docker lo usa para imágenes multi-arquitectura? ¿Cómo se crea y se consulta?

**Respuesta**: Un manifest list (llamado OCI Image Index en la OCI Image Spec) es un JSON de alto nivel que contiene una lista de descriptores de manifiestos, cada uno con la plataforma destino (`os`, `architecture`, `variant`, `os.version`). Al hacer pull, el cliente Docker envía su OS y arquitectura en los headers HTTP Accept. El registry selecciona el manifiesto correspondiente y lo devuelve. El manifest list se crea con `docker buildx build --platform linux/amd64,linux/arm64` (que genera automáticamente el index), o manualmente con `docker manifest create`. Se consulta con `docker manifest inspect` o `docker buildx imagetools inspect`, que muestra cada entrada del index con su plataforma, digest, y tamaño.

**Por qué**: El OCI Image Index (definido en image-spec v1.0) usa mediaType `application/vnd.oci.image.index.v1+json`. Docker Hub, ECR, GCR, y otros registries soportan manifest lists nativamente. La ventaja es transparencia total para el usuario: `docker run nginx:latest` en un M1 Mac (arm64) y en un servidor AMD64 descargan imágenes diferentes del mismo tag. El registry resuelve la plataforma automáticamente. Los fields opcionales del descriptor incluyen `annotations` para metadata (ej. `vnd.docker.reference.digest`), y `urls` para descargar el blob desde una URL externa (poco usado en la práctica). Buildx con QEMU permite construir para múltiples plataformas desde un solo runner.

---

### 3. [Investigar] ¿Qué es Zot y cómo se posiciona como alternativa ligera a Harbor y registry:2? ¿Qué features ofrece para entornos edge y air-gapped?

**Respuesta**: Zot (de Cisco/Project Zot) es un registry OCI open-source escrito en Go, diseñado para ser ligero, seguro, y funcionar en entornos edge/air-gapped. A diferencia de Harbor (que es un producto enterprise con UI web, múltiples servicios, DB, Redis), Zot es un solo binario (~50 MB) con: 1) escaneo de vulnerabilidades integrado (Trivy), 2) firmas Cosign/Notation integradas, 3) sincronización entre registries (útil para edge: sync de un registry central a nodos edge), 4) garbage collection eficiente, 5) interfaz web mínima (zui), 6) soporte para almacenamiento local y S3. Para entornos air-gapped: Zot se despliega como un solo binario sin dependencias externas, sincroniza imágenes desde un registry conectado vía sneakernet (USB), y escanea localmente sin internet.

**Por qué**: Zot fue presentado en KubeCon 2022 y es un proyecto abierto bajo Apache 2.0. La motivación: Harbor es excelente pero es pesado para edge (requiere ~2 GB RAM, PostgreSQL, Redis). Zot apunta a IoT, sucursales bancarias, fábricas, y entornos donde correr un cluster K8s solo para el registry no es viable. La característica de sync (pull-based y push-based) está diseñada para "hub and spoke": un Zot central en el data center, Zots edge en cada sucursal, sincronizando solo las imágenes necesarias. También soporta OCI artifacts (SBOM, firmas, Helm charts) y es compliant con OCI Distribution Spec.

---

### 4. [Investigar] ¿Qué es Notation (Azure/Notary v2) y cómo se diferencia de Cosign para firmar imágenes OCI? ¿Por qué existen dos estándares de firma?

**Respuesta**: Notation (github.com/notaryproject/notation) es el sucesor de Docker Notary (v1), impulsado por Microsoft/Azure, Amazon, y Docker. Usa el framework de firma de la OCI (Notary Project) y almacena firmas como OCI artifacts asociados a la imagen via el campo `subject` del manifiesto (OCI Image Spec v1.1). Cosign (Sigstore, Google/Chainguard) usa un enfoque más simple: firma la imagen y sube la firma como un tag adicional (`.sig`), o como artifact OCI si el registry soporta spec v1.1. Ambos logran el mismo objetivo (integridad + autenticidad), pero difieren en: 1) Cosign soporta keyless signing (OIDC + Rekor transparency log), 2) Notation usa certificados X.509 y PKI tradicional (más enterprise-friendly), 3) Notation es más nativo del ecosistema azure/ORAS, Cosign del ecosistema Google/Sigstore. La industria converge lentamente: Harbor soporta ambos.

**Por qué**: La bifurcación de estándares de firma refleja la tensión entre "simple y web-native" (Sigstore/Cosign) y "enterprise PKI compliant" (Notation). Cosign fue pionero en keyless signing (firmás con tu identidad de GitHub/Google OIDC sin manejar claves privadas). Notation surgió de la necesidad de cumplir con requisitos enterprise (HSM, CA internas, políticas de firma basadas en certificados). La OCI Image Spec v1.1 (abril 2024) estandarizó cómo referenciar artefactos relacionados (firma, SBOM) a través del campo `subject`, que ambos proyectos ahora soportan. La elección práctica depende del ecosistema de confianza de la organización.

---

### 5. [Conectar] La clase menciona Harbor. ¿Cómo se relaciona Harbor con la CNCF y qué significa que sea un proyecto "graduado"? ¿Qué otros registries son proyectos CNCF?

**Respuesta**: Harbor se unió a la CNCF en 2018 como proyecto Sandbox, pasó a Incubating en 2019, y se graduó en 2022. La graduación significa que cumple con criterios estrictos de: adopción (miles de organizaciones usándolo en producción), gobernanza (mantenedores de múltiples compañías: VMware, Alibaba, NetEase), madurez del código (CI/CD, seguridad, releases regulares), y comunidad (conferencias, meetups, contribuidores globales). Harbor es el primer registry de contenedores graduado en CNCF. Otros registries en CNCF: Dragonfly (P2P image distribution, Sandbox), Kraken (Uber, P2P registry, Sandbox). Zot no está en CNCF aún.

**Por qué**: La CNCF (Cloud Native Computing Foundation) alberga proyectos cloud-native. La graduación es el nivel más alto de madurez (Kubernetes, Prometheus, Envoy, Helm, Harbor). Para Harbor, la graduación validó que es un estándar enterprise para registry on-prem. El proceso de graduación incluye due diligence de seguridad (auditoría externa), adopción documentada (Harbor reportó 20,000+ organizaciones usando), y diversidad de contribuidores. La alternativa más cercana en CNCF es usar distribution/distribution (registry:2 de Docker, proyecto CNCF Sandbox) y construir features enterprise encima, pero Harbor ya provee todo integrado.

---

### 6. [Conectar] La clase muestra `docker push`. ¿Cómo funciona el chunked upload de blobs grandes y cómo maneja la reanudación de subidas interrumpidas?

**Respuesta**: `docker push` usa el protocolo de upload de la OCI Distribution Spec. Para blobs grandes (capas de cientos de MB): 1) `POST /v2/<name>/blobs/uploads/` — inicia la sesión de upload, el registry devuelve un `Location` header con un UUID de sesión, 2) `PATCH /v2/<name>/blobs/uploads/<uuid>` — envía chunks del blob (Content-Range header), el registry acumula los chunks, 3) `PUT /v2/<name>/blobs/uploads/<uuid>?digest=<sha256:...>` — finaliza el upload con el digest esperado, el registry verifica que el contenido matchea el digest. Si la conexión se interrumpe, el cliente puede hacer `GET /v2/<name>/blobs/uploads/<uuid>` para obtener el offset actual (cuántos bytes ya recibió el registry) y continuar desde ahí con otro PATCH. Las sesiones de upload expiran después de un tiempo configurable (default 24h en registry:2).

**Por qué**: La OCI Distribution Spec (v1.1) detalla este protocolo en la sección "Pushing Blobs". El chunked upload permite: subir imágenes de múltiples GB sin riesgo de timeout en una sola conexión, y reanudar desde el punto de interrupción sin reenviar datos ya subidos. Docker CLI y containerd implementan esto automáticamente. El digest final debe coincidir (el registry lo recalcula) para prevenir corrupción. Algunos registries (ECR) prefieren single-request upload para blobs pequeños (< 10 MB) por simplicidad. La sesión de upload (UUID) es temporal y garbage-collected si no se completa.

---

### 7. [Conectar] ¿Qué es el "rate limiting" de Docker Hub y cómo afecta a equipos de CI/CD? ¿Qué estrategias existen para mitigarlo más allá de un proxy cache?

**Respuesta**: Docker Hub impone rate limits basados en IP (para pulls anónimos) y en cuenta (para pulls autenticados). Límites actuales (2024): 100 pulls/6h por IP anónima, 200 pulls/6h para cuentas gratuitas autenticadas, 1,000-5,000 para Pro/Team, ilimitados para Business. En CI/CD, cada job que hace `docker build` puede requerir múltiples pulls (imagen base, dependencias en multi-stage), y con 20 desarrolladores + CI runners, se excede fácilmente. Estrategias más allá del proxy cache: 1) Autenticación siempre en CI (sube el límite de 100 a 200 aunque no alcance), 2) Usar imágenes base cacheadas en el runner (BuildKit cache con registry backend), 3) Migrar a un registry alternativo (ghcr.io, ECR Public, Quay) que no tiene rate limits para pulls públicos, 4) Usar `--pull=never` en builds con imágenes locales pre-cargadas.

**Por qué**: Docker Hub anunció los rate limits en 2020 (anuncio, luego implementación en noviembre 2020) causando caos en CI/CD. La comunidad reaccionó moviendo imágenes base a ghcr.io, ECR Public, o usando mirror proxies (Harbor proxy cache, registry:2 con proxy). Para CI/CD, el enfoque más robusto es: cachear la imagen base en el registry privado y referenciarla desde ahí (no desde Docker Hub), o usar `cache-to: type=registry` y `cache-from: type=registry` en BuildKit para reutilizar capas ya subidas al registry privado. GitHub Actions también ofrece cache integrada (type=gha) que reduce pulls externos.

---

### 8. [Cuestionar] ¿Deberías usar siempre un registry privado (Harbor/ECR) en lugar de Docker Hub para imágenes de producción? ¿Cuándo Docker Hub es aceptable?

**Respuesta**: Para producción, un registry privado (o gestionado: ECR, ACR, GAR) es preferible porque: 1) Control total sobre disponibilidad (sin rate limits ni dependencia de la infraestructura de Docker Inc.), 2) Compliance (datos en tu región/VPC, auditoría), 3) Seguridad adicional (escaneo integrado, firma de imágenes), 4) Integración con IAM cloud (roles en lugar de credenciales estáticas). Docker Hub es aceptable para: imágenes oficiales de infraestructura base (nginx, postgres, redis) usadas en desarrollo/staging, imágenes de proyectos open-source públicos, y cuando el costo/complejidad de mantener un registry privado no se justifica (proyectos personales, MVPs). Para producción: SIEMPRE tener un registry que controles (incluso si es un mirror proxy de Docker Hub con Harbor que cachea y escanea).

**Por qué**: La dependencia de un servicio externo para el runtime de producción es un riesgo operativo. Si Docker Hub está caído (ha tenido outages, ej. noviembre 2020), tus deploys fallan (no pueden hacer pull de imágenes). Si cambiás de tag `latest`, tus Pods pueden descargar versiones inesperadas. Los registries cloud (ECR, ACR) son altamente disponibles (multi-AZ) y se integran con IAM (sin credenciales estáticas). El costo de ECR es bajo (~$0.10/GB/mes + transferencia). Para startups, ghcr.io es gratis para repositorios públicos e ilimitado para privados, integrado con GitHub.

---

### 9. [Cuestionar] "Las imágenes multi-arquitectura son el presente, pero el 90% de los builds son amd64". ¿Vale la pena el esfuerzo de construir para arm64 hoy? ¿Qué costo tiene en CI/CD?

**Respuesta**: Para aplicaciones de servidor (que corren en cloud, mayoritariamente AMD64), el esfuerzo puede ser bajo si tenés CI runners AMD64 con QEMU (gratis, pero lento) o runners nativos ARM64. El costo en CI: 1) Tiempo: QEMU emulación de ARM en AMD es ~4x más lenta que build nativa (un build de 5 min puede tomar 20 min), 2) Si usás runners nativos ARM (Graviton en AWS, Apple Silicon en Mac), el costo es similar pero necesitás CI runners duales. Para aplicaciones que los usuarios ejecutan localmente (Docker Desktop en Mac M1/M2/M3, que son ARM64), es ESENCIAL: sin imagen ARM64, los usuarios de Mac con Apple Silicon corren la imagen AMD64 bajo emulación de Rosetta 2 o QEMU, con rendimiento degradado (2-5x más lento). Para imágenes de servidor (corren en AMD64 en la nube), no es urgente pero es future-proofing (Graviton es cada vez más popular).

**Por qué**: Docker Desktop en Apple Silicon (M1, 2020) cambió el panorama: de repente, todos los desarrolladores con Mac nuevos tenían ARM64. Si tu imagen CLI o herramienta de desarrollo no tiene build ARM64, la experiencia del usuario es mala. La encuesta de Docker (2024) muestra que ~35% de desarrolladores usan Apple Silicon. Para servidores, AWS Graviton (ARM64) ofrece 20-40% mejor precio/rendimiento que AMD64, y su adopción crece. La recomendación: si tu imagen es para desarrollo o tooling, multi-arch ES obligatorio. Si es solo para producción cloud en AMD64, podés posponerlo pero arquitectura tu CI para soportarlo cuando sea necesario (Buildx con QEMU es el primer paso barato).

---

### 10. [Cuestionar] ¿Debe `latest` tag ser considerado un antipatrón? ¿Tiene algún uso legítimo en 2025 o debería ser eliminado de las mejores prácticas?

**Respuesta**: `latest` es un antipatrón en producción porque: 1) es mutable (cada push sobreescribe) y no determinístico (dos deploys con el mismo tag pueden descargar imágenes diferentes), 2) K8s con `imagePullPolicy: IfNotPresent` no re-descarga aunque el contenido de `latest` haya cambiado, causando drift de versiones entre Pods, 3) Es imposible saber qué commit/SHA exacto está corriendo en producción. Su uso legítimo en 2025: desarrollo local rápido (donde siempre querés la última versión), documentación de ejemplos (para simplificar comandos), y imágenes de herramientas CLI que el usuario construye localmente. En CI/CD y producción: siempre usar SHA digest (`myapp@sha256:abc...`) o tag semántico inmutable (`v1.2.3`). La tendencia es: en K8s, usar digest en lugar de tag mutable.

**Por qué**: La documentación de Kubernetes recomienda evitar `latest` en producción. La función original de `latest` era conveniencia (si no especificás tag, Docker usa `latest` por defecto). Pero el nombre sugiere "última versión" cuando en realidad es "lo último que se subió con este tag", que puede ser una versión rota o incompleta. Herramientas como Hadolint emiten warning DL3007 si usás `latest` en FROM. La práctica moderna: en Dockerfile, siempre especificar tag explícito (`FROM node:20.11.1-alpine`, no `FROM node:latest`). En deploys, usar el SHA del commit como tag de imagen y el digest para referenciar la imagen exacta en los manifiestos.
