---
sidebar_label: "Cuestionario"
---

# Cuestionario M16 — Introducción a Kubernetes

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente un "controller" en Kubernetes y cómo funciona el reconciliation loop? ¿Cómo se diferencia de un operador (Operator pattern)?

**Respuesta**: Un controller en K8s es un componente que implementa un loop de reconciliación: observa el estado actual (via API server watch), lo compara con el estado deseado (la spec del recurso), y toma acciones para minimizar la diferencia. El loop: `for { desired := getDesiredState(); current := getCurrentState(); if current != desired { reconcile(current, desired) } }`. Un Deployment controller asegura que el número de Pods coincida con `spec.replicas`. Un **Operator** (patrón popularizado por CoreOS/Red Hat) es un controller extendido que gestiona el ciclo de vida de una aplicación compleja (ej. etcd, PostgreSQL) usando CRDs (Custom Resource Definitions) y conocimiento operacional embebido en código (backup, failover, upgrade). La diferencia: un controller gestiona recursos nativos de K8s (Deployment, Service). Un operator gestiona un recurso custom (ej. `EtcdCluster`) y contiene lógica específica del dominio.

**Por qué**: El patrón de operator fue descrito en el blog de CoreOS (2016) por Brandon Philips: "An operator is a controller that encodes human operational knowledge in software". El controller pattern de K8s es genérico (Deployment, ReplicaSet, Job). Los operators extienden esto a cualquier aplicación. Ejemplos: Prometheus Operator, cert-manager, CloudNativePG (PostgreSQL), Strimzi (Kafka). Internamente, tanto controllers como operators usan el mismo mecanismo: watch API via informers, enqueue events en un work queue, y reconciliation loop.

---

### 2. [Investigar] ¿Qué es exactamente etcd y cómo garantiza consistencia en un cluster K8s? ¿Qué diferencia hay entre el etcd de K8s y el Raft de Swarm?

**Respuesta**: etcd (CoreOS/Red Hat, proyecto CNCF graduado) es un almacén clave-valor distribuido que usa Raft para consenso. Almacena TODO el estado de K8s: Pods, Services, Deployments, Secrets, nodos, RBAC. Diferencias clave con el Raft de Swarm: 1) etcd es independiente del orquestador (corre como proceso separado, accesible via API gRPC/HTTP). Swarm Raft está embebido en dockerd (no es accesible externamente). 2) etcd soporta watches (subscription a cambios en keys), que K8s usa para que controllers reaccionen a cambios sin polling. Swarm Raft no tiene watches. 3) etcd soporta transacciones (atomic CAS), leases (TTL en keys), y MVCC (versionado). 4) etcd escala a millones de keys, Swarm Raft es para miles de objetos. 5) etcd se despliega como cluster de 3 o 5 nodos (típicamente), tolerando falla de (N/2)-1.

**Por qué**: etcd fue creado por CoreOS en 2013 y donado a CNCF. Usa el algoritmo Raft (misma base teórica que Swarm) pero está optimizado para alto throughput de escritura y lectura consistente con watches. El K8s API Server es el ÚNICO componente que escribe en etcd (todos los demás leen via API server cache). La consistencia de etcd es "strong consistency" (lecturas pasan por Raft leader por defecto, aunque hay lecturas stale desde followers con serializable). Swarm Raft es similar pero menos optimizado para volumen.

---

### 3. [Investigar] ¿Qué es exactamente k3s y cómo difiere de K8s vanilla? ¿Cuándo es preferible a K8s completo y cuándo NO?

**Respuesta**: k3s (Rancher/SUSE, 2019) es una distribución de Kubernetes empaquetada en un solo binario (~100 MB, vs 1+ GB de K8s vanilla). Diferencias: 1) Elimina cloud providers legacy y alpha features, 2) Usa SQLite por defecto en lugar de etcd (o etcd embebido con kine), 3) Incluye containerd como runtime, Flannel como CNI, CoreDNS, Traefik como Ingress Controller, y local-path-provisioner como CSI — todo en el mismo binario, 4) Empaquetado para edge/IoT/ARM, 5) Instalación: `curl -sfL https://get.k3s.io | sh` (un comando). Es preferible para: edge computing, IoT, CI/CD (kind es mejor para CI), desarrollo local, y pequeñas instalaciones donde etcd es overkill. NO es preferible para producción de gran escala (>500 nodos) porque SQLite no escala como etcd, aunque k3s puede configurarse con etcd externo para alta disponibilidad.

