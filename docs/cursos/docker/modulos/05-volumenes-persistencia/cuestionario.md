---
sidebar_label: "Cuestionario"
---

# Cuestionario M05 — Volúmenes y Persistencia de Datos

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es CSI (Container Storage Interface) y cómo se relaciona con los volúmenes Docker? ¿Por qué Docker no adoptó CSI nativamente y cómo lo usa Kubernetes?

**Respuesta**: CSI (Container Storage Interface) es un estándar abierto (CNCF) que define una API gRPC para que orquestadores (Kubernetes, Mesos, Swarm) se comuniquen con plugins de almacenamiento (EBS, NFS, Ceph, etc.) sin acoplarse a un proveedor. Docker NO adoptó CSI nativamente para volúmenes — usa su propio sistema de plugins (legacy volume plugins, Docker Plugin API). Kubernetes sí adoptó CSI como estándar (GA desde K8s 1.13, 2018), reemplazando los in-tree volume plugins. La razón de Docker: el sistema de plugins de Docker precedió a CSI y cambiar habría roto compatibilidad. Docker Swarm sigue usando Docker volume plugins (Rexray, etc.) que son menos flexibles que CSI.

**Por qué**: CSI fue creado por Kubernetes SIG-Storage y la comunidad de storage (Google, Red Hat, NetApp, EMC) para estandarizar la interfaz. La especificación define tres servicios: Identity (información del plugin), Controller (provisionar/eliminar volúmenes, snapshots), y Node (montar/desmontar en el nodo). Kubernetes implementa CSI mediante sidecars (external-provisioner, external-attacher, node-driver-registrar). Docker mantuvo su API de plugins por simplicidad e historia; la mayoría de los casos de uso avanzados de volúmenes (snapshots, resizing, clonación) solo están disponibles en K8s con CSI. Para Docker standalone, los volumenes locales (driver `local`) y NFS (driver `local` con opts) cubren la mayoría de casos.

---

### 2. [Investigar] ¿Cómo funcionan los bind mounts a nivel de kernel y por qué tienen problemas de rendimiento en macOS y Windows con WSL 2? ¿Qué es exactamente el problema del 9p protocol?

**Respuesta**: Un bind mount en Linux (`mount --bind`) crea una segunda entrada en el VFS (Virtual File System) que apunta al mismo inodo del directorio original, sin copiar datos. Es una operación de kernel, eficiente y nativa. En macOS (Docker Desktop con Virtualization.framework) y Windows (WSL 2), el sistema de archivos del host (APFS en macOS, NTFS en Windows) debe ser accesible desde la VM Linux que corre Docker. Esto se implementa con un protocolo de red de sistema de archivos: 9p (Plan 9 file protocol) en WSL 2, y gRPC FUSE o virtio-fs en macOS. Ambos tienen overhead de red (~10x más lentos que nativo) porque cada syscall de archivo (open, read, write, stat) se traduce a un mensaje de red entre el host y la VM.

**Por qué**: El overhead de 9p en WSL 2 está bien documentado por Microsoft (devblogs.microsoft.com/commandline) y por la comunidad (issues en github.com/microsoft/WSL). Para mejorar rendimiento en desarrollo, las recomendaciones son: almacenar código en el filesystem nativo de WSL 2 (`/home/user/project`) no en `/mnt/c/` (que usa 9p), usar `:cached` o `:delegated` flags de mount consistency (Docker Desktop settings), y en macOS usar VirtioFS (más rápido que gRPC FUSE, disponible en Docker Desktop 4.6+). La causa raíz: el sistema de archivos del host y la VM son kernels diferentes (NTFS no es Linux, APFS no es Linux), y compartir requiere un protocolo de intermediación.

---

### 3. [Investigar] ¿Qué son exactamente los NFS volumes en Docker y cómo se configuran con el driver local? ¿Qué ventajas tiene NFS sobre un bind mount local en un cluster?

**Respuesta**: Docker puede montar volúmenes NFS usando el driver `local` con opciones específicas del sistema de archivos:
```
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.100,rw,soft,timeo=10 \
  --opt device=:/export/data \
  nfs-volume
```
Esto crea un volumen que Docker monta usando `mount -t nfs` del kernel. La ventaja sobre un bind mount local en un cluster: un volumen NFS es accesible desde cualquier nodo del cluster (si todos los nodos tienen acceso a la red del servidor NFS), mientras que un bind mount es local al nodo donde se ejecuta el contenedor. En Swarm, esto significa que una réplica de un servicio puede ser programada en cualquier nodo y acceder al mismo volumen NFS (shared storage).

