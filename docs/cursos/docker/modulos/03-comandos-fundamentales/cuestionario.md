---
sidebar_label: "Cuestionario"
---

# Cuestionario M03 — Comandos Fundamentales

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funciona internamente `docker exec` a nivel de kernel? Describí cómo el daemon inyecta un proceso adicional en los namespaces de un contenedor existente usando las syscalls `setns()` y `nsenter`.

**Respuesta**: `docker exec` no se conecta por SSH ni crea un nuevo contenedor. El daemon Docker: 1) identifica los namespaces del contenedor destino (PID, network, mount, IPC, UTS) inspeccionando `/proc/<container-pid>/ns/`, 2) crea un nuevo proceso con `fork()`, 3) llama a `setns()` para cada namespace (fd obtenido de `/proc/<container-pid>/ns/<type>`), uniendo el nuevo proceso a los namespaces existentes del contenedor. El proceso hijo ejecuta el comando especificado. El daemon no necesita estar dentro del contenedor — usa `setns()` desde afuera, requiriendo CAP_SYS_ADMIN en el namespace de PID del host.

**Por qué**: El código fuente de Docker (moby/moby en GitHub, archivo `daemon/exec.go`) y la documentación del kernel (`man 2 setns`) muestran este mecanismo. `nsenter` (herramienta de util-linux) hace lo mismo desde línea de comandos: `nsenter -t <pid> -m -u -i -n -p -- <comando>`. El flag `-it` en `docker exec` asigna un pseudo-terminal (PTY) usando `/dev/ptmx`, creando los file descriptors master/slave. La limitación: solo podés unirte a namespaces de procesos que existan y cuyos `/proc/<pid>/ns/` sean accesibles (necesitás permisos adecuados). Este mecanismo es fundamentalmente diferente a SSH (que requiere un daemon SSH dentro del contenedor) y más seguro (sin exponer un servicio adicional).

---

### 2. [Investigar] ¿Qué son exactamente los "ephemeral containers" de Kubernetes y cómo se relacionan con `docker exec`? ¿Qué problema resuelven que `kubectl exec` no puede?

**Respuesta**: Los ephemeral containers (K8s 1.25+, stable en 1.29) son contenedores temporales inyectados en un Pod existente para debugging. A diferencia de `kubectl exec` (que ejecuta un comando en un contenedor YA existente), los ephemeral containers crean un contenedor nuevo dentro del Pod que comparte namespaces pero tiene su propia imagen (ej. una imagen con herramientas de debugging: netshoot, curl, tcpdump). Resuelven el problema de "mi contenedor de producción está basado en Distroless y no tiene shell, `kubectl exec` no sirve". Ahora podés: `kubectl debug -it <pod> --image=nicolaka/netshoot --target=<container>`, que agrega un ephemeral container con todas las herramientas.

**Por qué**: La KEP (Kubernetes Enhancement Proposal) 277 documenta que los contenedores regulares en un Pod son inmutables (definidos en el spec del Pod). Los ephemeral containers usan un campo especial `ephemeralContainers` en el status del Pod que puede modificarse sin recrear el Pod. Internamente, el kubelet usa `setns()` como Docker para unir el ephemeral container a los namespaces del Pod. La motivación principal vino de la adopción de Distroless: imágenes sin shell ni herramientas de debugging. `kubectl debug` (comando que reemplazó a `kubectl alpha debug`) es la interfaz de usuario para esta funcionalidad (K8s 1.20+).

---

### 3. [Investigar] ¿Qué diferencia hay entre los cgroups v1 y v2 y cómo afecta esto a Docker? ¿Cómo se manifiesta la diferencia en la práctica con `docker run --memory` y `docker stats`?

