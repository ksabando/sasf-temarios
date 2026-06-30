---
sidebar_label: "Cuestionario"
---

# Cuestionario M24 — Buenas Prácticas y Patrones Docker

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente Dapr (Distributed Application Runtime) y cómo implementa patrones de microservicios (state management, pub/sub, actor model) sin acoplar la aplicación a SDKs específicos?

**Respuesta**: Dapr (Microsoft, proyecto CNCF incubado) es un runtime portable que se ejecuta como sidecar (o en modo ambient) y provee APIs HTTP/gRPC para patrones de microservicios: 1) **Service invocation**: llamada entre servicios con mTLS, retries, circuit breaking, y service discovery (sin que la app sepa la ubicación de otros servicios), 2) **State management**: CRUD en almacenes clave-valor (Redis, PostgreSQL, CosmosDB) con consistencia configurable, 3) **Pub/sub**: mensajería publish/subscribe (Kafka, RabbitMQ, Azure Service Bus) con dead letter, retries, y garantías de delivery, 4) **Bindings**: triggers de entrada/salida para integraciones externas (blob storage, cron, SMTP), 5) **Actors**: virtual actor pattern para stateful concurrency, 6) **Secrets**: acceso a secretos de múltiples providers (Vault, K8s Secrets, AWS Secrets Manager). La app habla con Dapr via `localhost:3500` (HTTP) o `localhost:50001` (gRPC), sin SDK (aunque hay SDKs opcionales para simplificar). Esto desacopla la aplicación de la infraestructura: si cambiás de Redis a PostgreSQL para state, la app no cambia.

**Por qué**: Dapr fue creado por Yaron Schneider, Mark Fussell, y el equipo de Azure (2019). Se inspira en los sidecar patterns (como Envoy) pero para lógica de aplicación, no solo networking. La filosofía: "Cualquier lenguaje, cualquier cloud, cualquier infraestructura". Los building blocks de Dapr (state, pub/sub, actors) encapsulan patrones que de otra forma tendrías que implementar con librerías específicas (ej. `redis-py` o `confluent-kafka-python`) acoplando la app a la tecnología.

---

### 2. [Investigar] ¿Qué es exactamente "Chaos Engineering" en el contexto de contenedores y cómo herramientas como LitmusChaos o Chaos Mesh implementan experimentos?

**Respuesta**: Chaos Engineering (Netflix, "Chaos Monkey", 2010; Casey Rosenthal, Nora Jones) es la práctica de experimentar en sistemas en producción para descubrir debilidades antes de que causen outages. En contenedores, herramientas como LitmusChaos (CNCF incubado) y Chaos Mesh (CNCF incubado) implementan experimentos como CRDs de K8s: 1) **Pod kill**: mata Pods aleatorios y verifica que el sistema sigue funcionando (replicas, auto-scaling), 2) **Network chaos**: introduce latencia, packet loss, o particiones de red entre servicios para probar timeouts y circuit breakers, 3) **Stress chaos**: consume CPU/memoria de Pods para simular picos de carga y verificar eviction policies, 4) **IO chaos**: introduce latencia/errores en I/O (filesystem, disco) para probar comportamiento bajo storage degradation, 5) **Time chaos**: manipula el reloj del sistema para probar comportamiento con time skew. Los experimentos se definen como YAML de K8s (declarativos), se ejecutan con hypotheses (estado esperado), y se miden con métricas de Prometheus/Grafana.

**Por qué**: Netflix popularizó Chaos Engineering con Chaos Monkey (2010), pero el ecosistema cloud-native ahora tiene herramientas nativas de K8s. LitmusChaos (MayaData, 2019) y Chaos Mesh (PingCAP, 2019) son las más populares. La práctica: ejecutar experimentos CAÓTICOS primero en staging, luego en producción en ventanas controladas, midiendo el "blast radius" y verificando que el sistema degrada gracefully (no catastróficamente).

---

### 3. [Investigar] ¿Qué son exactamente los "SLIs, SLOs, y SLAs" y cómo se aplican a aplicaciones containerizadas? ¿Cómo se relacionan con los healthchecks y el monitoreo?

