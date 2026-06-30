---
sidebar_label: "Cuestionario"
---

# Cuestionario M18 — Helm Charts

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué son exactamente los "Helm template functions" y cómo permiten lógica avanzada en charts? Mencioná 5 funciones de Sprig/Go templates que sean especialmente útiles.

**Respuesta**: Helm usa Go templates con la librería Sprig (Masterminds/sprig) que agrega 70+ funciones. Las más útiles: 1) `default` — provee valor por defecto: `{{ .Values.port | default 8080 }}`, 2) `indent` — indenta texto para YAML anidado: `{{ .Values.config | indent 4 }}`, 3) `toYaml` — convierte un mapping a YAML inline: `{{ toYaml .Values.resources | indent 10 }}`, 4) `include` — reutiliza templates definidos en `_helpers.tpl`: `{{ include "mychart.fullname" . }}`, 5) `required` — falla el render si un valor está vacío: `{{ required "A valid .Values.image.repository is required!" .Values.image.repository }}`. También: `tpl` (evalúa un string como template para templates dinámicos), `b64enc`/`b64dec` (encoding base64 para Secrets), `sha256sum` (hash para detección de cambios), `lookup` (consulta la API de K8s en tiempo de render).

**Por qué**: La documentación de Helm (helm.sh/docs/chart_template_guide) detalla las funciones disponibles. Sprig (github.com/Masterminds/sprig) fue creado por Matt Butcher (co-creador de Helm) para enriquecer Go templates. La función `lookup` (Helm 3+) permite consultar el estado actual del cluster durante `helm template`/`install` (ej. obtener el UID de un namespace existente). Es poderosa pero debe usarse con cuidado (hace que el chart sea cluster-dependiente). `tpl` permite que values.yaml contenga templates (ej. anotaciones dinámicas), que se evalúan recursivamente.

---

### 2. [Investigar] ¿Qué son los "Helm hooks" y cómo se diferencian de los init containers? ¿Qué pesos (weights) y políticas de eliminación (delete policies) tienen?

**Respuesta**: Helm hooks son recursos (Jobs, Pods) que se ejecutan en momentos específicos del ciclo de vida de un release, definidos por la annotation `helm.sh/hook: <tipo>`. Tipos: `pre-install`, `post-install`, `pre-delete`, `post-delete`, `pre-upgrade`, `post-upgrade`, `pre-rollback`, `post-rollback`, `test`. Diferencias con init containers: 1) los hooks ejecutan acciones en el ciclo de vida del RELEASE (ej. migración de BD antes del upgrade), no del Pod, 2) los hooks pueden ejecutarse en un recurso separado (un Job), no en el Pod de aplicación, 3) los hooks esperan a que el recurso se complete exitosamente antes de continuar. Pesos: `helm.sh/hook-weight: "5"` (número negativo o positivo) ordena múltiples hooks del mismo tipo (menor número se ejecuta primero). Políticas de eliminación: `helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded` — elimina el hook anterior antes de crear uno nuevo, elimina después de éxito.

**Por qué**: Los hooks son la feature que permite automatizar tareas de gestión de releases (migraciones, backups, validaciones) declarativamente dentro del chart. A diferencia de ejecutar `kubectl run` como paso separado en CI/CD, los hooks están versionados en el chart y se ejecutan automáticamente por Helm. La annotation `helm.sh/resource-policy: keep` indica que el recurso NO debe ser eliminado al desinstalar el release.

---

### 3. [Investigar] ¿Qué es un "library chart" en Helm y en qué se diferencia de un chart de aplicación? ¿Cómo comparten helpers entre múltiples charts?

**Respuesta**: Un library chart (tipo `library` en Chart.yaml, Helm 3+) es un chart que no se instala directamente, sino que provee templates reutilizables (helpers, named templates) que otros charts pueden importar. Se declara como dependencia en Chart.yaml:
```yaml
dependencies:
  - name: mylib
    version: 0.1.0
    repository: "file://../mylib"
```
Y en el chart principal, los templates del library chart se invocan con `{{ include "mylib.helper" . }}`. La diferencia con un chart de aplicación (tipo `application`): 1) library chart no tiene templates propios que generen recursos (solo `_helpers.tpl` y posiblemente `templates/` con helpers), 2) no es instalable con `helm install`, 3) su propósito es DRY (Don't Repeat Yourself) a nivel de organización: si tenés 20 microservicios que comparten estructura de deployment/service/ingress, el library chart define esa estructura una vez.

**Por qué**: Los library charts fueron introducidos en Helm 3 (2019) para resolver el problema de "copy-paste entre charts". Grandes organizaciones con múltiples charts usan library charts para estandarizar: healthchecks, resource limits, labels, anotaciones de seguridad. Ejemplos: Bitnami charts usan un library chart interno. Para organizaciones más pequeñas, duplicar templates es aceptable; library charts agregan complejidad de versionado de dependencias.

---

### 4. [Investigar] ¿Qué es exactamente "Helm post-renderer" y cómo se usa con Kustomize? ¿Por qué esta combinación es poderosa?

**Respuesta**: Post-renderer (Helm 3.1+) permite pasar los manifests renderizados por Helm a un comando externo (ej. Kustomize) para modificaciones post-procesamiento. Se configura con `--post-renderer /path/to/kustomize` o en la config de Helm. El flujo: 1) Helm renderiza los templates con values, 2) Pasa el YAML resultante al post-renderer via stdin, 3) El post-renderer lo modifica y devuelve via stdout, 4) Helm aplica el resultado final. Con Kustomize: podés usar Helm para la parametrización y Kustomize para patches, overlays, y name prefix/suffix. Esto es poderoso porque Helm maneja la lógica condicional y values, y Kustomize maneja composition y patches para variantes de entorno.

