---
sidebar_label: "Cuestionario"
---

# Cuestionario M14 — Logs, Monitoreo y Healthchecks

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente OpenTelemetry y cómo se relaciona con el monitoreo de contenedores Docker? ¿Qué diferencia hay entre tracing, metrics, y logs en el modelo de observabilidad?

**Respuesta**: OpenTelemetry (OTel) es un proyecto CNCF que estandariza la generación, recolección, y exportación de telemetría (traces, metrics, logs) desde aplicaciones. En Docker: OTel Collector puede desplegarse como sidecar o daemon que recolecta datos de contenedores (via receivers como `hostmetrics`, `docker_stats`) y los exporta a backends (Prometheus, Jaeger, Grafana, Datadog). El modelo de observabilidad distingue tres señales complementarias: 1) **Metrics**: datos numéricos agregados en el tiempo (CPU, requests/s, latencia promedio) — responden "¿cuánto?". 2) **Logs**: eventos discretos con timestamp y contexto (error, warning, info) — responden "¿qué pasó?". 3) **Traces**: seguimiento de una request a través de múltiples servicios (waterfall de spans) — responden "¿dónde está el bottleneck?". OTel unifica estas tres señales con correlación (trace ID en logs, exemplars en métricas) para navegar entre ellas.

**Por qué**: OpenTelemetry surgió de la fusión de OpenTracing y OpenCensus (2019) y es hoy el estándar de facto para instrumentación cloud-native. Para Docker, OTel Collector puede recolectar: host metrics (CPU, memoria, disco), Docker stats (via docker receiver), y logs (via filelog receiver). La integración con Prometheus permite que métricas de negocio (requests por endpoint) se correlacionen con métricas de infraestructura (CPU del contenedor). El stack de observabilidad moderno: OTel Collector → Prometheus (metrics) + Tempo/Jaeger (traces) + Loki (logs) → Grafana (visualización unificada).

---

### 2. [Investigar] ¿Qué es Grafana Loki y por qué fue diseñado específicamente para logs de contenedores? ¿En qué se diferencia de Elasticsearch?

**Respuesta**: Loki (Grafana Labs, 2018, proyecto CNCF graduado) es un sistema de agregación de logs diseñado para Kubernetes/Docker que indexa SOLO metadata (labels como `container_name`, `namespace`, `pod`) y NO el contenido del log. El contenido se almacena comprimido en chunks (object store: S3, GCS, filesystem). La búsqueda se hace "grep-like" sobre los chunks, usando los labels para reducir el espacio de búsqueda. A diferencia de Elasticsearch (que indexa el texto completo, consumiendo ~2x el tamaño de los logs en disco para el índice), Loki es mucho más eficiente en almacenamiento (~10-20x menos espacio que Elasticsearch para los mismos logs) y usa object storage barato. La desventaja: búsquedas full-text son más lentas (porque no hay índice invertido). Para logs de contenedores, donde el 90% de las consultas son "mostrame logs de este pod en este rango de tiempo", Loki es ideal.

**Por qué**: Loki fue creado por Tom Wilkie (Grafana Labs, ex-Prometheus) inspirado en Prometheus (que usa labels y no indexa métricas). La arquitectura: Promtail (agente) recolecta logs de archivos o journald, los etiqueta con Kubernetes metadata, y los envía a Loki. Loki los almacena en object storage. La integración con Grafana permite visualizar logs junto a métricas y traces. Elasticsearch sigue siendo mejor para búsquedas full-text complejas y para equipos que ya tienen Elasticsearch cluster. Para equipos que empiezan con observabilidad, Loki + Grafana es más simple y barato.

---

### 3. [Investigar] ¿Cómo funciona exactamente el HEALTHCHECK de Docker a nivel interno? ¿Qué pasa cuando un contenedor se vuelve `unhealthy`?