**Respuesta**: SLI (Service Level Indicator): métrica cuantificable del servicio (ej. latencia p99 de requests, porcentaje de requests exitosos). SLO (Service Level Objective): objetivo para un SLI en un período (ej. "99.9% de requests exitosos en los últimos 30 días"). SLA (Service Level Agreement): contrato con el cliente con consecuencias si no se cumple (ej. "si availability <99.5%, crédito por outage"). En aplicaciones containerizadas: 1) Los healthchecks de Docker/K8s básicamente miden si el contenedor está "vivo" (SLI binario), pero no miden SLOs (calidad de servicio), 2) Para SLOs, necesitás métricas de aplicación: latencia, error rate, throughput — colectadas con Prometheus + OpenTelemetry, 3) SLOs guían la arquitectura: si tu SLO es 99.9% availability, necesitás al menos 2 réplicas + rolling updates + healthchecks + auto-scaling, 4) Error budgets: 1 - SLO = cuánto downtime "permitido" (ej. 99.9% = 43 minutos/mes). Esto guía decisiones: ¿podemos hacer un deploy riesgoso? Si el error budget está quemado, no.

**Por qué**: Los conceptos de SLI/SLO/SLA fueron popularizados por el libro "Site Reliability Engineering" (Google, 2016, editado por Betsy Beyer, Chris Jones, Niall Murphy). Para contenedores, el monitoreo de SLOs es más importante que solo monitorear "¿está el contenedor corriendo?" porque un contenedor healthy puede estar sirviendo errores 500. Herramientas como Sloth, Pyrra, y Google's SLOtter automatizan el tracking de SLOs y error budgets desde Prometheus.

---

### 4. [Investigar] ¿Qué es exactamente "Crossplane" y cómo implementa "Infrastructure as Code" usando Kubernetes como plano de control? ¿En qué se diferencia de Terraform?

**Respuesta**: Crossplane (Upbound, proyecto CNCF incubado) extiende K8s con CRDs que representan recursos cloud (EC2, RDS, GKE, etc.). Los recursos cloud se definen como YAML (K8s-style) y Crossplane los crea/gestiona en el cloud provider usando controladores (providers: AWS, Azure, GCP). Diferencias con Terraform: 1) Terraform es un CLI imperativo (`terraform apply`) con state file centralizado. Crossplane es un controlador K8s declarativo (reconciliation loop continuo — si alguien borra el RDS manualmente, Crossplane lo recrea), 2) Terraform usa HCL (lenguaje propio). Crossplane usa YAML de K8s (compatible con GitOps: ArgoCD/Flux), 3) Crossplane implementa "Composite Resources" (abstracciones): un equipo de plataforma define un `CompositeResourceDefinition` como "PostgreSQL-as-a-Service" (con tamaño, HA, backup), y los devs crean un claim de ese recurso sin conocer los detalles de RDS/GCP. Terraform no tiene este concepto de "platform engineering API".

**Por qué**: Crossplane fue creado por Bassam Tabbara y Jared Watts (ex-Microsoft Azure) en 2019. La filosofía: "Kubernetes as the universal control plane". No reemplaza Terraform: se complementan. Terraform es mejor para provisionar el cluster K8s mismo (y otros recursos no-K8s). Crossplane es mejor para gestionar recursos cloud DESDE K8s (para equipos que ya usan K8s y quieren GitOps). La tendencia: Terraform para crear el cluster, Crossplane para lo que corre dentro/relacionado al cluster.

---

### 5. [Conectar] La clase menciona 12 Factor App. ¿Cómo se relaciona este manifiesto con el "Beyond the 12 Factor App" (Kevin Hoffman, 2016) y qué factores adicionales propone para la era de contenedores?

**Respuesta**: "Beyond the 12 Factor App" (Kevin Hoffman, 2016, Pivotal) propone 3 factores adicionales para la era cloud-native: 13) **API First**: diseñar APIs antes que UIs. En contenedores: exponer endpoints REST/gRPC, documentar con OpenAPI, usar API gateways, 14) **Telemetry**: observabilidad desde el inicio. En contenedores: métricas (Prometheus), logs estructurados, traces distribuidas (OpenTelemetry) — no es opcional, es fundamental para debugging en producción, 15) **Authentication and Authorization**: seguridad desde el diseño. En contenedores: mTLS entre servicios, identidades SPIFFE, OAuth2/OIDC, y políticas de acceso por servicio. Además, el libro "Cloud Native Patterns" (Cornelia Davis, 2019) y "Kubernetes Patterns" (Bilgin Ibryam, Roland Huß, 2019) extienden los 12 factores con patrones específicos de K8s: Health Checks (liveness/readiness), Lifecycle hooks (PostStart/PreStop), Managed Lifecycle, y Automated Placement.

