---
sidebar_label: "Cuestionario"
---

# Cuestionario M21 — Docker en CI/CD

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente Dagger y cómo redefine el CI/CD basado en contenedores? ¿En qué se diferencia de usar Docker directamente en GitHub Actions?

**Respuesta**: Dagger (dagger.io, Solomon Hykes, fundador de Docker) es un toolkit para construir pipelines CI/CD como código (en Go, TypeScript, Python) que se ejecutan completamente en contenedores. A diferencia de usar `docker build` + `docker push` en un script de GitHub Actions: 1) Dagger define pipelines como funciones en un lenguaje de programación real (no YAML), con tipos, testing, y reutilización, 2) Los pipelines se ejecutan 100% en contenedores (el runner de CI solo necesita Dagger Engine, no herramientas específicas), 3) El cache de build es distribuido y compartido entre runners y desarrolladores locales (mismo pipeline corre en CI y en la laptop del dev), 4) Dagger usa BuildKit internamente para builds eficientes, pero abstrae la complejidad. Esencialmente, Dagger es a CI/CD lo que Docker fue a los contenedores: un estándar para empaquetar y ejecutar pipelines.

**Por qué**: Solomon Hykes presentó Dagger en 2022 como "Docker for CI/CD". La visión: pipelines como contenedores componibles, con cache universal, que corren igual en local y en CI. Docker en CI (GitHub Actions) es scripting imperativo + YAML. Dagger es código (type-safe, testable). Por ejemplo: `dagger call build --source . publish --registry harbor.local`. La comunidad de Dagger está creciendo (Dagger Zenith, módulos reutilizables). Es un concepto nuevo; compite con Jenkins, GitHub Actions, y Tekton, no con Docker.

---

### 2. [Investigar] ¿Qué es exactamente Tekton y cómo implementa pipelines nativos de Kubernetes? ¿En qué se diferencia de Jenkins y GitHub Actions?

**Respuesta**: Tekton (proyecto CDF/ Linux Foundation, basado en Knative Build) es un framework de CI/CD para Kubernetes que usa CRDs para definir pipelines, tasks, y triggers. Todo corre como Pods en K8s. Diferencia con Jenkins: 1) Tekton es serverless (cada step es un Pod que se ejecuta y termina, no hay un servidor Jenkins corriendo 24/7), 2) Los pipelines son recursos nativos de K8s (YAML, versionables en Git, aplicables con kubectl), 3) Escala horizontalmente con el cluster (no requiere infraestructura de CI separada). Diferencia con GitHub Actions: Tekton es cloud-agnostic (corre en cualquier K8s, no está atado a GitHub), y los pipelines son recursos de K8s (no archivos en `.github/workflows`). Desventaja: Tekton tiene una curva de aprendizaje más alta (K8s + CRDs + Tasks).

**Por qué**: Tekton fue creado por Google (basado en el sistema de build interno de Google) y donado a la CDF (Continuous Delivery Foundation). Es el estándar de CI/CD nativo de K8s. Cada Task (unidad de trabajo: `git-clone`, `buildpacks`, `kaniko`) es un contenedor. Las Tasks se encadenan en Pipelines. Tekton Triggers escuchan eventos (webhooks de GitHub) y disparan PipelineRuns. Para equipos que ya usan K8s, Tekton elimina la necesidad de un servidor de CI externo.

---

### 3. [Investigar] ¿Cómo funciona exactamente BuildKit con cache remoto (`type=registry`, `type=s3`, `type=gha`)? ¿Qué estrategia de cache es óptima para monorepos con múltiples imágenes?

**Respuesta**: BuildKit soporta exportar e importar cache desde backends remotos: 1) `type=registry`: sube las capas cacheadas como blobs OCI a un registry (Harbor, ECR). El próximo build importa las capas desde el registry en lugar de re-ejecutar comandos. Ventaja: funciona en cualquier entorno, no depende del CI. 2) `type=gha`: usa el cache service de GitHub Actions (10 GB gratis). Ventaja: integración nativa con GitHub, cero configuración de registry. 3) `type=s3`: usa S3 como storage de cache. Para monorepos con múltiples imágenes: usar `mode=max` (cachea todas las capas intermedias, no solo las de la imagen final) y scopes diferentes por imagen (`--cache-from type=registry,ref=myapp-cache:<sha>,scope=service-a`). El scope permite que caches de diferentes builds no se interfieran. `mode=max` exporta capas de stages intermedios (build stage, dependency stage), no solo del stage final.

**Por qué**: La documentación de BuildKit (github.com/moby/buildkit) detalla los backends de cache. `mode=max` fue introducido en BuildKit 0.8 para multi-stage builds. Sin `mode=max`, solo se cachea el stage final (imagen resultante). Con `mode=max`, se cachean los stages intermedios (dependencies, build), permitiendo que builds de otros servicios reutilicen el cache de dependencias comunes. Para monorepos, `scope` por servicio asegura que el cache de `service-a` no polucione el de `service-b`.

---

### 4. [Investigar] ¿Qué es exactamente el "GitOps" y cómo difiere del modelo CI-push tradicional para despliegue de contenedores? ¿Qué herramientas implementan GitOps (ArgoCD, Flux)?