**Por qué**: La documentación oficial de Docker (docs.docker.com/storage/volumes) cubre `--opt type=nfs` desde Docker 17.06 como syntax de `mount` syscall directa. El driver `local` es poderoso porque acepta cualquier `mount` syscall option: type puede ser nfs, cifs (Samba), xfs, ext4, etc. En producción, NFS tiene limitaciones de rendimiento y consistencia: no es adecuado para bases de datos (que requieren bloqueo a nivel de bloque, no de archivo) pero sí para assets estáticos, uploads, o configuraciones compartidas. Para bases de datos en Swarm/K8s, se usan drivers CSI que proveen block storage (iSCSI, EBS, Azure Disk) que garantizan consistencia y rendimiento.

---

### 4. [Investigar] ¿Cómo funciona exactamente el garbage collection de volúmenes en Docker y qué diferencia hay entre un volumen "en uso" y un volumen "referenciado"? ¿Qué hace `docker volume prune` realmente?

**Respuesta**: `docker volume prune` elimina volúmenes que no están siendo usados por NINGÚN contenedor (activo o detenido). "En uso" significa que el volumen aparece en la lista de `Mounts` de al menos un contenedor (vivo o detenido). "Referenciado" es más amplio: un volumen puede estar referenciado por un contenedor en `Created` (nunca iniciado) o `Exited`. El prune recorre todos los volúmenes locales (driver `local`) y para cada uno verifica si existe un contenedor (vivo o muerto) que lo monte. Si ningún contenedor lo monta, el volumen se elimina (se borra el directorio en `/var/lib/docker/volumes/<name>/`). Los volúmenes anónimos (sin nombre, con hash) NO se eliminan con prune si el contenedor fue creado con `--rm` (porque `--rm` ya los elimina al detener el contenedor).

**Por qué**: El código de Docker (daemon/prune.go) implementa la lógica de prune usando la función `getVolumesToPrune()` que consulta el state store del daemon. Es importante entender que `docker compose down` no elimina volúmenes por defecto; debés usar `docker compose down -v` explícitamente. El prune nunca elimina volúmenes montados en contenedores activos (el kernel bloquearía la operación con EBUSY de todos modos). Para automatizar limpieza sin riesgo: `docker volume prune --filter "label!=keep"` o `docker volume prune --filter "label=env=dev"`. La recomendación de seguridad: nunca ejecutar `docker volume prune -f` en producción sin filtros.

---

### 5. [Conectar] La clase muestra backup de volúmenes con tar. ¿Cómo implementarías una estrategia de backup incremental y consistente para una base de datos PostgreSQL en un volumen Docker?

**Respuesta**: Para backup consistente de PostgreSQL en Docker: 1) NO usar tar del filesystem directamente mientras postgres está corriendo (riesgo de inconsistencia). 2) Ejecutar `docker exec <pg-container> pg_dumpall -U postgres > backup.sql` para backup lógico. 3) Para backup físico (más rápido para grandes volúmenes): configurar WAL archiving (`archive_command` en postgresql.conf) a un volumen NFS o S3, ejecutar `pg_basebackup` desde un contenedor temporal. 4) Para backup incremental: usar `pgBackRest` o `WAL-G` que realizan backups incrementales a nivel de bloque con WAL streaming. 5) Automatizar con un contenedor sidecar que ejecuta el backup y sube a S3/GCS. 6) Verificar el backup restaurando en un entorno separado periódicamente.

**Por qué**: La documentación oficial de PostgreSQL (postgresql.org/docs/current/backup.html) es clara: copiar archivos de datos mientras postgres está corriendo produce backups inconsistentes a menos que uses `pg_basebackup` o `pg_start_backup()/pg_stop_backup()`. Herramientas como pgBackRest (Crunchy Data) y WAL-G (comunidad) están diseñadas para backups cloud-native con cifrado, compresión, y restauración point-in-time. En Docker, el patrón es: contenedor principal de postgres + contenedor sidecar de backup que comparte el volumen de datos (read-only) o se conecta via red para pg_dump. En K8s, CloudNativePG operator o Zalando operator incluyen backup management automático.

---

