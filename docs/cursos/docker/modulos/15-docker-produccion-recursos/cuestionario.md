---
sidebar_label: "Cuestionario"
---

# Cuestionario M15 — Docker en Producción y Recursos

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente NUMA (Non-Uniform Memory Access) y cómo afecta al scheduling de contenedores? ¿Cómo se puede configurar afinidad NUMA en Docker y Kubernetes?

**Respuesta**: NUMA es una arquitectura de memoria donde el acceso a memoria depende de a qué CPU "socket" pertenece la memoria. En servidores multi-socket (ej. 2 sockets, cada uno con su banco de RAM local), un proceso que corre en CPU del socket 0 accede más rápido a la RAM local del socket 0 (~100 ns) que a la RAM del socket 1 (~150-200 ns, a través del bus inter-socket). En contenedores: si un contenedor tiene procesos corriendo en CPUs de socket 0 pero su memoria se asignó en socket 1, hay penalización de latencia (~30-50%). Docker no configura NUMA automáticamente — expone `--cpuset-cpus` (en qué CPU) y `--cpuset-mems` (de qué nodo NUMA tomar memoria). En K8s, la Topology Manager (K8s 1.16+, GA en 1.27) coordina CPU Manager, Memory Manager, y Device Manager para asignar CPUs y memoria del mismo nodo NUMA a un Pod, pero solo funciona con Guaranteed QoS Pods y políticas explícitas (`single-numa-node`, `restricted`).

**Por qué**: La documentación del kernel (Documentation/admin-guide/cgoup-v2.rst) y el KEP 2297 (NUMA-aware scheduling) detallan esto. Para workloads de alto rendimiento (NFV, bases de datos, financial services), la afinidad NUMA puede mejorar latencia en 20-40%. En Docker standalone: `docker run --cpuset-cpus 0-3 --cpuset-mems 0` asigna CPUs y memoria del nodo NUMA 0. En K8s: configurar `cpuManagerPolicy: static` y `topologyManagerPolicy: single-numa-node` en kubelet. La mayoría de las aplicaciones cloud-native no necesitan afinidad NUMA explícita (el overhead es pequeño), pero para cargas de baja latencia es crítico.

---

### 2. [Investigar] ¿Qué es exactamente "CPU pinning" y cómo se relaciona con `--cpuset-cpus`? ¿Cómo afecta al rendimiento y al scheduling del host?

**Respuesta**: CPU pinning (fijación de CPU) asigna procesos de un contenedor a cores específicos, evitando que el scheduler del kernel los mueva entre cores. `--cpuset-cpus=0-3` asigna cores 0,1,2,3 al contenedor (solo puede ejecutar en esos). Sin pinning, el kernel scheduler puede migrar threads entre cualquier core (lo cual es bueno para balanceo pero introduce cache misses: cuando un thread se mueve, pierde su cache L1/L2). Con pinning, el thread se mantiene en el mismo core, aprovechando cache caliente (lower latency). El costo: esos cores quedan reservados para el contenedor (aunque esté idle, otros contenedores no pueden usarlos), reduciendo la utilización global del host. Es una técnica de "high performance computing" y sistemas de baja latencia (telco 5G, trading financiero). Para workloads generales, `--cpus` (CFS quota) es preferible (permite que el kernel mueva threads y optimice utilización).

**Por qué**: En Linux, `sched_setaffinity()` es la syscall que implementa CPU affinity. Docker expone esto con `--cpuset-cpus`. En K8s, la CPU Manager con política `static` asigna cores exclusivos a contenedores Guaranteed QoS con CPU request entero (ej. `cpu: 2` en lugar de `cpu: 2000m`). Brendan Gregg (Netflix, Intel) documenta que CPU pinning puede reducir tail latency en 50-80% para aplicaciones sensibles a latencia, pero a costa de desperdiciar capacidad (los cores asignados no pueden ser usados por otros incluso si el contenedor está idle). La práctica moderna: usar CPU pinning solo para workloads con requisitos de latencia estrictos (SLAs de <1ms).

---

### 3. [Investigar] ¿Qué es exactamente el "OOM killer oom_score_adj" y cómo se puede configurar para priorizar qué contenedor muere primero cuando el host se queda sin memoria?

