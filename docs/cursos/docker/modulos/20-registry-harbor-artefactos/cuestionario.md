---
sidebar_label: "Cuestionario"
---

# Cuestionario M20 — Registry, Harbor y Gestión de Artefactos

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente la OCI Distribution Spec v1.1 y qué nuevas capacidades introduce respecto a v1.0? ¿Cómo habilita el ecosistema de supply chain (firmas, SBOMs)?

**Respuesta**: OCI Distribution Spec v1.1 (abril 2024) agrega: 1) **Referrers API**: permite listar artefactos relacionados con una imagen (firmas, SBOMs, attestations) sin tags hack. Antes, Cosign usaba tags `.sig` y `.sbom` (workaround). Ahora `GET /v2/<name>/referrers/<digest>` devuelve la lista de artefactos asociados. 2) **ArtifactType en manifest**: permite diferenciar tipos de artefactos (imagen vs chart Helm vs WASM module) sin depender de config.mediaType. 3) **subject field**: un artifact puede declarar a qué otro manifiesto hace referencia (ej. una firma declara `subject: <digest-de-la-imagen>`). Esto estandariza cómo adjuntar metadatos a imágenes en cualquier registry OCI-compliant. Cosign, Notation, y ORAS están migrando a usar referrers API en lugar de tags.

**Por qué**: La spec v1.1 fue liderada por Steve Lasker (Microsoft, chair del OCI Technical Oversight Committee) y el equipo de distribución OCI. El problema que resuelve: antes de v1.1, no había forma estándar de relacionar artefactos. Cosign creaba un tag `.sig`, Syft subía un SBOM como imagen separada, y el discovery de estos artefactos era frágil (parsing de tags). Referrers API + subject field estandarizan esto. Harbor 2.10+, ECR, ACR, y registry:2 ya soportan v1.1 parcial o totalmente.

---

### 2. [Investigar] ¿Qué es exactamente ORAS (OCI Registry As Storage) y cómo permite almacenar cualquier tipo de artefacto en un registry OCI? ¿Qué artefactos más allá de imágenes son posibles?

**Respuesta**: ORAS (oras.land, proyecto CNCF Sandbox) es una librería y CLI que permite hacer push/pull de cualquier tipo de archivo a un registry OCI usando la OCI Distribution Spec. Trata al registry como un almacenamiento genérico de artefactos, no solo contenedores. Posibles artefactos: 1) Helm charts (`helm push oci://...` usa ORAS), 2) WebAssembly modules, 3) CNAB bundles (paquetes de aplicaciones cloud), 4) OPA policies (Rego files), 5) SBOMs (SPDX/CycloneDX), 6) Firmas (Cosign), 7) Archivos de configuración arbitrarios (YAML, JSON). ORAS organiza artefactos en layers (como capas de imagen) y manifiestos. El CLI `oras push` sube archivos al registry, `oras pull` los descarga. Harbor integra ORAS nativamente (soporta cualquier artifact type).

**Por qué**: ORAS fue creado por Steve Lasker (Microsoft) y Josh Dolitsky (Blood Orange) como parte del movimiento de "registries como almacenamiento universal cloud-native". La idea: en lugar de tener Nexus (JARs), Artifactory (de todo), y Docker Registry (imágenes), todo puede ir a un registry OCI. Helm 3.8+ usa ORAS para charts OCI. Cosign usa ORAS para subir firmas. Notation usa ORAS para subir signatures. El CLI oras es la herramienta universal de interacción con registries OCI más allá de Docker.

---

### 3. [Investigar] ¿Qué arquitectura de alta disponibilidad soporta Harbor? ¿Cómo se scalea horizontalmente y qué componentes son stateful vs stateless?

