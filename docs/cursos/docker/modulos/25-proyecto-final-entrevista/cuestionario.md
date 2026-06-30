---
sidebar_label: "Cuestionario"
---

# Cuestionario M25 — Proyecto Final y Simulación de Entrevista

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] En una entrevista de sistema design para microservicios con Docker, te preguntan: "¿Cómo diseñarías la estrategia de versionado de APIs en un entorno de contenedores con zero-downtime deployments?" Describí el enfoque.

**Respuesta**: Estrategia: 1) **API versioning en URL**: `/api/v1/users`, `/api/v2/users`. Esto permite que múltiples versiones coexistan en el mismo cluster. 2) **Routing por versión**: en Kubernetes, Ingress Controller (o Gateway API) enruta `/api/v1/*` al Service `users-v1` y `/api/v2/*` al Service `users-v2`. 3) **Zero-downtime deploy de nueva versión**: desplegar el nuevo Deployment `users-v2` (con healthcheck), verificar que los Pods están healthy, actualizar Ingress para enrutar tráfico a la nueva versión (puede ser gradual: 10% canary → 50% → 100%), verificar métricas (error rate, latencia), y finalmente eliminar `users-v1` cuando ya no recibe tráfico. 4) **Deprecación**: la versión vieja se mantiene por un período de deprecación (ej. 3 meses) documentado en los headers de respuesta (`Deprecation: true`, `Sunset: <date>`). 5) **Compatibilidad hacia atrás: cuando sea posible (cambios aditivos), usar content negotiation (header `Accept: application/vnd.api.v2+json`) en lugar de URL, evitando bifurcación de endpoints.

**Por qué**: Stripe API es el gold standard de versionado de APIs (URL-based + headers de deprecación). Phil Sturgeon (autor de "Build APIs You Won't Hate") y la comunidad de API design (apisyouwonthate.com) recomiendan URL versioning para simplicidad. En K8s, esto se implementa con Ingress/Gateway API + Services separados por versión. Canary despliegue se hace con Istio VirtualService (weight-based routing) o con Gateway API HTTPRoute.

---

### 2. [Investigar] En un incidente de producción, un contenedor se reinicia constantemente (CrashLoopBackOff en K8s). Describí tu metodología de troubleshooting desde que recibís la alerta hasta que identificás la causa raíz.

**Respuesta**: Metodología sistemática: 1) **Verificar el estado**: `kubectl describe pod <name>` → ver `Exit Code` (1 = error app, 137 = SIGKILL/OOM, 139 = segfault), `OOMKilled: True/False`, `Events` (posible `Liveness probe failed`). 2) **Logs**: `kubectl logs <pod> --previous` (captura logs del intento anterior, incluso si el contenedor ya se reinició). Buscar stack traces, errores de conexión, excepciones. 3) **Recursos**: `kubectl top pod <name>` — ¿el pod estaba usando más memoria de la asignada? `kubectl describe node` — ¿el nodo está bajo presión de memoria/CPU/disco? 4) **Startup**: si el pod ni siquiera arranca (ImagePullBackOff, ErrImagePull), verificar: credenciales de registry (ImagePullSecrets), tag/digest de la imagen existe, conectividad de red. 5) **Dependencias**: si la app necesita BD, ¿está accesible desde el namespace del Pod? Probar con `kubectl run debug --rm -it --image nicolaka/netshoot -- curl http://db-service:5432`. 6) **Configuración**: ¿ConfigMap/Secret montado correctamente? ¿Variables de entorno faltantes? 7) **Versión**: ¿se desplegó una nueva versión recientemente? `kubectl rollout history deployment/<name>`. Si es un rolling update fallido, `kubectl rollout undo`. 8) **Health check**: ¿la liveness probe está mal configurada (demasiado agresiva, matando el pod durante startup)? Ajustar `initialDelaySeconds` o `failureThreshold`.

**Por qué**: La metodología sigue el libro "Site Reliability Engineering" (Google) y las prácticas de troubleshooting de K8s de Brendan Gregg (USE Method: Utilization, Saturation, Errors). El orden es: verificar lo obvio (estado, logs) → recursos → dependencias → configuración → versión. La herramienta `kubectl debug` (ephemeral containers, K8s 1.25+) es invaluable para troubleshooting de Pods sin shell (Distroless).

---

### 3. [Investigar] ¿Qué es exactamente un "SRE Interview" para posiciones de DevOps/Docker? ¿Qué tipo de preguntas de sistema design, troubleshooting, y cultura se hacen en empresas como Google, Netflix, y startups?