**Respuesta**: `oom_score_adj` es un valor por proceso (de -1000 a 1000) que influye en la decisión del OOM killer del kernel sobre qué proceso matar. Valores más altos = mayor probabilidad de ser matado. Docker configura automáticamente `oom_score_adj` para contenedores: se calcula como una función del uso de memoria relativo al límite. Pero el administrador puede forzarlo con `--oom-score-adj <value>`. Ejemplo: `--oom-score-adj 500` (alta prioridad para morir), `--oom-score-adj -500` (baja prioridad, se salva hasta el final). Caso de uso: en un host con múltiples contenedores, querés que los worker no críticos mueran antes que la base de datos. Asignás `--oom-score-adj -800` a postgres y `--oom-score-adj 300` a workers. Si el kernel OOM killer se activa (porque el HOST se queda sin memoria, no solo un contenedor), matará primero a los workers.

**Por qué**: El kernel Linux (Documentation/filesystems/proc.rst) detalla `oom_score` (score calculado por el kernel) y `oom_score_adj` (ajuste manual). El score final es `oom_score + oom_score_adj`. Docker también soporta `--oom-kill-disable` que deshabilita el OOM killer para ese contenedor (el contenedor se congela en lugar de morir — requiere manejo manual). Esto es diferente del OOM dentro del cgroup del contenedor (cuando excede su `--memory` límite, el OOM killer opera SOLO en ese cgroup, matando el proceso más memoria-intensivo dentro del contenedor, no en otros).

---

### 4. [Investigar] ¿Cómo funciona exactamente el "graceful shutdown" de Docker cuando el proceso principal es un shell script? ¿Por qué `exec` es crítico en scripts de entrypoint?

**Respuesta**: El problema: cuando el entrypoint es un shell script (`ENTRYPOINT ["/entrypoint.sh"]`), el shell (`/bin/sh`) es PID 1. El shell ejecuta el proceso de aplicación como hijo. Cuando Docker envía SIGTERM: 1) el shell (PID 1) recibe SIGTERM. PID 1 en Linux ignora señales sin handler. 2) El shell NO forwardea la señal al hijo (a menos que use `trap` y `kill` explícito), 3) Docker espera `--time` segundos (default 10), 4) El shell no muere, 5) Docker envía SIGKILL al shell, 6) El hijo (aplicación) muere sin graceful shutdown. La solución: terminar el script con `exec "$@"` o `exec python app.py`. `exec` reemplaza el proceso shell con el proceso de aplicación (el hijo se convierte en PID 1). Ahora SIGTERM va directamente a la aplicación, que puede manejarlo. También se puede usar `--init` (tini) como PID 1, que forwardea señales.

**Por qué**: La documentación de Docker (Best Practices for writing Dockerfiles) y el artículo de Yelp engineering sobre `dumb-init` explican esto. `exec` es una syscall que reemplaza el proceso actual con un nuevo programa sin crear un proceso hijo (el PID se mantiene, el nuevo programa hereda el PID). En entrypoint scripts: `#!/bin/sh; do_setup; exec "$@"`. El `"$@"` expande a CMD. Sin `exec`, el shell termina PERO el hijo queda huérfano y adoptado por PID 1 (si hay `--init`) o se convierte en zombie. Con `exec`, el proceso de aplicación ES PID 1 y recibe señales directamente.

---

### 5. [Conectar] La clase menciona restart policies. ¿Cómo interactúa una restart policy con un rolling update en Swarm? ¿Qué pasa si configurás `--restart-condition any` y `--update-parallelism` al mismo tiempo?

**Respuesta**: En Swarm, la restart policy del servicio (`--restart-condition`, `--restart-delay`, `--restart-max-attempts`) controla cómo Swarm maneja réplicas que fallan. Durante un rolling update: 1) Swarm crea nuevas réplicas según `--update-parallelism`, 2) Si una nueva réplica falla (exit code != 0 o healthcheck unhealthy), Swarm aplica `--update-failure-action`. 3) Si la acción es `rollback`, SWARM revierte TODAS las réplicas (incluso las que ya se actualizaron exitosamente). La restart policy NO se aplica durante el update para las NUEVAS réplicas fallidas (porque Swarm asume que el fallo es por la actualización, y quiere que el administrador/sistema decida si continuar, pausar, o hacer rollback). Después de que el update se completa (todas las réplicas en la nueva versión healthy), la restart policy normal se aplica.