**Respuesta**: Harbor es un conjunto de microservicios, cada uno con diferentes requisitos de HA: 1) **Stateless** (escalan horizontalmente sin problema): Harbor Core (API/UI), Trivy (escaneo), Jobservice (limpieza, replicación), Registry (distribution/distribution). Pueden correr múltiples réplicas detrás de un load balancer. 2) **Stateful** (requieren almacenamiento persistente y HA específica): PostgreSQL (metadata del registry, usuarios, proyectos, políticas) — requiere HA con streaming replication (o usar RDS externo), Redis (cache, sesiones, job queue) — requiere HA con Sentinel o Cluster, Storage backend (imágenes) — debe ser compartido (S3, NFS, almacenamiento en bloque con ReadWriteOnce). Harbor recomienda externalizar PostgreSQL y Redis (usar servicios gestionados) y usar S3-compatible storage para el registry. En K8s, Harbor se despliega via Helm chart oficial con soporte para HA (múltiples réplicas de componentes stateless, PVCs para stateful).

**Por qué**: La documentación de Harbor (goharbor.io) detalla la arquitectura de HA. En producción, la configuración recomendada es: 1) Harbor desplegado en K8s con el Helm chart oficial, 2) PostgreSQL externo (AWS RDS, Cloud SQL) con HA, 3) Redis externo (ElastiCache, Memorystore) con HA, 4) Storage: S3 (o GCS, Azure Blob) para imágenes (usando el driver S3 del registry). Esto permite que los Pods de Harbor sean efímeros y escalen horizontalmente.

---

### 4. [Investigar] ¿Qué son exactamente los "SBOMs" y cómo se integran en Harbor? ¿Qué formatos soporta (SPDX vs CycloneDX) y cómo se adjuntan a las imágenes?

**Respuesta**: SBOM (Software Bill of Materials) es un inventario de todos los componentes, bibliotecas, y versiones en una imagen. Harbor soporta SBOMs desde la versión 2.10: 1) Generación automática: cuando se escanea una imagen con Trivy (scanner integrado), Trivy genera un SBOM automáticamente (lista de paquetes del SO y dependencias de aplicación). 2) Adjunto: el SBOM se sube al registry como artifact OCI relacionado (usando referrers API o subject field), adjunto a la imagen. 3) Visualización: en la UI de Harbor, cada imagen muestra su SBOM (lista de componentes y versiones). 4) Formatos: Harbor soporta SPDX (Linux Foundation) y CycloneDX (OWASP). Ambos son estándares abiertos para SBOM. La diferencia: SPDX es más orientado a licencias y compliance, CycloneDX a seguridad. Trivy genera ambos formatos.

**Por qué**: El soporte de SBOMs en Harbor fue impulsado por la orden ejecutiva 14028 de la Casa Blanca (2021) y la creciente demanda de compliance. La integración con Trivy hace que sea automático: cada imagen escaneada tiene su SBOM disponible. Para exportar: `oras pull harbor.local/project/image:tag --sbom` (o via API). La trazabilidad: saber que la imagen usa log4j 2.17.1 en lugar de 2.14.0 que tiene CVE. Para compliance FedRAMP/PCI/HIPAA, SBOMs son cada vez más requeridos.

---

### 5. [Conectar] La clase menciona Cosign. ¿Cómo funciona exactamente el "keyless signing" con Cosign y Sigstore? ¿Qué es Rekor y qué valor agrega al proceso de firma?

**Respuesta**: Keyless signing con Cosign (Sigstore): 1) No generás ni manejas claves privadas locales. 2) Cosign inicia un flujo OIDC (OpenID Connect) con tu proveedor de identidad (Google, GitHub, Microsoft). 3) El proveedor emite un ID token JWT que prueba tu identidad (ej. tu dirección de email en GitHub). 4) Cosign usa el token para solicitar un certificado efímero X.509 de Fulcio (CA de Sigstore, emitida por la Linux Foundation). 5) Cosign firma la imagen con este certificado (que es válido solo por 10 minutos). 6) Cosign registra la firma en Rekor (transparency log público e inmutable). El resultado: cualquiera puede verificar que la imagen fue firmada por tu identidad, sin tener tu clave pública (la verificación usa el certificado y verifica el registro en Rekor). Rekor agrega "non-repudiation": la firma es públicamente auditable (timestamped, inmutable). No podés negar haber firmado.