**Respuesta**: cgroups v1 (usado por defecto hasta ~2020) tiene múltiples jerarquías independientes (una por subsistema: cpu, memory, blkio, etc.) y cada contenedor aparece en una ruta diferente en cada jerarquía. cgroups v2 (recomendado desde Docker 20.10+, kernel 4.15+) unifica todos los subsistemas en una sola jerarquía (`/sys/fs/cgroup/`), simplifica la gestión de memoria (memory.high vs memory.max para soft/hard limits), introduce `cpu.weight` en lugar de `cpu.shares`, y el pressure stall information (PSI) para presión de recursos. En la práctica: `docker stats` en v2 usa métricas más precisas; `--memory` y `--memory-reservation` se mapean a `memory.max` y `memory.high` en lugar de `memory.limit_in_bytes` y `memory.soft_limit_in_bytes`.

**Por qué**: La transición de cgroups v1 a v2 está documentada en kernel.org (Documentation/admin-guide/cgroup-v2.rst) y en los release notes de Docker (20.10+: soporte cgroups v2). Docker detecta automáticamente si el host usa v1 o v2. En v2, el manejo de memoria es más preciso: `memory.high` es un throttle (el kernel reduce la velocidad de asignación de memoria cuando se excede), no un kill inmediato (que sí ocurre con `memory.max`). Esto permite que `--memory-reservation` funcione como un soft limit real en lugar de solo ser consultivo. La mayoría de distribuciones modernas (Ubuntu 22.04+, Fedora 31+, RHEL 8+) usan cgroups v2 por defecto.

---

### 4. [Investigar] ¿Qué es `docker manifest` y por qué los comandos `docker manifest create` y `docker manifest push` existen separados de `docker push`? ¿Cómo se relaciona esto con las imágenes multi-arquitectura?

**Respuesta**: `docker manifest` es un subcomando para trabajar con manifest lists (índices OCI) que agrupan múltiples imágenes para diferentes arquitecturas/OS bajo un mismo tag. Fue un comando experimental (Docker 18+) y ahora es parte de `docker buildx imagetools` (recomendado). El comando `docker manifest create myapp:latest myapp:amd64 myapp:arm64` crea un manifest list que referencia las imágenes específicas, y `docker manifest push` sube el manifest list al registry. Está separado de `docker push` porque el manifest list es metadata que apunta a imágenes existentes, no una imagen nueva. `docker buildx build --platform linux/amd64,linux/arm64` unifica esto automáticamente.

**Por qué**: Antes de buildx, crear imágenes multi-arch requería: 1) build separado en cada arquitectura, 2) push individual, 3) `docker manifest create` para unirlas, 4) `docker manifest push`. Buildx unifica esto en un solo comando. Internamente, un manifest list es un JSON con `manifests: [{platform: {os: linux, architecture: amd64}, digest: sha256:abc...}, ...]`. Cuando un cliente hace pull, envía su plataforma en el header HTTP, y el registry sirve el manifest correspondiente. Esto es parte del OCI Image Spec v1.0. `docker buildx imagetools inspect nginx:latest` muestra todas las plataformas disponibles para un tag.

---

### 5. [Conectar] La clase menciona `docker run`, pero ¿cómo funciona exactamente `docker create` seguido de `docker start` y por qué esta separación existe? ¿En qué escenario es preferible a `docker run`?

**Respuesta**: `docker create` crea el contenedor (configura namespaces, red, volúmenes, capa overlay) pero NO lo inicia. `docker start` inicia el proceso principal en el contenedor ya creado. `docker run = docker create + docker start + docker attach` (si no es -d). Esta separación existe por dos razones: 1) inspeccionar/modificar la configuración del contenedor entre create y start (asignar IP fija, modificar `/etc/hosts` vía `--add-host`), 2) iniciar el mismo contenedor múltiples veces con `docker start` después de `docker stop`. Es preferible cuando necesitás configurar algo antes de arrancar, o cuando querés separar la etapa de configuración de la ejecución.

**Por qué**: El código de Docker (daemon/create.go) muestra que `create` realiza todo el setup de infraestructura (networking, storage, security profiles) mientras `start` solo ejecuta `containerd.Start()`. En CI/CD, `docker create` permite preparar el contenedor (montar volúmenes de datos de test, configurar redes) y luego ejecutarlo con `docker start`. `docker run --read-only` es equivalente a `docker create --read-only ... && docker start ...` pero en un solo comando. La separación también permite que `docker start` sea más rápido que `docker run` en arranques subsiguientes (no recrea la capa overlay).