**Respuesta**: Entrevistas SRE/DevOps típicamente cubren: 1) **Troubleshooting**: "Un usuario reporta latencia alta. ¿Cómo investigás?" — esperan metodología sistemática (métricas → logs → traces → narrow down) y conocimiento de herramientas (Prometheus, Grafana, Jaeger). 2) **System Design**: "Diseñá un sistema de CI/CD para 50 microservicios" — esperan conocimiento de Docker, K8s, GitOps, monitoreo, y trade-offs. 3) **Coding/Scripting**: "Escribí un script que haga healthcheck y rolling restart de contenedores unhealthy" — esperan conocimiento de Docker API/K8s API y Bash/Python/Go. 4) **Behavioral**: "Contame de un incidente que hayas gestionado" — usan formato STAR (Situation, Task, Action, Result). 5) **Culture/Process**: "¿Cómo balanceás velocidad de deploys vs estabilidad?" — esperan conocimiento de SLOs, error budgets, y blameless postmortems.

**Por qué**: Libros como "The SRE Workbook" (Google), "Seeking SRE" (David Blank-Edelman), y "The DevOps Handbook" (Gene Kim) documentan el perfil de SRE. Las preguntas de diseño de CI/CD en entrevistas de Google típicamente evalúan: ¿entendés el ciclo completo? (build → test → scan → sign → deploy → monitor → rollback). Netflix pregunta "¿Cómo diseñarías un sistema que nunca baja?" (Chaos Engineering, redundancy, auto-scaling).

---

### 4. [Investigar] ¿Qué es "Capacity Planning" en el contexto de Docker/K8s y cómo se relaciona con el auto-scaling? ¿Cómo predecir cuántos recursos necesitará un servicio antes de lanzarlo?

**Respuesta**: Capacity planning es estimar recursos necesarios (CPU, memoria, nodos) para un servicio bajo carga esperada. Enfoques: 1) **Load testing**: ejecutar pruebas de carga con herramientas como k6, vegeta, o Locust, midiendo CPU/memoria por request y extrapolando al tráfico esperado. 2) **Vertical scaling test**: aumentar recursos (CPU/memoria) hasta que la latencia se estabilice (encontrar el "sweet spot" de CPU por réplica). 3) **Horizontal scaling test**: aumentar réplicas y medir throughput máximo (cuántos requests/s puede manejar el sistema). 4) **Nodel capacity**: calcular cuántos Pods caben en cada tipo de nodo (basado en requests, no limits). 5) **Headroom**: agregar 30-50% de margen para picos y crecimiento. 6) **Auto-scaling**: configurar HPA para manejar picos imprevistos (basado en CPU/memoria y métricas custom). Capacidad planning no es solo "antes del lanzamiento" — es continuo: monitorear tendencias de uso (Prometheus recording rules, predicciones con Prophet/forecasting).

**Por qué**: El libro "The Art of Capacity Planning" (John Allspaw, ex-Etsy) y "Cloud Native Infrastructure" (Justin Garrison, Kris Nova) cubren capacity planning para cloud-native. Herramientas como KubeCost y Goldilocks (Fairwinds) analizan VPA recommendations y uso real para recomendar requests/limits. La práctica: empezar con requests generosos, reducir basado en uso real (rightsizing).

---

### 5. [Conectar] La clase menciona el proyecto final con microservicios. ¿Cómo implementarías observabilidad unificada (métricas + logs + traces) en ese proyecto usando Prometheus + Loki + Tempo o Grafana Stack?

**Respuesta**: Stack LGTM (Loki, Grafana, Tempo, Mimir/Prometheus): 1) **Métricas**: Prometheus (o Grafana Mimir para long-term storage) scrapea métricas de cAdvisor (infraestructura) y de aplicaciones (exponiendo `/metrics` con librerías OpenTelemetry o clientes Prometheus). Dashboards en Grafana: 193 (Docker), 14282 (cAdvisor), y dashboards custom por servicio. Alertas: CPU >90%, OOM events, error rate >1%. 2) **Logs**: Promtail (agente) recolecta logs de contenedores (Docker json-file o journald) y los envía a Loki. Logs incluyen trace IDs (inyectados por OpenTelemetry) para correlación. Dashboards en Grafana: búsqueda por trace ID, por servicio, por nivel de log. 3) **Traces**: OpenTelemetry SDK en cada microservicio (auto-instrumentación: Java agent, Node.js auto-instrumentation, Python instrumentation). Los spans se envían al OTel Collector (sidecar o daemon), que exporta a Grafana Tempo. Visualización en Grafana: waterfall de requests entre servicios, latencia por span, correlación con logs y métricas. 4) **Single pane of glass**: Grafana unifica métricas (Prometheus data source), logs (Loki data source), traces (Tempo data source), y permite saltar entre ellos (ej. de un pico de latencia en Prometheus → click → ver traces de ese período → click en un span → ver logs del Pod en ese momento).