**Por qué**: Sigstore fue creado por Luke Hinds (Red Hat), Dan Lorenc (Google/Chainguard), y la comunidad. Rekor (transparency log) es la innovación clave: es un Merkle tree público donde cada entrada es inmutable. Si alguien compromete tu identidad OIDC, la firma fraudulenta queda registrada en Rekor públicamente y es detectable. Esto es superior a GPG/PGP (donde las claves no tienen transparencia). Cosign keyless es el futuro de la firma de imágenes: sin gestión de claves, con auditabilidad pública.

---

### 6. [Conectar] ¿Cómo funciona exactamente la replicación de imágenes en Harbor? ¿Qué diferencia hay entre replicación push-based y pull-based?

**Respuesta**: Replicación push-based: Harbor ORIGEN inicia la transferencia. La instancia de Harbor (origen) se conecta al registry destino y empuja las imágenes. Útil cuando el destino no tiene acceso de red al origen (firewall). Replicación pull-based: Harbor DESTINO inicia la transferencia. La instancia de Harbor (destino) se conecta al registry origen y jala las imágenes. Útil para cumplir políticas de firewall (solo se permite tráfico saliente desde el destino). La replicación se configura por proyecto con filtros (nombre de imagen, tag, label) y triggers (manual, schedule, o event-based: cada push dispara replicación). Modos: Full (replica todo), Selective (por filtros). La replicación es a nivel de blob (las capas compartidas se copian una vez, no duplican). Soporta destinos: otro Harbor, Docker Hub, ECR, GCR, ACR, registry OCI.

**Por qué**: La replicación de Harbor usa el mismo mecanismo de distribución OCI (push/pull de blobs y manifiestos). Para redes air-gapped, Harbor puede exportar imágenes como tar para sneakernet (USB) y la replicación pull-based desde el destino las importa. La replicación event-based es útil para CI/CD: tan pronto como una imagen se sube a Harbor-dev, se replica automáticamente a Harbor-staging.

---

### 7. [Conectar] ¿Qué políticas de retención y garbage collection tienen Harbor y cómo se diferencian? ¿Por qué GC debe ejecutarse fuera de horario pico?

**Respuesta**: Políticas de retención: reglas declarativas por proyecto que definen qué tags/imágenes eliminar automáticamente (ej. mantener últimas 10 versiones, eliminar imágenes sin tag después de 24h). La retención solo MARCA manifiestos para eliminación (los "desreferencia"). Garbage Collection (GC): proceso que recorre los blobs en storage y elimina los que ya no son referenciados por ningún manifest. GC debe ejecutarse fuera de horario pico porque: 1) en versiones de Harbor <2.0, GC ponía el registry en modo read-only (pulls funcionan, pushes no), 2) GC consume I/O del storage (lee metadatos de todos los blobs), 3) en storage compartido (S3), GC puede generar tráfico significativo. Harbor 2.0+ implementa "online GC" que no bloquea pushes, pero sigue consumiendo I/O.

**Por qué**: La documentación de Harbor (GC) recomienda ejecutar GC semanalmente en ventanas de bajo uso. La retención se ejecuta más frecuentemente (diario) porque solo modifica metadata (manifests) sin tocar blobs. El GC es necesario porque cuando un manifest se elimina (por retención o manualmente), los blobs no se eliminan automáticamente (pueden ser compartidos). Sin GC, el storage crece indefinidamente. Harbor también tiene "blob replication" (replicación a nivel de blob, no de manifiesto) para optimizar la sincronización.

---

### 8. [Cuestionar] ¿Es Harbor el registry enterprise definitivo o hay alternativas (Quay, Nexus, Artifactory) que son mejores para ciertos casos?