---

### 6. [Conectar] El `docker stats` de la clase muestra CPU y memoria. ¿Cómo accede Docker a las métricas de cgroups y qué limitaciones tiene `docker stats` comparado con herramientas especializadas como cAdvisor o directo a cgroups?

**Respuesta**: `docker stats` lee las métricas desde los archivos de cgroups en `/sys/fs/cgroup/<subsystem>/docker/<container-id>/` (o la ruta equivalente de systemd si está configurado como cgroup driver). Específicamente: CPU desde `cpuacct.usage` (v1) o `cpu.stat` (v2), memoria desde `memory.usage_in_bytes` (v1) o `memory.current` (v2). Las limitaciones: 1) solo muestra métricas instantáneas (no históricas), 2) solo contenedores en ejecución (no post-mortem), 3) no muestra métricas de disco por volumen ni networking detallado, 4) el cálculo de % CPU es sobre el total de cores del host, no sobre el límite del contenedor, 5) no exporta métricas (solo CLI interactivo). cAdvisor lee las mismas fuentes pero agrega historia, más métricas, y exporta a Prometheus.

**Por qué**: El código de `docker stats` (cli/command/container/stats.go) muestra que usa el API de containerd para obtener estadísticas en tiempo real via streaming gRPC. Las métricas de CPU se calculan como `(cpu_delta / system_cpu_delta) * num_cpus * 100` para mostrar el porcentaje de uso de CPU del host. Para uso de memoria, `docker stats` muestra `usage / limit` (si hay límite configurado), que es más útil para saber si un contenedor está cerca de su límite. Sin embargo, métricas como throttling de CPU (cfs_throttled_seconds), presión de memoria (PSI), y fallos de página solo están disponibles directamente en cgroups o con cAdvisor.

---

### 7. [Conectar] ¿Cómo funciona internamente `docker logs` cuando el logging driver es `json-file`? ¿Qué hace exactamente `docker logs -f` a nivel de syscalls?

**Respuesta**: `docker logs` lee los archivos de log en `/var/lib/docker/containers/<id>/<id>-json.log` (con driver json-file). Cada línea es un objeto JSON: `{"log":"line content\n","stream":"stdout","time":"2024-..."}`. Sin `-f`, Docker abre el archivo, busca (seek) según `--tail` o `--since`, y lee secuencialmente. Con `-f` (follow), Docker hace tail -f: abre el archivo, lee hasta EOF, y luego usa `inotify` (syscall `inotify_init()`, `inotify_add_watch()`) para detectar nuevos bytes escritos en el archivo de log. Cuando `inotify` notifica un evento, Docker lee los nuevos datos y los muestra. Esto es eficiente porque no hay polling.

**Por qué**: El código fuente en `daemon/logger/jsonfilelog/` muestra la implementación del driver json-file. `inotify` es un mecanismo del kernel (desde Linux 2.6.13) que monitorea eventos en inodos (modificaciones, creación, eliminación). Docker lo usa para "tail" eficiente sin loop de `sleep`. Cuando el archivo de log se rota (se alcanza `max-size`), Docker crea un nuevo archivo y `inotify` debe reconfigurarse (el evento `IN_MOVE_SELF` indica la rotación). Esto es más robusto que el enfoque de `tail -f` que usa `inotify` internamente pero puede perder líneas en la rotación. Con otros drivers (fluentd, syslog), `docker logs` no funciona porque los logs no se almacenan localmente.

---

### 8. [Cuestionar] ¿Debe `docker system prune -a` ejecutarse en producción? Hay quienes dicen que es una mala práctica y quienes lo consideran mantenimiento esencial. ¿Quién tiene razón?