**Por qué**: La combinación "Mimir + Loki + Tempo + Grafana" (de Grafana Labs) es un stack open-source completo. La clave es la correlación: trace ID en logs (via MDC/context en la app), exemplars en métricas (trace ID asociado a un punto en un gráfico de Prometheus). La documentación de OpenTelemetry y Grafana Labs detalla esta integración. Para el proyecto final, implementar al menos métricas + logs + healthchecks es alcanzable; traces agrega el siguiente nivel de sofisticación.

---

### 6. [Conectar] ¿Cómo asegurarías que el proyecto final cumpla con prácticas de "Supply Chain Security" (SLSA L2/L3)? ¿Qué herramientas usarías y dónde en el pipeline?

**Respuesta**: Para alcanzar SLSA L3 en el proyecto capstone: 1) **Provenance generation**: en CI/CD, después del build, generar provenance (metadata que prueba cómo y de qué fuente se construyó la imagen) usando `SLSA GitHub Generator` o Cosign attest. 2) **SBOM generation**: generar SBOM con Syft/Trivy y adjuntarlo a la imagen (Cosign attach). 3) **Vulnerability scan**: Trivy scan con `--exit-code 1 --severity CRITICAL,HIGH` para fallar el pipeline si hay vulnerabilidades. 4) **Sign**: firmar la imagen con Cosign (keyless signing con OIDC del CI). 5) **Verify**: antes de desplegar en K8s, admission controller (Kyverno o Conaisseur) verifica que la firma sea válida (rechazando imágenes no firmadas). 6) **Policy**: políticas de seguridad de imágenes (solo imágenes de registry aprobado, solo firmadas, solo sin CRITICAL CVEs) implementadas con Kyverno o OPA Gatekeeper. Para SLSA L3 (más estricto), el build debe ser "isolated" y "parameterless", y correr en un entorno de build confiable (GitHub Actions con reusable workflows).

**Por qué**: SLSA (Supply-chain Levels for Software Artifacts) es un framework de seguridad de Google. Para el proyecto final demo, SLSA L2 es alcanzable (provenance + SBOM + firma). Herramientas open-source que implementan esto: Syft, Trivy, Cosign, SLSA GitHub Generator, Kyverno. La verificación en deploy (admission controller) cierra el loop de seguridad: si alguien intenta desplegar una imagen no firmada, es rechazada.

---

### 7. [Conectar] ¿Cómo diseñarías la estrategia de "backup y disaster recovery" para los volúmenes de datos del proyecto final (PostgreSQL, MongoDB) en un entorno Docker/K8s?

**Respuesta**: Estrategia de backup y DR: 1) **Backup lógico** para PostgreSQL: cronjob que ejecuta `pg_dump` o `pg_dumpall` y sube el dump a S3/GCS comprimido y cifrado. Frecuencia: diario. 2) **Backup físico** con WAL archiving: para point-in-time recovery (PITR). Configurar `archive_command` en PostgreSQL para enviar WALs a S3 contínuamente. Usar `pgBackRest` o `WAL-G` que automatizan esto y soportan backup incremental. 3) **Backup de MongoDB**: `mongodump` o snapshots del filesystem si MongoDB está configurado con journaling y WiredTiger. 4) **Automated backup operator**: en K8s, usar CloudNativePG (PostgreSQL operator) que incluye backup scheduling automático con S3 destination y PITR. 5) **Backup de volúmenes**: CSI snapshotting (crea snapshot del PV en el storage provider) + backup del snapshot a otra región. 6) **Disaster Recovery**: backups replicados a otra región (S3 cross-region replication). Documentar RTO (Recovery Time Objective: ¿en cuánto tiempo puedo restaurar?) y RPO (Recovery Point Objective: ¿cuántos datos puedo perder?). Probar restauración periódicamente (una vez por trimestre) en un entorno DR aislado.

**Por qué**: La documentación de PostgreSQL (backup chapter) y la guía de Disaster Recovery de AWS/GCP enfatizan que backup sin tests de restauración NO es backup. CloudNativePG (open-source, CNCF Sandbox) implementa backup management declarativo desde K8s: `backup.schedule: "0 2 * * *"` y `backup.retentionPolicy: "30d"`.

---

### 8. [Cuestionar] En una entrevista técnica, ¿es mejor demostrar expertise profundo en Docker o conocimiento amplio del ecosistema cloud-native (K8s, CI/CD, observabilidad)? ¿Qué valoran más los empleadores?