**Respuesta**: Docker ejecuta el comando HEALTHCHECK periódicamente (según `--interval`, default 30s) dentro del contenedor (como si hicieras `docker exec` del comando). El comando debe retornar exit code 0 (healthy) o != 0 (unhealthy). Parámetros: 1) `--start-period` (default 0s): tiempo de gracia sin evaluar healthchecks (para que la app inicialice), 2) `--retries` (default 3): número de fallos consecutivos para marcar unhealthy, 3) `--timeout` (default 30s): tiempo máximo de ejecución del comando. Cuando un contenedor se vuelve `unhealthy`: 1) el estado se refleja en `docker ps` (STATUS muestra `(unhealthy)`), 2) Docker NO reinicia el contenedor automáticamente (solo la restart policy puede reiniciarlo si el proceso principal muere, pero healthy/unhealthy NO mata el proceso), 3) en Swarm, un servicio con healthcheck reinicia réplicas unhealthy automáticamente (según restart policy del servicio), 4) en Compose, `condition: service_healthy` espera que el servicio esté healthy.

**Por qué**: La implementación en Docker (daemon/health.go) muestra que el healthcheck se ejecuta como un proceso hijo del monitor de salud del daemon. El comando de healthcheck debe ser liviano (ej. `curl -f http://localhost/health`). Docker ejecuta un solo healthcheck a la vez (no concurrente). Si el comando tarda más que `--timeout`, se considera fallo. El estado `starting` se muestra durante `--start-period`, incluso si el healthcheck falla. Esto es crítico para apps que tardan en arrancar (PostgreSQL puede tardar 20s). Sin `--start-period` adecuado, el healthcheck puede marcar unhealthy durante el arranque normal.

---

### 4. [Investigar] ¿Qué es el "metrics server" en Kubernetes y cómo se diferencia de cAdvisor? ¿Por qué K8s no usa cAdvisor directamente para el HPA?

**Respuesta**: cAdvisor es un agente por nodo que recolecta métricas de todos los contenedores. Kubelet lo integra internamente (cAdvisor corre como parte del kubelet). El Metrics Server (K8s SIG-Instrumentation) es un agregador que recolecta métricas de todos los kubelets del cluster y las expone a través de la Metrics API. La diferencia: 1) cAdvisor proporciona métricas detalladas y crudas por contenedor (CPU, memoria, disco, red, PSI, cgroups). 2) Metrics Server solo provee CPU y memoria por Pod (métricas agregadas y limitadas). 3) El HPA (Horizontal Pod Autoscaler) consulta el Metrics Server, no cAdvisor directamente, porque Metrics Server implementa la Metrics API (estándar de K8s) y ofrece las métricas a nivel de Pod (que es lo que el HPA necesita). Para métricas detalladas (disco, red, PSI), Prometheus + cAdvisor sigue siendo necesario.

**Por qué**: El diseño de K8s separa "recolección cruda" (cAdvisor/kubelet) de "agregación para scheduling" (Metrics Server). El Metrics Server es ligero (solo CPU/memoria, almacenamiento en memoria, sin persistencia). Para métricas custom (requests/s, latencia) el HPA usa el Custom Metrics API (implementado por Prometheus Adapter o KEDA). La razón de no usar cAdvisor directo es: cAdvisor expone métricas crudas con alta cardinalidad (por contenedor, por capa de filesystem), que son demasiado granulares para el HPA. El Metrics Server agrega por Pod (lo que el HPA necesita) y es eficiente.

---

### 5. [Conectar] La clase muestra `docker logs`. ¿Cómo se implementa un pipeline de logs para producción usando Fluentd como logging driver vs Fluent Bit como sidecar/daemon?

**Respuesta**: Dos enfoques: 1) **Fluentd como Docker logging driver**: configurás `--log-driver fluentd --log-opt fluentd-address=tcp://fluentd:24224` por contenedor o en daemon.json. Docker envía logs de cada contenedor directamente a Fluentd via TCP, sin archivos locales. 2) **Fluent Bit como DaemonSet**: Fluent Bit corre como agente en cada nodo (montando `/var/lib/docker/containers/` para leer los archivos json-file), parsea los logs, y los envía a Fluentd/Elasticsearch/Loki. El segundo enfoque es preferible para producción porque: desacopla el logging de Docker (no requiere cambiar logging driver, funciona con el default json-file), Fluent Bit es más ligero que Fluentd (~500 KB vs ~40 MB), y permite enriquecer logs con metadata de nodo y K8s. Fluentd como driver es más simple para single-host.