**Por qué**: Los 12 factores originales (Adam Wiggins, 2012, Heroku) fueron visionarios pero no cubrían observabilidad y seguridad (que no eran prioritarias en 2012). "Beyond the 12 Factor App" y "Kubernetes Patterns" llenan esos vacíos para la era cloud-native. La comunidad de CNCF también publicó "Cloud Native Principles" que extienden los 12 factores.

---

### 6. [Conectar] La clase menciona Sidecar, Ambassador, y Adapter. ¿Cómo se implementan estos patrones en Kubernetes con Pods multi-contenedor y cómo se relacionan con Init Containers?

**Respuesta**: En K8s: 1) **Sidecar**: definido como un contenedor adicional en el Pod (`containers[1]`). Comparte network, IPC, y volúmenes con el contenedor principal. Se ejecuta durante toda la vida del Pod (no termina hasta que el Pod muere). Ejemplos: proxy Envoy, config-reloader. 2) **Init Container**: definido en `initContainers`. Se ejecuta ANTES que los contenedores principales, y DEBE terminarse exitosamente (exit 0) para que los contenedores principales arranquen. Se usa para: inicializar datos (ej. clonar un repo git), esperar dependencias (ej. `until pg_isready`), o configurar permisos. 3) La diferencia: Sidecar convive con el contenedor principal (runtime concern). Init Container se ejecuta antes y termina (startup concern). K8s 1.29 (2024) introdujo "sidecar containers" como feature estable con `restartPolicy: Always` en init containers (permitiendo que inicien antes que el main container y se reinicien si fallan).

**Por qué**: K8s 1.29 (diciembre 2024) formalizó el concepto de sidecar en la API: `initContainers[].restartPolicy: Always` hace que el init container actúe como sidecar (se inicia antes que los main containers y persiste durante la vida del Pod). Esto resuelve el problema de orden de inicio (el sidecar debe arrancar antes que la app, pero antes los init containers solo podían terminar, no persistir). Para Ambassador y Adapter en K8s: conceptualmente, ambos son sidecars (contenedores adicionales en el Pod). La diferencia es su función (proxy vs normalización), pero en la API de K8s son idénticos (contenedores en el Pod).

---

### 7. [Conectar] ¿Cómo funciona el "graceful shutdown" con `PreStop` hook y SIGTERM en K8s? ¿Qué diferencia hay con `docker stop` y cómo implementar shutdown ordenado?

**Respuesta**: En K8s, el ciclo de terminación de un Pod: 1) K8s marca el Pod como Terminating (removido de endpoints del Service), 2) K8s ejecuta el `PreStop` hook (si está definido). Puede ser un comando (`exec`) o un HTTP GET. 3) K8s espera `terminationGracePeriodSeconds` (default 30s). 4) K8s envía SIGTERM al proceso principal del contenedor. 5) Si el proceso no termina en el tiempo restante, K8s envía SIGKILL. Diferencia con `docker stop`: K8s agrega el paso `PreStop` ANTES de SIGTERM, y tiene un grace period único para todo el Pod. Para implementar shutdown ordenado: 1) Definir `PreStop` hook: `exec: {command: ["/bin/sh", "-c", "sleep 5"]}` — espera 5s para que el tráfico en vuelo se complete (el Pod ya fue removido del Service), 2) La aplicación captura SIGTERM y hace graceful shutdown (dejar de aceptar conexiones, completar requests, cerrar BD), 3) Si el graceful shutdown de la app tarda más que el grace period - PreStop time, la app recibe SIGKILL (shutdown forzado).

**Por qué**: La documentación de K8s (Pod Lifecycle) detalla este proceso. El `PreStop` hook es crítico para aplicaciones que necesitan drenar tráfico antes de shutdown (ej. desregistrar de un service discovery, completar requests en cola). El `sleep 5` es un hack común para dar tiempo a que kube-proxy actualice iptables y deje de enviar tráfico al Pod (puede haber un delay de 1-2s).

---

### 8. [Cuestionar] ¿Son los patrones Sidecar/Ambassador/Adapter una buena práctica o introducen complejidad innecesaria? ¿Cuándo es mejor modificar la aplicación en lugar de agregar sidecars?