**Respuesta**: Los empleadores valoran ambas, pero la expectativa varía por seniority: 1) **Junior/Entry-level**: expertise sólido en Docker (Dockerfiles, Compose, depuración) + conceptos básicos de K8s (Deployment, Service, ConfigMap). 2) **Mid-level**: Docker + K8s (Helm, operators, troubleshooting) + CI/CD (pipeline design, GitOps) + observabilidad básica (Prometheus, Grafana). 3) **Senior/Lead**: profundidad en varios: arquitectura de microservicios, sistema design, incident response, capacity planning, supply chain security. Un senior no necesita saber TODO, pero debe demostrar capacidad de aprender y adaptarse. La tendencia actual (2025): las empresas valoran más la amplitud (T-shaped skills: profundo en 1-2 áreas, amplio en el resto) que la hiper-especialización en una sola herramienta. Docker solo ya no es suficiente (es commodity), pero sin Docker no podés operar en ningún lado.

**Por qué**: Encuestas de contratación (Stack Overflow 2024, CNCF 2024) muestran que Docker + K8s + CI/CD es la combinación más demandada. El libro "The Staff Engineer's Path" (Tanya Reilly) argumenta que en niveles senior, el conocimiento de cómo diseñar sistemas y resolver problemas ambiguos pesa más que tool-specific knowledge. Para una entrevista, proyectar "sé Docker profundamente Y puedo navegar el ecosistema cloud-native" es la combinación ganadora.

---

### 9. [Cuestionar] En el proyecto final te piden 60 preguntas de entrevista. ¿Qué categorías son las más importantes para evaluar competencia real en Docker? ¿Son las preguntas de trivia (comandos, flags) o las de resolución de problemas más efectivas?

**Respuesta**: Las preguntas de resolución de problemas (troubleshooting, diseño) son mucho más efectivas que trivia porque evalúan comprensión profunda, no memorización. Trivia (`¿cuál es el flag para --restart?`) evalúa si leíste la documentación, no si podés debuggear un contenedor en producción. Preguntas efectivas: 1) "Tu contenedor está en CrashLoopBackOff. Describí paso a paso cómo diagnosticás." 2) "Diseñá un Dockerfile para una app Java que minimice tamaño y tiempo de build." 3) "¿Cómo migrarías una app de Docker Compose a Kubernetes sin downtime?" 4) "Un cliente reporta que tu API está lenta. ¿Qué métricas mirás, en qué orden, y cómo narrow down el problema?" Para un cuestionario de 60 preguntas, la distribución ideal: 40% troubleshooting, 30% diseño/arquitectura, 20% mejores prácticas, 10% comandos básicos indispensables (como sanity check). Las preguntas de trivia sobre flags oscuros (`¿cuál es el puerto por defecto de Swarm gossip?`) tienen poco valor predictivo de competencia real.

**Por qué**: La investigación en hiring técnico (Google re:Work, "Building a Great Technical Interview") muestra que las preguntas de sistema design y troubleshooting correlacionan más con desempeño en el trabajo que las de trivia. Las preguntas de este cuestionario justamente evitan el formato trivia en favor de "investigar", "conectar", y "cuestionar", alineadas con los niveles cognitivos de Bloom (análisis, evaluación, creación) en lugar de recordar.

---

### 10. [Cuestionar] ¿Es un "proyecto capstone" con múltiples microservicios (Spring, Node, Python, Kafka, MongoDB, PostgreSQL) una representación realista de lo que un ingeniero Docker enfrenta en la industria, o es demasiado complejo/irreal?

**Respuesta**: Es realista en complejidad pero irreal en que una persona individual maneje 5 microservicios en 5 lenguajes diferentes con 3 bases de datos y Kafka. En la industria: 1) Los equipos suelen ser especializados por lenguaje (un equipo maneja 1-2 microservicios en 1-2 lenguajes), no un solo ingeniero manejando Spring + Node + Python. 2) La diversidad de stacks (Spring Boot + Node.js + Python + Kafka + MongoDB + Postgres) es más típica de una empresa grande con múltiples equipos que de un proyecto individual. 3) La complejidad operativa de gestionar Kafka + MongoDB + PostgreSQL en Docker Compose es alta y propensa a errores. Sin embargo, como ejercicio de aprendizaje, el proyecto capstone es valioso porque: expone al estudiante a diferentes patrones de Dockerfiles (Java multi-stage vs Node slim vs Python), diferentes tipos de persistencia (SQL vs NoSQL), mensajería async (Kafka), y la integración de todo con Compose/K8s. En la vida real, un ingeniero Docker típicamente trabaja con 1-3 stacks, no 5, pero entender las diferencias es valioso.

**Por qué**: La crítica constructiva al proyecto capstone: en lugar de 5 microservicios en 5 lenguajes, 3 microservicios en 2 lenguajes (ej. Spring Boot + Node.js) con 1 BD SQL y 1 cache (Redis) es más realista y permite más profundidad que amplitud. La comunidad de educación en DevOps (Kelsey Hightower, Bridget Kromhout) aboga por profundidad sobre amplitud en proyectos de aprendizaje.