**Por qué**: SwarmKit implementa esta distinción en el orchestrator/updater.go. La lógica es: durante un update, una réplica que falla repetidamente podría indicar una mala imagen, y reiniciarla infinitamente con `--restart-condition any` sería contraproducente. Swarm espera la decisión de `--update-failure-action`. Una vez que el update se completa (estado `completed`), la restart policy normal se reactiva. Si configurás `--restart-condition none` y una réplica muere después del update, Swarm no la reinicia (el contador de réplicas cae). Si configurás `--restart-condition any`, Swarm la reinicia automáticamente.

---

### 6. [Conectar] ¿Cómo se relacionan los límites de CPU (`--cpus`) con el CFS scheduler del kernel? ¿Qué es exactamente `cpu.cfs_quota_us` y cómo se calcula el throttling?

**Respuesta**: `--cpus=1.5` se traduce en cgroups v1 como: `cpu.cfs_period_us = 100000` (100 ms, período de scheduling) y `cpu.cfs_quota_us = 150000` (150 ms de tiempo de CPU por período). Esto significa que el contenedor puede usar como máximo 150 ms de CPU cada 100 ms = 1.5 cores. Si el contenedor intenta usar más (excede la cuota), el CFS scheduler lo "throttlea": el kernel pone el proceso en una cola de espera hasta el próximo período. El throttling se manifiesta como: la aplicación experimenta latencia (aunque `docker stats` muestre 100% de uso del límite, en realidad está siendo limitada). La métrica `cpu.cfs_throttled_seconds` (en cgroups v1) o `cpu.stat.nr_throttled` (en v2) indica cuánto tiempo el contenedor fue throttled. Esto es diferente al uso de CPU: un contenedor puede tener 100% de uso (de su límite) y aun así estar throttled si su límite es bajo.

**Por qué**: La documentación del kernel (Documentation/scheduler/sched-bwc.rst) explica el CFS bandwidth control. En cgroups v2, `cpu.max` reemplaza `cpu.cfs_quota_us`/`cpu.cfs_period_us` con un formato `$MAX $PERIOD` (ej. "150000 100000"). El throttling es la métrica más importante para detectar que un contenedor necesita más CPU: si `container_cpu_cfs_throttled_seconds_total` crece constantemente, el contenedor está siendo limitado y experimenta latencia. `docker stats` muestra el uso relativo al límite, pero no muestra el throttling.

---

### 7. [Conectar] ¿Cómo funciona `docker update` para cambiar recursos en runtime? ¿Qué operaciones de cgroups realiza el daemon y qué limitaciones tiene?

**Respuesta**: `docker update` modifica los parámetros de cgroups sin detener el contenedor. Internamente: 1) el daemon recibe el comando via API, 2) actualiza los archivos de cgroup del contenedor directamente escribiendo nuevos valores en `/sys/fs/cgroup/<subsystem>/docker/<container-id>/<param>`, 3) para memoria: escribe en `memory.limit_in_bytes` (v1) o `memory.max` (v2), 4) para CPU: escribe en `cpu.cfs_quota_us` y `cpu.cfs_period_us` (v1) o `cpu.max` (v2), 5) para restart policy: actualiza la configuración en memoria del daemon (no en cgroups). Limitaciones: 1) No puede modificar configuraciones que requieren recrear namespaces (red, user, PID), 2) No puede modificar volúmenes o puertos, 3) Para memoria, solo puede AUMENTAR el límite si el nuevo valor es mayor que el uso actual (porque el kernel no permite reducir el límite por debajo del uso actual), 4) No puede cambiar la imagen, entrypoint, o variables de entorno.

**Por qué**: El código de Docker (daemon/update.go) implementa `update` usando la API de containerd. Las operaciones de cgroups son inmediatas (escribir en sysfs). La restricción de memoria es del kernel: `memory.max` no puede ser menor que el `memory.current`. Si intentás reducir el límite de 512 MB a 256 MB pero el contenedor está usando 300 MB, el kernel rechaza la operación (EINVAL o EBUSY). Primero debés forzar al contenedor a liberar memoria (matando procesos, reiniciando). `docker update` es una herramienta de tuning fino, no un reemplazo de recrear el contenedor con nueva configuración.

---

### 8. [Cuestionar] ¿Deben los contenedores tener siempre límites de recursos explícitos? ¿Cuál es el riesgo de no configurarlos?