**Respuesta**: Depende. Ejecutar `prune -a` sin filtros en producción es peligroso: elimina imágenes taggeadas que podrían ser necesarias para rollback inmediato. Sin embargo, no ejecutar limpieza lleva a disco lleno y outage. La postura correcta es: prune con filtros (`--filter "until=168h"` para imágenes con más de 7 días sin uso, `--filter "label!=keep"`), ejecutarlo como tarea programada, y nunca con `--volumes` sin verificar antes. La primera postura ("mala práctica") es correcta para quien ejecuta `prune -a` manualmente en producción sin entender qué elimina. La segunda postura ("mantenimiento esencial") es correcta cuando se aplica con políticas definidas y monitoreo.

**Por qué**: El disaster "disco lleno por imágenes acumuladas" es uno de los outages más comunes en Docker en producción. Spotify (creadores de docker-gc, una herramienta de limpieza programada) documentó en su engineering blog que automatizar la limpieza con reglas es esencial. docker-gc introdujo el concepto de "keep latest N images" y "exclude tagged X". La solución moderna: Harbor/registry con políticas de retención automática, CI/CD que solo mantiene últimas N imágenes por branch, y `docker system prune` con `--filter until` en el host. El balance: nunca eliminar imágenes que están corriendo, mantener al menos 2 versiones anteriores para rollback, y monitorear espacio en disco con alertas.

---

### 9. [Cuestionar] `docker exec` es omnipresente en debugging, pero ¿viola el principio de "inmutabilidad" de contenedores? ¿Deberían las imágenes de producción siquiera tener shell?

**Respuesta**: `docker exec` para debugging en desarrollo es aceptable. En producción, `docker exec` viola el principio de inmutabilidad (estás modificando el estado del contenedor en runtime) y la seguridad (si un atacante obtiene acceso al socket Docker, `docker exec` es su puerta de entrada). La tendencia moderna con Distroless (Google) es eliminar completamente el shell y herramientas de debugging de las imágenes de producción: sin shell, sin package manager, sin `docker exec`. Esto fuerza a debuggear via observabilidad externa (logs, métricas, traces) y no mediante conexión interactiva al contenedor.

**Por qué**: Google creó Distroless en 2017 con la filosofía "solo la aplicación y sus dependencias runtime, nada más". La motivación: reducir superficie de ataque (sin shell, un atacante no puede ejecutar comandos arbitrarios) y forzar buenas prácticas de debugging (observabilidad en lugar de SSH/exec). En K8s, `kubectl exec` tiene el mismo problema de inmutabilidad, pero los ephemeral containers (K8s 1.25+) ofrecen una solución: debugging temporal sin modificar la imagen de producción. La controversia real es si la conveniencia de `docker exec` en producción justifica el riesgo de seguridad y la violación de inmutabilidad.

---

### 10. [Cuestionar] ¿Es `docker run --rm` una buena práctica en CI/CD o deberíamos siempre dejar los contenedores para debugging post-mortem y limpiarlos con una tarea programada?

**Respuesta**: `--rm` es bueno para CI/CD porque evita acumulación de contenedores detenidos que llenan el disco del runner. Sin embargo, si un contenedor falla y se elimina inmediatamente, perdés logs y estado post-mortem. La solución balanceada: en CI/CD, usar `--rm` para steps que pasan (éxito confirmado) pero NO usar `--rm` para steps que pueden fallar (tests, builds), y tener un step de cleanup al final del pipeline (o al inicio, limpiando runs anteriores) que elimine contenedores exitosos. Alternativa: usar `docker run --rm` con logging driver `fluentd` o `syslog` que envíe los logs a un sistema externo antes de que el contenedor desaparezca.

**Por qué**: La documentación de GitHub Actions recomienda limpiar al final del job para liberar espacio, pero Docker ya provee `--rm` como conveniencia. En GitLab CI, los runners usan `docker run --rm` por defecto para los jobs. El trade-off es debugging: si un test de integración falla, querés poder hacer `docker logs <id>` del contenedor de la base de datos para ver qué pasó. Con `--rm`, eso es imposible. La recomendación de la comunidad: en CI, usar `docker compose up` sin `--rm`, ejecutar tests, y al final `docker compose down`. Si falla, los contenedores quedan para inspección hasta que el runner haga cleanup al inicio del próximo job.