**Por qué**: k3s fue creado por Darren Shepherd (Rancher) para entornos con recursos limitados. La reducción de tamaño es impresionante: el binario incluye kube-apiserver, kube-controller-manager, kube-scheduler, kubelet, containerd, runc, y los addons mencionados. Para HA, k3s soporta etcd externo o embedded etcd con `--cluster-init`. k3s es el runtime de K8s más popular para edge/IoT (usado por AWS EKS Anywhere, SUSE Edge). Para CI/CD, kind es preferido (más rápido para clusters efímeros).

---

### 4. [Investigar] ¿Qué son exactamente los "Custom Resource Definitions" (CRDs) y cómo extendieron el ecosistema de Kubernetes? Mencioná 5 CRDs populares y qué problema resuelven.

**Respuesta**: CRDs permiten definir tipos de recursos personalizados y sus esquemas, extendiendo la API de K8s sin modificar el código de K8s. Cuando creás un CRD, el API Server automáticamente expone endpoints REST para ese nuevo tipo (CRUD + watch). Los controllers (operators) consumen esos recursos. CRDs populares: 1) `Certificate` (cert-manager) — emite y renueva certificados TLS via ACME (Let's Encrypt), 2) `PrometheusRule` (Prometheus Operator) — define reglas de alerta declarativamente, 3) `VirtualServer` (nginx-ingress) — define enrutamiento HTTP avanzado más allá del Ingress nativo, 4) `ServiceMonitor` (Prometheus Operator) — descubre endpoints de métricas automáticamente, 5) `PostgresCluster` (CloudNativePG) — declara un cluster PostgreSQL completo con replicación, backup, y monitoreo.

**Por qué**: CRDs fueron la innovación que transformó K8s de un orquestador a una plataforma extensible. Antes de CRDs, extender K8s requería usar ThirdPartyResources (deprecado) o API aggregation. CRDs (K8s 1.7, GA en 1.16) son nativos y soportan: validation schemas (OpenAPI v3), subresources (status/scale), versioning, y conversion webhooks. El ecosistema de operators explotó después de CRDs: OperatorHub.io lista 300+ operators. CRDs son la base de GitOps (Flux/ArgoCD), service mesh (Istio), y auto-scaling (KEDA).

---

### 5. [Conectar] La clase muestra YAML de Deployment. ¿Cómo se relacionan Deployment, ReplicaSet, y Pod en una cascada de ownership? ¿Qué pasa si borrás manualmente un Pod gestionado por un Deployment?

**Respuesta**: La cascada de ownership: Deployment → ReplicaSet → Pod. El Deployment es propietario del ReplicaSet, el ReplicaSet es propietario de los Pods (via `metadata.ownerReferences`). Cada objeto tiene una reference al padre. Si borrás un Pod: el ReplicaSet detecta que faltan réplicas (el estado actual < estado deseado) y CREA UNO NUEVO automáticamente. Esto es el controller loop en acción. Si borrás el ReplicaSet: el Deployment detecta que su ReplicaSet desapareció y CREA UNO NUEVO (que a su vez crea nuevos Pods). Si borrás el Deployment: los Pods y ReplicaSets son garbage-collected (eliminados en cascada) porque tienen ownerReferences. La garbage collection de K8s usa "owner references" y puede ser foreground (elimina dependientes antes del owner) o background (elimina owner primero, dependientes en paralelo).

**Por qué**: El mecanismo de ownerReferences es parte del API de K8s (cada objeto metadata tiene `ownerReferences` array). Esto es diferente de Docker, donde no hay cascada de ownership (borrar un contenedor no afecta otros recursos). K8s garbage collector es un controller que periódicamente busca objetos sin owner (o con owner eliminado) y los elimina. La cascada asegura que un `kubectl delete deployment` limpie todo. También previene objetos huérfanos que consumen recursos sin ser gestionados.

---

### 6. [Conectar] ¿Cómo funciona exactamente `kubectl apply` vs `kubectl create` en términos de reconciliación? ¿Qué es el annotation `last-applied-configuration`?

**Respuesta**: `kubectl create` es imperativo: crea el recurso tal como lo especificaste. Si el recurso ya existe, FALLA. `kubectl apply` es declarativo: si el recurso no existe, lo crea. Si existe, calcula un diff entre la spec actual y la deseada, y aplica un PATCH. Para calcular el diff, `apply` usa el annotation `kubectl.kubernetes.io/last-applied-configuration` (un JSON de la spec que se aplicó la última vez con `apply`). El diff se calcula como: `current spec - fields managed by other tools (field managers) + last-applied-configuration` vs `new spec`. Esto permite que `apply` preserve campos modificados por otros controladores (ej. el HPA modificó `replicas`, `apply` no lo sobrescribe). Sin `last-applied-configuration`, `apply` no sabría qué campos fueron modificados por humanos vs por el sistema.

**Por qué**: El annotation fue introducido en K8s 1.5 para habilitar apply declarativo. Cada vez que ejecutás `kubectl apply`, kubectl actualiza este annotation. Esto es diferente de `kubectl replace` (que reemplaza todo el recurso) o `kubectl edit` (que modifica el recurso directamente sin annotation). Para GitOps (ArgoCD/Flux), se usa `kubectl apply` porque es idempotente y preservativo.

---

### 7. [Conectar] ¿Cómo funciona el Horizontal Pod Autoscaler (HPA) a nivel interno? ¿Qué papel juega el Metrics Server y cómo se calcula el número deseado de réplicas?

**Respuesta**: El HPA controller (parte del controller-manager) ejecuta un loop cada 15 segundos: 1) consulta el Metrics Server (API `/apis/metrics.k8s.io`) para obtener el uso de CPU/memoria de los Pods del target, 2) calcula el ratio: `usageRatio = currentMetricValue / targetMetricValue` (ej. CPU actual 80% / target 50% = 1.6), 3) calcula réplicas deseadas: `desiredReplicas = ceil[currentReplicas * usageRatio]`, 4) si `desiredReplicas > spec.replicas`, escala UP; si es menor, escala DOWN (con cooldown: 5 min downscale, 15s upscale), 5) actualiza el Deployment/ReplicaSet con el nuevo `spec.replicas`. El Metrics Server agrega métricas de todos los kubelets (cAdvisor) y las expone via Metrics API. Sin Metrics Server instalado, el HPA no puede obtener métricas de recursos.