**Respuesta**: CI-push tradicional: el pipeline CI construye la imagen, ejecuta tests, y al final hace push al registry Y EJECUTA `kubectl apply` o `helm upgrade` (el CI empuja cambios al cluster). Problemas: el CI necesita credenciales de deploy (riesgo de seguridad), si el cluster está caído el deploy falla (sin reintento automático), y no hay registro de quién cambió qué (el CI actúa como actor). GitOps: el pipeline CI construye la imagen y actualiza un repositorio Git (deployment config) con el nuevo tag/digest. Un agente en el cluster (ArgoCD, Flux) monitorea ese repo Git y reconcilia el cluster con el estado declarado en Git (pull). El cluster "jala" la configuración desde Git. Ventajas: 1) el CI no necesita credenciales del cluster, 2) el estado deseado está versionado en Git, 3) el agente continuamente reconcilia (si alguien cambia algo manualmente en el cluster, el agente lo revierte), 4) rollback = revert commit en Git.

**Por qué**: GitOps fue acuñado por Weaveworks (Alexis Richardson) en 2017. ArgoCD (Intuit, CNCF graduado) y Flux (Weaveworks, CNCF graduado) son las implementaciones principales. La diferencia fundamental: CI-push = CI escribe en el cluster. GitOps = CI escribe en Git, el cluster lee de Git. Esto desacopla CI (build) de CD (deploy), mejora seguridad, y habilita multi-cluster (varios clusters leyendo del mismo Git).

---

### 5. [Conectar] La clase menciona Kaniko. ¿Qué otras herramientas existen para construir imágenes sin Docker daemon (buildah, img, buildpacks)? ¿Cuándo elegir cada una?

**Respuesta**: 1) **Kaniko**: interpreta Dockerfile en userspace, sin daemon, sin privilegios. Ideal para K8s (corre como Pod normal, sin Docker socket). 2) **Buildah** (Red Hat): construye imágenes OCI desde línea de comandos o Dockerfile. Puede correr rootless, sin daemon. Ideal para entornos RHEL/Fedora y scripts de build (no K8s nativo). 3) **img** (Jessie Frazelle): construye imágenes sin daemon usando una biblioteca Go. Menos mantenido hoy. 4) **Cloud Native Buildpacks** (Heroku, VMware): construye imágenes OCI sin Dockerfile, detectando el lenguaje y aplicando best practices automáticamente. Ideal para aplicaciones estándar (Spring Boot, Express, Django) sin escribir Dockerfile. 5) **BuildKit con rootless**: BuildKit puede correr sin root (rootless kit). Ideal para entornos donde necesitás compatibilidad Docker (Dockerfile) pero sin daemon root. Elección: Kaniko para CI en K8s (estándar), Buildpacks si no querés escribir Dockerfiles, Buildah si estás en RHEL, BuildKit rootless para casos avanzados.

**Por qué**: La deprecación de dockershim en K8s (1.24) catalizó la adopción de herramientas de build sin Docker daemon. Kaniko (Google, 2018) fue pionero. Buildah (2017) es parte del ecosistema Podman. Buildpacks (2018+) son promovidos por la CNCF y VMware Tanzu. La elección depende de si tenés Dockerfiles existentes (Kaniko/BuildKit) o querés evitar Dockerfiles (Buildpacks).

---

### 6. [Conectar] ¿Cómo se relacionan los SBOMs y la firma de imágenes con el pipeline CI/CD? ¿Dónde se generan y verifican en el flujo?

**Respuesta**: En el pipeline CI/CD, la seguridad de supply chain sigue este flujo: 1) Build: se construye la imagen (BuildKit, Kaniko). 2) SBOM generation: inmediatamente después del build, se genera el SBOM de la imagen (Syft, Trivy) y se adjunta al registry (Cosign attach, ORAS). 3) Vulnerability scan: se escanea la imagen (Trivy, Docker Scout) usando el SBOM para identificar paquetes con CVEs. Si hay CRITICAL, el pipeline falla. 4) Sign: la imagen se firma (Cosign, Notation) con la identidad del pipeline. 5) Attestation: se firma una attestación que incluye el SBOM, los resultados del escaneo, y la procedencia (provenance). 6) Push: la imagen firmada + SBOM + attestación se suben al registry. 7) Verify (en deploy): antes de desplegar, el admission controller (Conaisseur, Kyverno) verifica la firma. Si la imagen no está firmada o la firma no coincide, el deploy se rechaza.

**Por qué**: El supply chain security con SLSA (Supply-chain Levels for Software Artifacts, de Google) define niveles (L1-L4) de seguridad. Generar SBOM y firmar imágenes alcanza SLSA L2-L3. Herramientas como Cosign, Syft, y SLSA GitHub Generator automatizan esto. La integración en CI/CD es crucial porque sin automatización, los pasos de seguridad se omiten.

---

### 7. [Conectar] La clase muestra `docker compose up -d` en CI. ¿Cuándo es preferible `docker compose` vs Testcontainers vs Kubernetes para tests de integración en CI?