**Respuesta**: SÍ, los contenedores en producción deben tener límites explícitos. Sin límites: 1) un contenedor con memory leak puede consumir toda la RAM del host, causando OOM killer del kernel que puede matar procesos críticos del sistema (incluyendo dockerd, sshd), 2) un contenedor con un loop infinito puede consumir 100% de CPU de todos los cores, degradando todo el host, 3) un fork bomb (intencional o bug) puede agotar los PIDs del kernel, impidiendo crear nuevos procesos en todo el host. Los límites NO son opcionales — son la diferencia entre "un contenedor falla" y "todo el host cae". El riesgo de no configurarlos es outage completo del host, afectando todos los servicios. En K8s, los resource limits son obligatorios para producción (incluso hay admission controllers como LimitRanger que bloquean Pods sin limits).

**Por qué**: Incidentes reales documentados por empresas como Datadog y Sysdig muestran que el 70% de los outages de contenedores en producción son causados por falta de límites de recursos. El kernel OOM killer es notoriamente malo eligiendo qué matar: a menudo mata sshd o systemd-journald en lugar del contenedor culpable. Con `--memory` límites, el OOM killer opera dentro del cgroup (solo mata procesos del contenedor excedido). Sin límites, el OOM killer global del kernel puede matar cualquier proceso, incluyendo los del host.

---

### 9. [Cuestionar] ¿Es `docker update` una operación segura para cambiar recursos en caliente en producción o es mejor recrear el contenedor?

**Respuesta**: Es segura para cambios incrementales y no disruptivos (aumentar CPU, aumentar memoria, cambiar restart policy). NO es recomendable para cambios drásticos (reducir memoria por debajo del uso actual falla) o cambios que afectan el comportamiento del scheduler (CPU pinning). La ventaja: zero downtime para el proceso. La desventaja: los cambios no persisten en la configuración del contenedor (si el contenedor se recrea — por restart, crash, o `docker rm`/`run` — los valores anteriores vuelven a menos que los hayas definido en el compose/YAML). Para cambios permanentes, debés actualizar el compose file / stack file y hacer deploy (que recrea los contenedores con la nueva configuración). `docker update` es una herramienta de emergencia: "este contenedor necesita más CPU AHORA mientras preparamos un deploy con los nuevos límites".

**Por qué**: La documentación de Docker y la práctica de SRE recomiendan: usar `docker update` como mitigación inmediata de incidentes (el contenedor está throttled, le das más CPU temporalmente), pero resolver la causa raíz (actualizar la configuración declarativa y redeploy). En K8s, `kubectl set resources` modifica los requests/limits del Deployment (trigger un rolling update), no hay equivalente a `docker update` en caliente sin recrear Pods (porque K8s trata los Pods como inmutables en su spec de recursos).

---

### 10. [Cuestionar] ¿Vale la pena implementar "overcommit" de recursos (asignar más memoria/CPU de la disponible) en un cluster de contenedores? ¿Cuándo es aceptable?

**Respuesta**: Overcommit de CPU es aceptable y común (la mayoría de los cloud providers lo hacen). CPU es un recurso comprimible: si hay contención, el kernel reparte el tiempo de CPU proporcionalmente a los shares. Overcommit agresivo de CPU (ej. 10:1 en VMs cloud) funciona porque la mayoría de workloads no usan su CPU asignada al 100% simultáneamente. Overcommit de MEMORIA es PELIGROSO: la memoria no es comprimible (si un proceso necesita 1 GB y solo hay 512 MB físicos, muere). El kernel puede usar swap para overcommit de memoria, pero swap en contenedores causa degradación masiva de rendimiento (latencia de disco en lugar de RAM). Overcommit de memoria en producción es la causa más común de OOM kills inesperados. Docker/K8s permiten overcommit de memoria por defecto (no fuerzan que la suma de límites ≤ RAM del host). Para producción: NO overcommitear memoria (suma de `--memory` limits ≤ RAM física - buffer para SO). CPU puede overcommitearse según el patrón de uso.

**Por qué**: La documentación de Google (Borg paper, 2015) explica que Borg/Omega (ancestros de K8s) overcommiteaban agresivamente memoria usando swap y memory ballooning, pero eso era viable porque Google controlaba las aplicaciones. En entornos multi-tenant cloud, overcommit de memoria es la principal causa de inestabilidad. La recomendación de K8s: usar `requests` para scheduling (basado en uso promedio) y `limits` para protección (basado en pico). La suma de requests debe ser ≤ capacidad del nodo (no overcommit). La suma de limits PUEDE exceder la capacidad (overcommit), pero el riesgo es que en picos simultáneos haya OOM kills.