**Respuesta**: Harbor domina para contenedores y OCI artifacts. Alternativas: 1) **Quay** (Red Hat): más ligero que Harbor, enfocado en imágenes OCI, con escaneo integrado (Clair) y firma (Cosign). Mejor si ya estás en el ecosistema Red Hat/OpenShift. 2) **Nexus Repository** (Sonatype): repositorio universal (Maven, npm, PyPI, Docker, Helm, etc.) con un solo producto. Mejor si necesitás un ÚNICO repositorio para múltiples tipos de artefactos (no solo containers). 3) **Artifactory** (JFrog): similar a Nexus, repositorio universal muy maduro, con build integration avanzada y CI/CD pipeline tracing. Mejor para empresas grandes con múltiples tipos de artefactos y compliance avanzado. Harbor es el mejor para ecosistema cloud-native (OCI, Helm, Cosign, SBOMs) y solo contenedores. Para empresas con Java + npm + Docker + NuGet, Nexus/Artifactory evitan tener múltiples registries.

**Por qué**: El landscape de artefactos cloud-native muestra una bifurcación: registries especializados en OCI (Harbor, Quay) vs registries universales (Nexus, Artifactory). Harbor es CNCF graduated, open-source, y con features enterprise gratuitas (Quay idem). Nexus y Artifactory son productos comerciales (con ediciones open-source limitadas). Para la mayoría de los equipos cloud-native modernos, Harbor es la mejor opción por features y costo.

---

### 9. [Cuestionar] ¿Deberías usar un registry privado auto-gestionado (Harbor) o un registry cloud gestionado (ECR, ACR, GAR)? ¿Cuáles son los trade-offs reales?

**Respuesta**: Cloud gestionado (ECR/ACR/GAR): cero operaciones (no gestionás storage, HA, parches), integración IAM nativa (sin credenciales, usa roles), escalabilidad infinita (sin GC manual), replicación multi-región automática (si usás el servicio del cloud provider). Auto-gestionado (Harbor): control total sobre los datos (air-gapped, compliance de ubicación), features avanzadas (firma, escaneo, proxy cache, retención detallada) que el cloud puede no ofrecer en el mismo nivel, costo predecible (sin sorpresas de transferencia de datos). El trade-off: ¿preferís no gestionar infraestructura (cloud) o necesitás features/control que solo Harbor da? Para la mayoría: registry cloud para simplicidad, Harbor para casos específicos (air-gapped, multi-cloud, features avanzadas de seguridad).

**Por qué**: Los registries cloud han mejorado mucho: ECR tiene scanning (Inspector), replication (cross-account/region), y lifecycle policies. GAR tiene vulnerability scanning y metadata storage. Pero Harbor ofrece más granularidad (políticas de retención por tag, RBAC por proyecto, proxy cache integrado, soporte Cosign/Notation UI). La decisión también es económica: el storage es barato (~$0.10/GB/mes), pero la transferencia de datos puede ser cara (egress a internet). Harbor on-prem elimina costos de transferencia para pulls internos.

---

### 10. [Cuestionar] ¿Son las "robot accounts" de Harbor una buena práctica o deberían reemplazarse con OIDC workload identity en CI/CD?

**Respuesta**: Robot accounts son una buena práctica para CI/CD simple y equipos que no tienen OIDC workload identity configurado. Ventajas: fáciles de crear, permisos granulares, tokens con expiración, audit trail (sabés qué robot hizo qué). Desventajas: los tokens son secretos estáticos (deben rotarse, pueden filtrarse). OIDC workload identity (ej. GitHub Actions OIDC → Harbor OIDC) es más seguro: no hay secretos estáticos, la autenticación es temporal (token efímero), y la identidad del pipeline es verificable criptográficamente (sin secretos compartidos). La tendencia es migrar a OIDC para CI/CD, manteniendo robot accounts solo para casos donde OIDC no es posible (sistemas legacy, scripts manuales). Harbor soporta OIDC (desde v2.5) para autenticación de usuarios y puede extenderse a CI/CD via exchange token.

**Por qué**: GitHub Actions permite OIDC tokens (Actions → Harbor) desde 2021. GitLab CI idem. Esto elimina el "secret zero" problem (¿dónde almaceno el token de Harbor para CI?). Con OIDC, el CI presenta un token JWT firmado por GitHub/GitLab al Harbor, Harbor lo verifica, y emite un token de acceso temporal. La seguridad mejora drásticamente (sin secretos estáticos que rotar). Robot accounts seguirán existiendo para casos de uso simples.