### 6. [Conectar] La clase menciona `--mount` vs `-v`. ¿Cómo se relaciona esto con la sintaxis de volúmenes en Docker Compose (both short syntax and long syntax)? ¿Qué ventajas y desventajas tiene cada formato?

**Respuesta**: En Docker Compose, la sintaxis corta para volúmenes: `- ./data:/app/data` o `- myvolume:/app/data`. La sintaxis larga:
```yaml
volumes:
  - type: bind
    source: ./data
    target: /app/data
    read_only: true
```
La sintaxis corta es más concisa y suficiente para el 90% de los casos. La sintaxis larga es necesaria cuando necesitás especificar opciones adicionales: `read_only`, `volume.nocopy` (no copiar datos iniciales del contenedor al volumen), `bind.propagation` (rprivate, rshared, rslave), o `tmpfs.size`. La sintaxis larga también es más explícita (auto-documentada) y elimina la ambigüedad de si una ruta es un volumen con nombre o un bind mount.

**Por qué**: La Compose Specification (compose-spec.io) define ambas sintaxis. La sintaxis corta depende de heurísticas: si el source empieza con `.` o `/`, es un bind mount; si no, es un volumen. Esto puede causar errores sutiles: `- data:/app` crea un volumen `data`, pero `- ./data:/app` crea un bind mount del directorio relativo. La sintaxis larga elimina la ambigüedad: `type: volume` vs `type: bind` es explícito. `volume.nocopy` es una opción poco conocida pero importante: cuando el contenedor tiene datos en el target path (ej. `/var/lib/mysql`), Docker por defecto copia esos datos al volumen. Con `nocopy: true`, el volumen queda vacío (útil cuando querés que el contenedor inicialice el volumen solo la primera vez con un script).

---

### 7. [Conectar] ¿Cómo se implementa la consistencia de datos en volúmenes compartidos entre múltiples contenedores? ¿Qué problemas de concurrencia existen y cómo se mitigan?

**Respuesta**: Docker volúmenes proveen sistema de archivos compartido, pero NO locking ni control de concurrencia. Si dos contenedores escriben al mismo archivo simultáneamente, hay riesgo de corrupción (el kernel serializa escrituras a nivel de syscall pero no garantiza atomicidad de operaciones compuestas). Las mitigaciones: 1) usar `:ro` (read-only) para contenedores que solo leen, 2) usar file locking a nivel de aplicación (flock, lockf), 3) usar un sistema de archivos con locking distribuido (NFS v4+, GlusterFS), 4) evitar volúmenes compartidos para escritura y usar en su lugar: bases de datos (que implementan su propio locking y MVCC), colas de mensajes (RabbitMQ, Kafka), o object storage (S3) que manejan consistencia eventual correctamente.

**Por qué**: El kernel Linux no implementa locking de archivos entre contenedores automáticamente. `flock()` y `fcntl(F_SETLK)` existen pero requieren que ambas aplicaciones los usen correctamente. Para bases de datos, compartir el mismo volumen de datos entre dos instancias es peligrosísimo: PostgreSQL y MySQL usan locking a nivel de archivo y buffers en memoria, y dos instancias accediendo al mismo data dir causarán corrupción. La arquitectura correcta es: un solo escritor, múltiples lectores (si la aplicación lo soporta), o usar sistemas diseñados para acceso concurrente (bases de datos, object storage). En K8s, ReadWriteOnce (RWO) es el default porque la mayoría de sistemas de archivos no soportan escritura multi-nodo segura.

---

### 8. [Cuestionar] "Las bases de datos no deberían correr en contenedores". ¿Es este un argumento válido en 2025 o es un mito perpetuado por administradores de BD tradicionales?

**Respuesta**: Era un argumento válido en 2016-2018 por falta de madurez en orquestadores y CSI. En 2025, es un mito. PostgreSQL, MySQL, MongoDB, y otras bases de datos corren exitosamente en Kubernetes con operadores como CloudNativePG, Zalando, Percona Operator, y Crunchy Data. Los problemas históricos (persistencia, IP fija, backup, alta disponibilidad) están resueltos con: statefulsets (identidad estable y PVCs por réplica), CSI (storage con snapshots y resizing), operadores (automatización de failover, backup, actualizaciones), y service mesh (encriptación mTLS entre réplicas). El contraargumento válido sigue siendo rendimiento: para cargas extremas de I/O (millones de IOPS), una BD bare-metal o en VM dedicada con storage local NVMe puede tener menos overhead que K8s + CSI + red overlay.