**Respuesta**: Sidecars son una buena práctica cuando: 1) Querés separar concerns (networking vs lógica de negocio) y que el desarrollador de app no tenga que implementar mTLS, retries, o telemetría en el código, 2) Necesitás inyectar funcionalidad transversal a múltiples aplicaciones (logging, proxy, security) sin tocarlas, 3) La funcionalidad sidecar es standard (Envoy proxy) y es mantenida por un equipo especializado (plataforma/SRE). Es mejor modificar la aplicación cuando: 1) La funcionalidad sidecar introduce demasiado overhead (latencia adicional, consumo de recursos para un proxy extra por Pod), 2) El equipo es pequeño y mantener sidecars operacionalmente es más costoso que agregar una librería al código, 3) Necesitás lógica específica que un sidecar genérico no puede implementar. La tendencia: Service Mesh (sidecars) está siendo cuestionado por su complejidad operativa, y alternativas como "ambient mesh" y eBPF (Cilium) buscan reducir/eliminar sidecars. La decisión es trade-off: desacoplamiento (sidecars) vs simplicidad operativa (código en la app).

**Por qué**: El debate sidecar vs no-sidecar se intensificó en 2023-2024 con la introducción de Istio Ambient y Cilium eBPF. William Morgan (Linkerd) defiende sidecars por desacoplamiento. Thomas Graf (Cilium) defiende eBPF por simplicidad y rendimiento. Para la mayoría de equipos, un sidecar de logging (Fluent Bit) o de config reload (configmap-reload) es "gratis" y valioso. Un sidecar de service mesh (Envoy) completo puede ser overkill para equipos pequeños.

---

### 9. [Cuestionar] ¿Deben las aplicaciones implementar "retry logic" y "circuit breakers" o debe hacerlo la plataforma (Service Mesh, Dapr, API Gateway)?

**Respuesta**: Idealmente, la plataforma (Service Mesh, Dapr, API Gateway) debe manejar retries, circuit breaking, y timeouts porque: 1) Desacopla la lógica de resiliencia de la lógica de negocio (desarrollador de app no tiene que escribir `for retry { ... }` en cada llamada HTTP), 2) La política puede configurarse centralizadamente (cambiar timeout de 5s a 3s sin re-deploy de la app), 3) Las métricas de resiliencia (cuántos retries, cuántos circuit breaks) se colectan sin instrumentación. PERO la aplicación debe implementar: 1) Idempotencia (para que los retries no causen doble procesamiento), 2) Reconocimiento de errores fatales (no retry si el error es 400 Bad Request, sí retry si es 503 Service Unavailable), 3) Backpressure awareness (si el circuit breaker está abierto, la app debe hacer fall-fast, no esperar). La combinación: plataforma maneja el mecanismo (retry/circuit breaker), aplicación maneja la semántica (idempotencia, qué errores son retryables).

**Por qué**: El libro "Microservices Patterns" (Chris Richardson, 2018) y "Building Microservices" (Sam Newman, 2021) discuten esto. Netflix Hystrix (ahora Resilience4j) implementaba retries/circuit breakers en la aplicación. Istio/Envoy y Dapr los implementan en la plataforma. La tendencia es mover resiliencia a la plataforma (porque la app no debería preocuparse de "cómo" llamar a otro servicio, solo de "qué" lógica de negocio ejecutar).

---

### 10. [Cuestionar] ¿Es el "12 Factor App" todavía relevante en 2025 o necesita una actualización significativa para la era de serverless, WebAssembly, y edge computing?

**Respuesta**: Los 12 factores originales (2012) son sorprendentemente vigentes: externalizar configuración, stateless processes, backing services como recursos, dev/prod parity — todos siguen siendo fundamentales. Pero hay vacíos: 1) Observabilidad (logs, metrics, traces): en 2012 se asumía que los logs eran solo stdout. Hoy necesitamos structured logs, traces distribuidas, y métricas de aplicación. 2) Seguridad: los 12 factores no mencionan identidad de servicio, mTLS, secretos dinámicos, o supply chain security. 3) Stateful workloads: los 12 factores asumen stateless, pero hoy los operadores de BD en K8s permiten stateful de manera cloud-native. 4) Serverless/event-driven: los 12 factores asumen HTTP request-response. Hoy hay sistemas event-driven (Kafka, Pub/Sub) y funciones serverless. 5) Multi-cloud/edge: portabilidad entre clouds y edge locations no era un factor en 2012. Kevin Hoffman (Beyond the 12 Factor, 2016) y Cornelia Davis (Cloud Native Patterns, 2019) extienden los factores. La comunidad open-source (CNCF) está trabajando en una actualización (Cloud Native Principles).

**Por qué**: Adam Wiggins (co-autor) dijo en 2020 que los 12 factores necesitan actualización pero los principios core son atemporales. La CNCF TAG App Delivery está trabajando en "Cloud Native Application Principles" (draft en github.com/cncf/tag-app-delivery). Para 2025, los 12 factores + Beyond + Cloud Native Principles juntos forman una guía completa.