**Por qué**: El algoritmo de HPA está documentado en el K8s source code (pkg/controller/podautoscaler). Las métricas pueden ser: Resource (CPU/memoria via Metrics API), Custom (via Custom Metrics API, ej. Prometheus Adapter), External (via External Metrics API, ej. mensajes en SQS). El cooldown evita thrashing: si la carga oscila rápidamente, el HPA no escala arriba/abajo constantemente. El tolerance (default 10%): si usageRatio está entre 0.9 y 1.1, no escala.

---

### 8. [Cuestionar] "Kubernetes es el nuevo J2EE" (Kelsey Hightower). ¿Es una crítica válida en 2025? ¿Ha mejorado la complejidad de K8s o se ha vuelto peor?

**Respuesta**: La crítica de Hightower (2017) era que K8s y su ecosistema estaban replicando el patrón de J2EE: capas de abstracción sobre abstracción, complejidad innecesaria para el 80% de los casos, y una curva de aprendizaje empinada. En 2025, la crítica sigue siendo válida en parte: el ecosistema creció (operators, CRDs, service mesh, GitOps, admission webhooks), y la complejidad para administrar K8s es alta. PERO la industria respondió con: 1) Managed K8s services (EKS, AKS, GKE Autopilot) que abstraen el control plane, 2) Platform engineering (Backstage, Crossplane) que construye una capa de abstracción sobre K8s para desarrolladores, y 3) Herramientas como `kubectx`/`kubens`, `k9s`, `Lens` que simplifican la interacción. K8s es más complejo que Swarm o Compose, pero manejable con las herramientas correctas.