**Respuesta**: 1) `docker compose` (o `docker compose up --wait`): bueno para tests que necesitan múltiples servicios reales (PostgreSQL + Redis + la app) en un entorno similar a producción. El CI solo necesita Docker. 2) Testcontainers: bueno para tests unitarios/de integración desde el código (Java, Python, Go). Cada test levanta solo los servicios que necesita (contenedor PostgreSQL efímero). Ventaja: configuración en código, más granular, auto-limpieza. 3) Kubernetes (kind, Minikube, o un namespace temporal en un cluster): bueno para tests que necesitan features de K8s (ConfigMaps, Secrets, Services, Ingress, NetworkPolicy). Es más pesado (crear cluster/namespace) pero más realista si producción es K8s. Elección: Compose para CI simple, Testcontainers para tests desde código (sin YAML externo), K8s cuando probás features específicas de K8s.

**Por qué**: La encuesta de Docker (2024) muestra que `docker compose` sigue siendo la herramienta más usada para CI. Testcontainers (proyecto CNCF, 2015) creció en popularidad para tests de integración en lenguajes específicos. Kind es el estándar para CI de aplicaciones K8s. La tendencia: usar Testcontainers para tests de integración en el código, y Compose/Kind para pruebas end-to-end en el pipeline.

---

### 8. [Cuestionar] ¿Deben los pipelines CI/CD ser "container-first" o "pipeline-first"? ¿Es Docker el centro o es un step más?

**Respuesta**: Container-first (Docker como centro) significa que todos los steps del pipeline corren en contenedores: linting (Hadolint en contenedor), build (Kaniko/BuildKit), test (Testcontainers o `docker compose`), scan (Trivy en contenedor). Esto garantiza reproducibilidad: el pipeline corre igual en local y en CI. Pipeline-first (YAML del CI como centro) significa que algunos steps usan acciones nativas del CI (GitHub Actions, GitLab CI) sin Docker, y Docker es solo uno de los steps (el build de imagen). El debate: container-first es más portable (cambiás de CI sin reescribir todo) pero puede ser más lento (overhead de contenedores). Pipeline-first es más integrado con el CI (mejor UX, logs, UI) pero vendor-lock. La tendencia: híbrido — usar contenedores para steps que necesitan herramientas específicas, y actions nativas para integración con el CI.

**Por qué**: Dagger (Solomon Hykes) aboga por container-first: "tu pipeline es una función que corre en un contenedor, en cualquier CI". GitHub Actions aboga por pipeline-first (actions del marketplace). La realidad práctica: para GitHub Actions, combinar `docker/build-push-action` (container step) con `actions/checkout` (native step) es el balance correcto. Para máxima portabilidad, Dagger o Tekton.

---

### 9. [Cuestionar] ¿Es `latest` tag en CI/CD aceptable para staging pero no para producción? ¿O debería erradicarse completamente?

**Respuesta**: `latest` no debería usarse en ningún entorno que requiera trazabilidad y reproducibilidad. Staging también necesita saber exactamente qué versión se está probando. Si staging usa `latest` y producción usa `v1.2.3`, no hay garantía de que lo mismo que pasó staging está en producción. El flujo correcto: 1) CI construye imagen con tag = git SHA (`a1b2c3d`), 2) CI despliega en staging con ese SHA, 3) Después de tests, promociona a producción con el mismo SHA (o tag semántico adicional `v1.2.3`). `latest` solo es aceptable en desarrollo local (donde el dev siempre quiere lo último). Incluso en desarrollo, usar SHA da más confianza: sabés exactamente qué código estás ejecutando.

**Por qué**: El anti-patrón "but it works on my machine" frecuentemente es "staging usa latest, que es diferente a lo que el dev tenía localmente". La inmutabilidad de imágenes es un principio fundamental de Docker. `latest` rompe esto.

---

### 10. [Cuestionar] ¿Deben los equipos pequeños adoptar GitOps o es demasiada complejidad para el beneficio?

**Respuesta**: GitOps agrega complejidad (repositorio de config separado, ArgoCD/Flux en el cluster) pero también agrega seguridad y auditabilidad. Para equipos pequeños (2-5 personas) con 1-2 clusters y deploy simple, el overhead de GitOps puede no justificarse. En su lugar, `kubectl apply` o `helm upgrade --install` desde CI (CI-push) es suficiente y más simple. GitOps brilla cuando: 1) múltiples clusters (staging, prod, multi-region), 2) múltiples equipos (control de quién despliega qué), 3) requisitos de compliance (audit trail de cada cambio en Git), 4) necesidad de auto-remediation (si alguien cambia manualmente, GitOps lo revierte). La recomendación: empezar con CI-push simple, migrar a GitOps cuando la complejidad de gestión de deploys supere la complejidad de configurar GitOps.

**Por qué**: La curva de adopción de GitOps documentada por Weaveworks y la CNCF muestra que GitOps se adopta típicamente en organizaciones con 5+ equipos de desarrollo. Para equipos pequeños, la simplicidad de CI-push supera los beneficios de GitOps. Herramientas como `kamal` (37signals) ofrecen un punto intermedio: deploy desde CI sin GitOps pero con zero-downtime.