**Por qué**: Kelsey Hightower (Google) dijo en KubeCon 2017: "Running databases on Kubernetes is like getting a tattoo of your girlfriend's name — it seems like a good idea at the time". Pero en 2023, el mismo Kelsey actualizó: "Stateful workloads on Kubernetes have come a long way". El reporte "State of Kubernetes Database Operators 2024" de Data on Kubernetes Community (DoKC) muestra que el 70% de organizaciones encuestadas corren bases de datos en K8s en producción. Los operadores maduraron: CloudNativePG tiene 5k+ estrellas en GitHub, soporta streaming replication, backup con Barman/WAL-G, y actualización de versión sin downtime. Para el 95% de casos de uso, K8s es adecuado para BD. Para el 5% extremo (bancos, trading de alta frecuencia), bare-metal sigue siendo necesario.

---

### 9. [Cuestionar] ¿Deberías usar `tmpfs` para montar `/tmp` dentro de contenedores? ¿Es una optimización prematura o una práctica de seguridad esencial?

**Respuesta**: Es una práctica de seguridad recomendada, no optimización prematura. Montar `/tmp` como tmpfs (`--tmpfs /tmp:rw,noexec,nosuid,size=256m`): 1) evita que datos temporales se escriban en la capa de escritura del contenedor (reduciendo el tamaño del overlay diff), 2) previene que archivos temporales con información sensible (tokens, claves, archivos de sesión) persistan en disco después de detener el contenedor, 3) con `noexec` y `nosuid` previene que un atacante suba y ejecute binarios en `/tmp` (vector de ataque común). El kernel limpia automáticamente los tmpfs cuando todos los procesos que lo usan terminan. Para aplicaciones que crean archivos temporales grandes (procesamiento de imágenes, descargas), se debe dimensionar el size adecuadamente.

**Por qué**: El CIS Docker Benchmark (v1.6.0, sección 5) recomienda montar `/tmp` como tmpfs con `noexec`, `nosuid`, `nodev`. La razón de seguridad: muchos exploits escriben payloads en `/tmp` (porque es el único directorio escribible en imágenes read-only) y luego intentan ejecutarlos. Con `noexec`, incluso si un atacante sube un binario malicioso a `/tmp`, no puede ejecutarlo (el kernel rechaza mmap con PROT_EXEC). La razón de rendimiento: las escrituras en tmpfs van a RAM (no generan I/O en disco) y no se acumulan en la capa overlay del contenedor. La contrapartida: tmpfs consume memoria (no swap por defecto). Para imágenes Distroless, tmpfs es obligatorio porque el filesystem es read-only.

---

### 10. [Cuestionar] ¿Es `docker volume prune` una operación de mantenimiento rutinaria o un riesgo de pérdida de datos? ¿Debería ejecutarse automáticamente?

**Respuesta**: Es un riesgo si se ejecuta sin entender qué volúmenes existen. `docker volume prune` elimina TODOS los volúmenes que no están montados en contenedores (activos o detenidos). Si ejecutaste `docker compose down` (sin `-v`), los volúmenes nombrados sobreviven y sus datos están seguros. Pero si ejecutaste `docker compose down` + `docker volume prune`, perdés datos. El problema es el falso sentido de seguridad: "si ningún contenedor lo usa, no sirve". No es cierto: bases de datos de staging detenidas, volúmenes de backup, o datos de proyectos pausados pueden tener valor. La práctica segura: etiquetar volúmenes (`--label env=dev`, `--label keep=true`), usar `prune --filter "label=env=dev"` para limpiar solo entornos específicos, y NUNCA automatizar prune sin filtros en hosts compartidos.

**Por qué**: La documentación de Docker advierte: "Volumes are only removed if no container is using them. This includes stopped containers." (énfasis en stopped). Muchos usuarios asumen que "stopped" significa "eliminado" y pierden datos. En GitHub Issues de Docker, hay cientos de reportes de datos perdidos por prune. La práctica recomendada en equipos DevOps: 1) documentar volúmenes importantes en el README del proyecto, 2) backups periódicos (incluso de staging), 3) usar nombres descriptivos (`myapp-staging-postgres`) y evitar `prune` global, 4) si se automatiza, usar `--filter "label=auto-clean=true"` y etiquetar solo volúmenes efímeros como tales.