**Por qué**: Hightower actualizó su postura en 2023: "Kubernetes is a platform for building platforms". La complejidad de K8s es real pero manejable si no expones la API cruda de K8s a los desarrolladores. El movimiento de Platform Engineering (Team Topologies, libro de Matthew Skelton y Manuel Pais) propone que un equipo de plataforma construya un "PaaS interno" sobre K8s, y los desarrolladores interactúen con una interfaz simplificada (como `git push` para deployar). Esto es análogo a cómo J2EE evolucionó a Spring Boot (simplificación de la capa de aplicación).

---

### 9. [Cuestionar] ¿Debe un equipo nuevo empezar con Kubernetes o con un PaaS (Heroku, Fly.io, Railway) y migrar cuando sea necesario?

**Respuesta**: Para MVPs y startups early-stage, un PaaS (Heroku, Fly.io, Railway, Render) o Docker Compose en un VPS es la mejor opción: permite iterar rápido sin overhead de infraestructura. El momento de migrar a K8s es cuando: 1) necesitás features que el PaaS no ofrece (GPUs, networking avanzado, operadores de BD), 2) el costo del PaaS supera el costo de K8s + operaciones (para tráfico grande, PaaS es caro), 3) tenés requisitos de compliance que requieren control sobre la infraestructura, 4) tu equipo creció y tenés una persona dedicada a infraestructura. La migración anticipada a K8s (antes de necesitarlo) es "premature optimization" — pagás el costo de complejidad operativa sin el beneficio. La migración tardía (cuando ya tenés 20 servicios en PaaS) es más dolorosa pero te asegura que K8s era necesario.

**Por qué**: La comunidad de startups (Y Combinator forums, Hacker News) debate esto frecuentemente. Empresas como GitLab, Shopify, y GitHub migraron a K8s cuando su escala lo justificó, no desde el día 1. La filosofía "start simple, migrate when needed" es respaldada por 37signals (Basecamp) y por los autores de "The Pragmatic Programmer". La contrapartida: si sabés que tu empresa apunta a escala masiva desde el inicio (y tenés el equipo para manejarlo), empezar con K8s puede ahorrar una migración futura.

---

### 10. [Cuestionar] ¿Es `kind` un reemplazo válido de Minikube para desarrollo local o hay casos donde Minikube sigue siendo necesario?

**Respuesta**: kind es mejor para CI/CD (rápido, funciona en Docker, configuración declarativa) y para equipos que ya usan Docker como entorno base. Minikube es mejor para: 1) desarrollo local con múltiples versiones de K8s (addons, diferentes drivers), 2) simulación de features de nodo (GPU, diferentes OS), 3) cuando no tenés Docker (Minikube puede usar VM directa con VirtualBox/Hyper-V), 4) entornos educativos (Minikube dashboard, addons). Para el 80% de los desarrolladores, kind es suficiente y más rápido. Para entornos de testing de features específicas del nodo (CSI drivers, GPU), Minikube es necesario.

**Por qué**: kind (Kubernetes IN Docker) fue creado por el equipo de K8s SIG-Testing para CI/CD. Minikube es mantenido por la comunidad de K8s con foco en desarrollo local. Ambos son proyectos open-source de la CNCF. La diferencia práctica: kind levanta un cluster en ~30s (nodos como contenedores Docker), Minikube con VM tarda ~2 min. kind soporta múltiples nodos (configurables en YAML), Minikube también. Para desarrollo diario: kind. Para workshops/educación: Minikube (más user-friendly, UI dashboard).