**Por qué**: El post-renderer resuelve el debate "Helm vs Kustomize": podés usar ambos. Kustomize es mejor para patches estructurales (cambiar replicas, agregar labels, modificar anotaciones) sin modificar el chart. Helm es mejor para lógica condicional y values parametrizados. La combinación: Helm chart define la base, Kustomize overlay aplica variaciones por entorno (dev, staging, prod). ArgoCD soporta nativamente Helm + Kustomize en la misma aplicación. Flux soporta HelmRelease con `postRenderers`.

---

### 5. [Conectar] La clase muestra Helm como "gestor de paquetes". ¿Cómo se compara realmente con apt/yum/npm en términos de manejo de dependencias, versionado, y resolución de conflictos?

**Respuesta**: Helm es similar a apt/yum/npm en concepto (paquete con metadata + payload + dependencias), pero más limitado en gestión de dependencias: 1) Helm no resuelve versiones transitivas como npm (no hay lock file automático), 2) Helm no maneja conflictos de dependencias (no hay diamond dependency problem solver), 3) Helm no tiene un "helm update" que actualice todas las dependencias a las últimas versiones compatibles (hay que hacerlo manual), 4) El versionado de chart (`version` en Chart.yaml) es SemVer pero la compatibilidad entre charts no se verifica (el Chart.yaml `dependencies.version` acepta rangos semver pero Helm solo usa la versión exacta especificada). En Helm 3.7+, `helm dependency update` genera un `Chart.lock` que fija las versiones exactas (similar a package-lock.json), dando builds reproducibles.

**Por qué**: La comunidad de Helm reconoce estas limitaciones. Helm fue diseñado para empaquetar aplicaciones, no para gestión de dependencias complejas (como npm con árbol de dependencias transitivas). Para dependencias de charts, Helm usa un modelo plano: las dependencias se descargan y almacenan en `charts/`. Esto es simple pero no resuelve conflictos. Herramientas como Helmfile, Helmsman, o ArgoCD agregan gestión de releases y dependencies entre charts a nivel de cluster.

---

### 6. [Conectar] ¿Cómo funciona el upgrade de un Helm release con `--wait` y `--atomic`? ¿Qué garantizan estas flags para CI/CD?

**Respuesta**: `--wait` (Helm 3+) espera a que todos los recursos (Pods, Deployments, StatefulSets, PVCs, Services) alcancen el estado Ready (o fallen). Internamente, Helm monitorea el status de cada recurso creado via la API de K8s, esperando a que `status.conditions.Ready == True`. Si algún recurso no alcanza Ready dentro del `--timeout` (default 5 min), Helm falla. `--atomic` hace `--wait` + rollback automático si falla: si el upgrade no completa exitosamente, Helm revierte automáticamente al release anterior. Garantías: 1) `--wait` asegura que el deploy está completo (los Pods están corriendo y ready) antes de que el CI continúe, 2) `--atomic` garantiza que nunca tendrás un release parcialmente desplegado (o se completa, o se revierte). Son esenciales para CI/CD robusto.

**Por qué**: Sin `--wait`, `helm upgrade` retorna éxito apenas los recursos son creados en la API de K8s (que toma milisegundos), pero los Pods pueden estar todavía en `ImagePullBackOff` o `CrashLoopBackOff`. El CI reporta éxito pero el deploy está roto. `--atomic` es el equivalente de `--rollback-on-failure` en Swarm: zero-tolerance para deploys fallidos.

---

### 7. [Conectar] ¿Qué es `helm template` vs `helm install` y por qué `helm template | kubectl apply -f -` es un patrón popular en GitOps (Flux/ArgoCD)?

**Respuesta**: `helm template` renderiza los templates y emite los manifests YAML a stdout, sin instalarlos en el cluster. `helm install` renderiza + instala (crea los recursos en el cluster vía API). El patrón `helm template | kubectl apply -f -` separa el renderizado de la instalación. Ventajas: 1) Compatible con GitOps (ArgoCD/Flux aplican YAML, no ejecutan `helm install`), 2) Los manifests resultantes son objetos estándar de K8s (sin Helm metadata), 3) Los cambios se trackean como diff de YAML en Git. Desventajas: se pierde el release management de Helm (`helm history`, `helm rollback`), y los manifests deben incluir toda la configuración (no hay interactividad de Helm). ArgoCD soporta esto nativamente con su Helm integration (que internamente hace template + apply). Flux soporta `HelmRelease` que usa Helm SDK.