**Por qué**: Fluentd (Treasure Data, proyecto CNCF graduado) es un pipeline de logs maduro con 600+ plugins. Fluent Bit (mismo ecosistema) es el agente ligero para edge/nodos. La arquitectura recomendada: Fluent Bit en cada nodo (DaemonSet) → Fluentd centralizado (agregación, transformación) → Elasticsearch/Loki/S3. En Docker standalone sin K8s, Fluentd como logging driver es suficiente (cada contenedor envía logs a un Fluentd central). Para Docker Compose en producción, agregar `logging:` a cada servicio:
```yaml
logging:
  driver: fluentd
  options:
    fluentd-address: "fluentd:24224"
    tag: "docker.{{.Name}}"
```

---

### 6. [Conectar] La clase menciona cAdvisor. ¿Cómo despliega un stack completo Prometheus + Grafana + cAdvisor con Docker Compose y qué dashboards son los más útiles?

**Respuesta**: Stack mínimo con Compose:
```yaml
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro - /var/run/docker.sock:/var/run/docker.sock:ro
      - /sys:/sys:ro - /var/lib/docker:/var/lib/docker:ro
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports: ["9090:9090"]
  grafana:
    image: grafana/grafana:latest
    ports: ["3000:3000"]
    volumes:
      - grafana-data:/var/lib/grafana
```
Prometheus scrapea cAdvisor en `cadvisor:8080`. Los dashboards de Grafana más útiles para Docker: 1) ID 193 (Docker monitoring) — contenedores individuales con CPU, memoria, red, disco, 2) ID 14282 (cAdvisor detailed) — métricas granulares por contenedor, 3) ID 186 (Node Exporter) — métricas del host necesarias para completar el monitoreo. Configurar alertas en Prometheus: `container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9` (memoria >90% del límite), `rate(container_cpu_cfs_throttled_seconds_total[5m]) > 0` (CPU throttling activo).

**Por qué**: Los dashboards de Grafana se importan desde grafana.com/dashboards por ID. El dashboard 193 (creado por la comunidad) es el más popular para Docker. cAdvisor expone métricas en formato Prometheus en `/metrics`. La configuración de Prometheus (`prometheus.yml`) agrega un `scrape_config` para cAdvisor. Para métricas de aplicación (no solo infraestructura), se agrega un exporter de aplicación (ej. `prom-client` para Node.js, `micrometer` para Spring Boot).

---

### 7. [Conectar] ¿Cómo funciona `docker events` y cómo se integra con herramientas de notificación? ¿Qué eventos indican problemas de seguridad?

**Respuesta**: `docker events` transmite el stream de eventos del daemon Docker en formato JSON lines. Cada evento tiene: `Type` (container, image, volume, network), `Action` (create, start, die, destroy, health_status), `Actor` (ID y attributes del objeto), `time` (timestamp, epoch), y `from` (imagen base). Para integrar con notificaciones, el patrón es: `docker events --format '{{json .}}' | while read event; do process "$event"; done`. Herramientas como `docker-event-monitor`, `docker-events-exporter` (Prometheus), o scripts custom consumen este stream. Eventos que indican problemas de seguridad: 1) `container exec_create` — alguien ejecutó `docker exec` (posible actividad no autorizada), 2) `container die` con exitCode 137 (SIGKILL, posible OOM killer), 3) `container health_status: unhealthy`, 4) Creación de contenedores con `--privileged` (atributo `privileged=true`), 5) `container update` (alguien cambió recursos en runtime).

**Por qué**: El API de eventos de Docker (/events endpoint) usa Server-Sent Events o streaming HTTP. El stream es infinito (se mantiene abierto). Para producción, `docker-events-exporter` convierte eventos en métricas Prometheus (ej. contador de execs, contador de containers unhealthy). Para alertas en tiempo real, `docker events --filter type=container --filter event=exec_create` se usa en scripts de monitoreo que envían notificaciones a Slack/Teams cuando se detectan acciones sospechosas.

---

### 8. [Cuestionar] ¿Deben los logs de aplicación ir a stdout/stderr o a archivos dentro del contenedor? ¿Cuál es la mejor práctica y por qué?

**Respuesta**: La mejor práctica es stdout/stderr. Razones: 1) Docker captura stdout/stderr automáticamente con cualquier logging driver (`json-file`, `fluentd`, etc.), sin configuración adicional de la aplicación, 2) Evita que los archivos de log crezcan sin control en la capa de escritura del contenedor (llenando el overlay), 3) Los logs se rotan y gestionan centralizadamente por Docker (max-size, max-file), no por la aplicación, 4) Funciona con todos los logging drivers sin modificar la app, 5) Los logs son accesibles con `docker logs`. Escribir a archivos es aceptable en: aplicaciones legacy que no pueden cambiarse, aplicaciones que generan logs estructurados enormes (audit logs, data logs) que no deben mezclarse con logs de operación, o cuando necesitás almacenamiento de logs con retención diferente a la que Docker provee (en ese caso, montás un volumen específico para logs).

**Por qué**: El principio III de 12 Factor App dice "Treat logs as event streams" — la app no debe preocuparse por el almacenamiento o rotación de logs, solo emitirlos a stdout. Docker implementa esto capturando stdout/stderr. La documentación de Docker y las Best Practices recomiendan stdout. La excepción: aplicaciones como nginx que por defecto escriben a archivos pueden configurarse para escribir a stdout (`access_log /dev/stdout; error_log /dev/stderr;`).

---

### 9. [Cuestionar] ¿Son los healthchecks de Docker suficientes o necesitás probes de Kubernetes (liveness, readiness, startup) para producción real?

**Respuesta**: Los healthchecks de Docker son equivalentes a una combinación de liveness + readiness en un solo check (no distinguen entre "todavía inicializando" y "se rompió en runtime"). K8s separa: 1) **Startup probe**: ¿terminó de inicializar? (si falla, K8s reinicia el contenedor, pero `start_period` en Docker es similar), 2) **Liveness probe**: ¿está vivo? (si falla, K8s reinicia el contenedor — Docker NO reinicia en unhealthy, solo reporta), 3) **Readiness probe**: ¿puede aceptar tráfico? (si falla, K8s lo remueve del Service endpoint — Docker no tiene este concepto). Para producción real en K8s, necesitás las tres probes. El healthcheck de Docker solo cubre liveness básico (el estado se reporta pero no se actúa automáticamente). En Swarm, el healthcheck + restart policy cubre liveness (si unhealthy, el scheduler lo reinicia). Pero readiness (remover del balanceador mientras está unhealthy pero no matarlo) es exclusivo de K8s.

**Por qué**: La separación de probes en K8s es una de las features que lo hace superior para producción. El CIS K8s Benchmark recomienda configurar liveness y readiness probes en todos los Pods. Para migrar de Docker a K8s, los healthchecks de Docker se traducen a liveness probes (mismo script, distintos parámetros). La readiness probe requiere un endpoint separado en la app (ej. `/healthz` para liveness, `/ready` para readiness).

---

### 10. [Cuestionar] ¿Vale la pena implementar distributed tracing (Jaeger/Tempo) en un entorno pequeño de contenedores o es overkill hasta cierta escala?

**Respuesta**: El valor del tracing es proporcional a la complejidad de la topología de servicios. Si tenés 2-3 servicios (frontend → API → BD), los logs + métricas son suficientes para debugging. El tracing brilla cuando tenés 10+ microservicios con llamadas encadenadas (A → B → C → D → E) y una request lenta: sin tracing, tenés que buscar en logs de 5 servicios y correlacionar timestamps manualmente. Con tracing, ves un waterfall con la latencia de cada span y sabés que C es el cuello de botella. El costo de implementar tracing con OpenTelemetry + Jaeger/Tempo es bajo (~100 MB para Jaeger, auto-instrumentación en muchos lenguajes), y el overhead de performance es ~1-2%. Para equipos que planean crecer a microservicios, implementar tracing desde el principio es una inversión barata que paga dividendos cuando la complejidad escala.

**Por qué**: Charity Majors (Honeycomb, co-autora de Observability Engineering) argumenta que tracing es la señal más valiosa para sistemas distribuidos porque captura causalidad (métricas y logs no). La auto-instrumentación de OpenTelemetry (para Java, Python, Node.js, Go, .NET) hace que agregar tracing a una app existente sea ~10 líneas de configuración. El "overkill" es una preocupación válida para equipos de 1-2 personas con 2 servicios, pero para cualquier equipo con ambición de escalar, tracing es una herramienta de debugging que ahorra horas cuando algo falla en producción.