**Por qué**: GitOps (Weaveworks, 2017) promueve que la fuente de verdad sea Git y que el controller (ArgoCD/Flux) reconcilie el cluster con Git. Helm install es un comando imperativo (CI push), no declarativo (cluster pull). El patrón template + apply convierte Helm a declarativo: el YAML renderizado se almacena en Git, y ArgoCD lo aplica. La práctica de versionar templates renderizados es controvertida (YAML generado no es source code), pero es común.

---

### 8. [Cuestionar] ¿Es Helm un "antipatrón" que oculta complejidad o una herramienta necesaria? ¿Cuándo es mejor no usar Helm?

**Respuesta**: Helm es necesario para distribuir aplicaciones complejas como paquetes (si instalás PostgreSQL en K8s, preferís `helm install postgresql bitnami/postgresql` que escribir 15 YAMLs a mano). Es un antipatrón cuando: 1) usás un chart genérico para tu aplicación y no entendés qué recursos crea (caja negra), 2) el chart es tan parametrizado que los values.yaml son un lenguaje de programación ad-hoc, 3) usás Helm para aplicaciones simples que podrías definir con 2-3 YAMLs (overhead innecesario). No usar Helm en favor de YAML plano + Kustomize es mejor cuando: 1) tu aplicación es simple (un Deployment + Service), 2) querés visibilidad total de lo que se despliega, 3) practicás GitOps con Kustomize overlays por entorno.

**Por qué**: El debate "Helm vs Kustomize vs YAML plano" es recurrente. Kelsey Hightower dijo: "Helm is great for distributing software, but not for configuring it." La distinción: Helm para INSTALAR software de terceros (PostgreSQL, Redis, Prometheus). Para tus PROPIAS aplicaciones, YAML plano + Kustomize da más control y transparencia. La tendencia: usar Helm para infraestructura (operators, databases), Kustomize para aplicaciones propias.

---

### 9. [Cuestionar] Helm 3 eliminó Tiller por seguridad, pero ¿introdujo nuevos problemas? ¿Qué limitaciones tiene Helm 3 comparado con Helm 2?

**Respuesta**: Helm 3 eliminó Tiller (componente server-side), lo que resolvió el problema de seguridad (ya no hay un componente con cluster-admin corriendo 24/7). Nuevos problemas/limitaciones: 1) Sin Tiller, múltiples usuarios/CI pueden tener diferentes permisos RBAC (bueno para seguridad, pero antes Tiller unificaba los permisos), 2) El release history ahora se almacena en Secrets en el namespace del release (no en Tiller storage). Cada usuario necesita permisos para listar/crear esos Secrets, 3) La concurrencia: antes Tiller serializaba upgrades (solo uno a la vez por release). Ahora dos upgrades concurrentes pueden causar race conditions (Helm 3.3+ agregó locks usando Secrets), 4) La migración de Helm 2 a 3 requirió `helm 2to3` plugin para migrar releases existentes.

**Por qué**: La eliminación de Tiller fue la decisión de diseño más importante de Helm 3 (Matt Fisher, Bridget Kromhout). Aunque introdujo desafíos de migración y concurrencia, la mejora de seguridad fue masiva: un atacante que comprometiera Tiller en Helm 2 tenía cluster-admin. En Helm 3, el atacante solo tiene los permisos RBAC del usuario/SA. La comunidad aceptó las limitaciones como trade-off necesario.

---

### 10. [Cuestionar] ¿Deberías versionar charts de aplicación junto al código fuente (monorepo) o en repositorios separados? ¿Cuándo usar cada enfoque?

**Respuesta**: Monorepo (chart en `./chart/` dentro del repo de la app): bueno cuando los cambios de chart y código están estrechamente acoplados (ej. nueva variable de entorno requiere nuevo campo en values.yaml), el equipo es pequeño y no hay reutilización de chart entre servicios. Separado (repo de charts): bueno cuando un chart es usado por múltiples servicios (chart estandarizado), hay equipos separados de dev y plataforma, o necesitás versionado independiente del chart (el chart puede tener releases sin releases de la app). La tendencia: monorepo para startups/equipos pequeños (simplicidad), repo separado para organizaciones grandes con platform engineering (gobernanza).

**Por qué**: El patrón "app-of-apps" de ArgoCD y las prácticas de GitOps recomiendan repositorios separados (app source vs deployment config). Pero esto agrega complejidad (coordinar cambios entre repos). Netflix (Spinnaker) y Google (Borg) usan acoplamiento estrecho entre deployment y código. No hay respuesta universal: depende de la estructura del equipo (Conway's Law). La recomendación pragmática: empezar con monorepo, separar cuando el acoplamiento se vuelva un problema.
