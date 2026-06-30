---
sidebar_label: "Cuestionario"
---

# Cuestionario M13 — Seguridad en Docker

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funciona exactamente seccomp (Secure Computing Mode) y cómo Docker configura un perfil por defecto? ¿Qué syscalls bloquea y por qué esas específicamente?

**Respuesta**: seccomp es una facility del kernel Linux que filtra syscalls mediante un BPF (Berkeley Packet Filter) program. Docker genera un perfil seccomp por defecto (archivo JSON, visible en moby/moby/profiles/seccomp/default.json) que aplica a todo contenedor nuevo. El perfil usa una whitelist: ~44 syscalls bloqueadas explícitamente (SCMP_ACT_ERRNO), ~300 permitidas (SCMP_ACT_ALLOW), y el resto por defecto permitido. Las syscalls bloqueadas incluyen: `reboot` (reiniciar el host), `kexec_load` (cargar nuevo kernel), `mount` (montar filesystems, peligroso para breakout), `ptrace` (inspeccionar procesos fuera del contenedor), `personality` (cambiar personalidad del proceso), `setdomainname`/`sethostname` (cambiar identidad del host). Docker eligió estas syscalls porque no son necesarias para el 99% de las aplicaciones y son vectores de ataque comunes (privilege escalation, container breakout).

**Por qué**: La documentación del kernel (man 7 seccomp) y el perfil de Docker (github.com/moby/moby) documentan cada syscall bloqueada. El perfil usa `SCMP_ACT_ERRNO` (devuelve error EPERM) en lugar de `SCMP_ACT_KILL` (mata el proceso), porque matar un contenedor entero por una syscall no intencional es demasiado disruptivo. Administradores pueden generar perfiles personalizados con `strace` (para capturar todas las syscalls que la app realmente usa) y crear un perfil whitelist restringido a solo esas. OCI runtime spec define cómo pasar perfiles seccomp en `config.json`. Para máxima seguridad: perfil whitelist por aplicación (solo las syscalls necesarias, ~50-100 para una app típica, en lugar de ~300).

---

### 2. [Investigar] ¿Qué es Falco y cómo implementa detección de amenazas en tiempo real para contenedores usando eBPF? ¿Qué tipo de comportamientos anómalos puede detectar?

**Respuesta**: Falco (Sysdig, proyecto CNCF graduado) es un runtime security tool que monitorea syscalls en tiempo real usando un módulo de kernel o eBPF probe, y evalúa reglas de comportamiento contra un stream de eventos. Detecta comportamientos anómalos como: 1) Un contenedor nginx ejecutando un shell (`/bin/sh`, `bash`) o descargando archivos (`curl`, `wget`) — posible RCE, 2) Escritura en directorios de binarios (`/bin/`, `/usr/bin/`), 3) Acceso a archivos sensibles del host (`/etc/shadow`), 4) Conexiones de red salientes a IPs sospechosas, 5) Montaje de filesystems desde dentro del contenedor, 6) Cambio de user namespace o capabilities, 7) Spawning de procesos inesperados (un contenedor de Redis ejecutando `cron`). Las reglas se definen en YAML (macros, lists, conditions) y se evalúan en tiempo real.

**Por qué**: Falco fue creado por Loris Degioanni (Sysdig, ex-Wireshark) basado en la libsinsp que captura syscalls con overhead mínimo. La versión con eBPF (Falco 0.20+) usa eBPF probes en lugar de un módulo de kernel, eliminando la necesidad de compilar módulos. Falco se integra con sistemas de alerta (Slack, PagerDuty, webhooks) y SIEMs (Splunk, Elasticsearch). Las reglas por defecto incluyen el CIS Benchmark y el MITRE ATT&CK framework para contenedores. Falco es parte del ecosistema de Cloud Native Runtime Security junto con Tracee (Aqua) y Tetragon (Isovalent). La filosofía: los contenedores deben comportarse de manera predecible; cualquier desviación es sospechosa y merece alerta.

---

### 3. [Investigar] ¿Qué son exactamente los perfiles de AppArmor y SELinux y cómo Docker los usa? ¿Qué diferencia hay entre ambos y cuál elegirías para producción?

**Respuesta**: AppArmor y SELinux son LSMs (Linux Security Modules) — sistemas de control de acceso obligatorio (MAC) integrados en el kernel. Docker puede aplicar perfiles a contenedores con `--security-opt apparmor=<profile>` o `--security-opt label=type:<selinux_type>`. AppArmor usa perfiles basados en paths: define qué archivos, capabilities, y recursos puede acceder un proceso (ej. `/usr/bin/nginx { /var/www/** r, /etc/nginx/** r, ... }`). SELinux usa etiquetas (labels) en cada objeto (archivo, socket, proceso) y políticas que definen qué transiciones entre labels son permitidas. AppArmor es más simple (basado en paths, más fácil de escribir perfiles). SELinux es más granular y seguro (basado en labels, sigue el principio de "deny by default"). Docker incluye un perfil AppArmor por defecto (`docker-default`) que restringe capabilities y acceso a paths sensibles. Para producción, SELinux es más robusto pero más complejo; AppArmor es más accesible y todavía muy efectivo.

**Por qué**: SELinux fue desarrollado por la NSA y Red Hat (RHEL lo habilita por defecto). AppArmor fue desarrollado por Immunix/Canonical (Ubuntu lo habilita por defecto). Docker genera automáticamente un perfil AppArmor para cada contenedor basado en el perfil base `docker-default` con las capabilities y paths que el contenedor necesita. Para SELinux, Docker asigna automáticamente un label MCS (Multi-Category Security) único a cada contenedor, aislando contenedores entre sí (incluso si ambos corren como root). El CIS Docker Benchmark recomienda habilitar tanto AppArmor/SELinux como sea posible. La elección práctica: si tu SO es Ubuntu/Debian → AppArmor. Si es RHEL/CentOS/Fedora → SELinux.

---

### 4. [Investigar] ¿Qué es exactamente Docker Scout y cómo implementa el análisis de "supply chain" más allá del escaneo de vulnerabilidades? ¿Qué diferencia hay con Trivy?

**Respuesta**: Docker Scout (Docker Inc., 2022) es un servicio de análisis de software supply chain integrado con Docker que va más allá del escaneo de CVEs: 1) **SBOM generation** (lista completa de componentes), 2) **Remediation recommendations** (sugiere actualizaciones de imagen base que resuelven CVEs), 3) **Policy evaluation** (define políticas como "no CRITICAL CVEs", "imagen base debe ser <30 días"), 4) **Dependency graph** (visualiza dependencias transitivas — qué paquete introdujo la vulnerabilidad), 5) **Contextual analysis** (evalúa si la vulnerabilidad es explotable en tu contexto de uso, no solo si existe), 6) **Continuous monitoring** (escanea imágenes en Docker Hub automáticamente, sin re-escanear manualmente). Trivy (Aqua, open-source) se enfoca en detectar CVEs y misconfigurations con escaneo rápido y bajo la línea de comandos. Scout es una plataforma (con UI web en Docker Hub) que agrega remediación y políticas.

**Por qué**: Docker Scout fue presentado en DockerCon 2022 como la respuesta de Docker a la creciente importancia de supply chain security. Está incluido en Docker Pro/Team/Business subscriptions. Trivy es open-source, gratuito, y funciona offline (sin depender de SaaS). Scout usa los mismos datos de vulnerabilidad (NVD, distribuciones Linux) pero agrega la capa de "qué hacer al respecto". La integración con Docker Hub permite que cada push a un repositorio active un escaneo automático y los resultados sean visibles en la UI. Para equipos que ya usan Docker Hub y tienen Docker subscription, Scout es conveniente. Para equipos que prefieren open-source o necesitan escaneo en CI offline, Trivy es la opción.

---

### 5. [Conectar] La clase menciona `--cap-drop ALL`. ¿Cómo se relacionan las capabilities con los user namespaces? ¿Un contenedor que corre como root con capabilities restringidas es realmente seguro?

**Respuesta**: Con `--cap-drop ALL --cap-add NET_BIND_SERVICE`, el usuario root dentro del contenedor tiene su poder drásticamente reducido: no puede montar filesystems, modificar el reloj del sistema, cargar módulos de kernel, o hacer ptrace. PERO sigue siendo root (UID 0 dentro del contenedor): puede leer/escribir cualquier archivo con permisos de root del sistema de archivos del contenedor, bindear a puertos permitidos, y acceder a recursos del kernel que no requieren capabilities. Con user namespaces (`--userns-remap default` o el mapeo en daemon.json), el root del contenedor se mapea a un UID no privilegiado en el host (ej. UID 100000). Esto significa que incluso si root dentro del contenedor logra escapar (ej. explotando una vulnerabilidad del kernel), en el host es un usuario sin privilegios. La combinación es defensa en profundidad: capabilities reducen lo que root puede hacer dentro del contenedor, user namespaces protegen el host si el contenedor es comprometido.

**Por qué**: La documentación de kernel (man 7 user_namespaces, man 7 capabilities) explica esta interacción. Las capabilities son efectivas DENTRO del user namespace. Un proceso con UID 0 en un user namespace tiene capacidades plenas DENTRO de ese namespace, pero en el namespace padre (host) su UID es 100000 (sin privilegios). Docker con `--userns-remap` habilita user namespaces por defecto para todos los contenedores. Esto es configurable en `/etc/docker/daemon.json` con `userns-remap: default` y `/etc/subuid` + `/etc/subgid`. Es una de las features de seguridad más efectivas y menos usadas (porque requiere configuración inicial y algunas operaciones como bind mounts de paths del host son más complejas).

---

### 6. [Conectar] ¿Qué es exactamente Docker Content Trust (DCT) y cómo se relaciona con The Update Framework (TUF) y Notary? ¿Cómo protege contra ataques de supply chain?

**Respuesta**: DCT (Docker Content Trust) usa Notary (proyecto CNCF) que implementa TUF (The Update Framework) para firmar y verificar imágenes. Con DCT habilitado (`export DOCKER_CONTENT_TRUST=1`), al hacer `docker pull`: 1) Docker descarga el manifiesto de la imagen, 2) Contacta al servidor Notary asociado al registry para verificar la firma del tag, 3) Notary verifica la cadena de confianza TUF: root key → target key → tag signature, 4) Si la firma no coincide o no existe, Docker rechaza la imagen. Esto protege contra: ataques de "man in the middle" (modificación de la imagen en tránsito), compromise del registry (un atacante reemplaza la imagen), y suplantación de identidad (imagen con tag `official` pero firmada por un atacante). TUF agrega layers de seguridad: root key offline, timestamp key para prevenir replay attacks, y snapshot key para consistencia del repositorio.

**Por qué**: TUF fue desarrollado por Justin Cappos (NYU) y la comunidad de Python (PEP 458) para proteger PyPI. Notary (Docker Inc., donado a CNCF) implementa TUF para el ecosistema Docker. La jerarquía de claves en DCT: Root key (offline, usada solo para rotar otras claves), Repository key (firma los tags de un repositorio), Snapshot key (firma el snapshot del estado del repositorio), Timestamp key (firma el timestamp para prevenir replay). DCT está siendo gradualmente reemplazado por Cosign/Sigstore (más simple, keyless signing), pero el concepto de TUF sigue siendo relevante.

---

### 7. [Conectar] ¿Cómo funciona `docker run --read-only` y en qué casos es aplicable? ¿Cómo manejás directorios que necesitan escritura (como `/tmp` o `/var/run`)?

**Respuesta**: `--read-only` monta el sistema de archivos raíz del contenedor como read-only (a nivel de kernel, no se puede escribir en ninguna parte del filesystem de la imagen). Es aplicable para aplicaciones stateless que no necesitan escritura en disco (la mayoría de los microservicios, APIs, workers). Para directorios que NECESITAN escritura, montás tmpfs o volúmenes writeables en paths específicos: `--tmpfs /tmp:rw,noexec,nosuid,size=256M`, `-v /var/run`, `-v app-data:/data`. Esto implementa el principio de "mínimo filesystem escribible": la aplicación solo puede escribir donde explícitamente le das permiso. Ventajas de seguridad: 1) un atacante no puede modificar binarios o configuraciones de la aplicación, 2) malware no puede persistirse (al reiniciar, el tmpfs está limpio), 3) previene escritura accidental de logs o archivos que llenan la capa overlay.

**Por qué**: `--read-only` configura el mount del root filesystem con `ro` flag (en el spec de OCI: `readonlyRootfs: true`). Docker recomienda `--read-only` en las Docker Security Best Practices. Para aplicaciones que escriben logs a archivos, la app debe configurarse para escribir a stdout/stderr (que Docker captura sin necesidad de filesystem). Para aplicaciones que generan archivos temporales (uploads), montás un volumen persistente o tmpfs. En K8s, `securityContext.readOnlyRootFilesystem: true` es el equivalente y es recomendado por el CIS K8s Benchmark.

---

### 8. [Cuestionar] "Root en un contenedor es root en el host". ¿Es esto cierto o un mito? ¿Qué protecciones existen entre root del contenedor y root del host?

**Respuesta**: Es una simplificación peligrosa pero con algo de verdad. Por defecto (sin user namespaces), el UID 0 dentro del contenedor es el MISMO UID 0 en el host (el kernel no distingue). Sin embargo, las capabilities de ese root están restringidas por Docker (por defecto, Docker dropea ~25 capabilities peligrosas). Además, seccomp bloquea syscalls peligrosas. Entonces: root del contenedor NO es idéntico a root del host (no puede hacer `reboot`, `mount`, `kexec`), pero sigue siendo UID 0 con más de 10 capabilities permitidas, y si encuentra una vulnerabilidad del kernel o una capability no restringida, PUEDE escalar a root del host. La afirmación correcta es: "Root en un contenedor con configuración por defecto tiene menos privilegios que root en el host, pero sigue siendo peligroso y debe evitarse". Con user namespaces habilitados, root del contenedor se mapea a un usuario no privilegiado en el host, haciendo la afirmación falsa.

**Por qué**: Jessie Frazelle (ex-Docker) y Liz Rice (Isovalent) han dado charlas demostrando container breakouts. El CVE-2019-5736 (runc vulnerability) permitió a un root de contenedor sobrescribir el binario runc en el host, escalando a root real. Los researchers de Aqua Security y Palo Alto Unit 42 han demostrado múltiples escapes. La defensa: 1) nunca correr como root en producción (USER no-root), 2) `--cap-drop ALL --cap-add` solo lo necesario, 3) `--security-opt no-new-privileges`, 4) user namespaces, 5) seccomp profiles estrictos, 6) AppArmor/SELinux. Ninguna capa sola es suficiente.

---

### 9. [Cuestionar] ¿Es `docker run --privileged` alguna vez aceptable en producción? ¿Qué casos de uso lo justifican y cómo mitigás el riesgo?

**Respuesta**: `--privileged` es raramente aceptable en producción. Casos que lo "justifican": 1) Docker-in-Docker (dind) para CI/CD runners (aunque `sysbox` o `rootless` son alternativas más seguras), 2) Contenedores que necesitan acceso a hardware real (dispositivos USB, GPU), 3) Herramientas de monitoreo del kernel (eBPF-based, aunque `CAP_BPF` es suficiente), 4) Contenedores de red avanzada (que necesitan manipular iptables, rutas). Mitigaciones si es inevitable: 1) Aislar en un namespace/user separado con user namespaces, 2) Aplicar seccomp profile restrictivo incluso al contenedor privileged, 3) Ejecutar como usuario no-root (paradojico pero posible: `--privileged --user 1000`), 4) Usar `--security-opt` adicionales, 5) CORRER en un nodo dedicado y aislado del resto del cluster, 6) Usar herramientas como `sysbox` (Nestybox) que implementan contenedores "privileged" pero con user namespaces y aislamiento adicional.

**Por qué**: La documentación de Docker advierte que `--privileged` es peligroso. Herramientas como dind se usan ampliamente en CI/CD (GitLab CI, Tekton) con `--privileged`, pero la tendencia es reemplazarlo con rootless Docker o sysbox. Sysbox (Nestybox, ahora parte de Docker) implementa un "sys container" que puede ejecutar Docker interno sin `--privileged`, usando user namespaces avanzados y capacidades específicas. Para 2025, la mayoría de los casos de `--privileged` tienen alternativas más seguras.

---

### 10. [Cuestionar] ¿Deben las organizaciones adoptar "zero trust" en la red de contenedores (mTLS, NetworkPolicy) o es suficiente con firewalls perimetrales tradicionales?

**Respuesta**: Zero trust es necesario en entornos de contenedores modernos porque el perímetro tradicional desaparece: los contenedores son efímeros, las IPs cambian constantemente, y los servicios se comunican entre sí dentro del cluster (tráfico este-oeste) que nunca atraviesa el firewall perimetral. Un atacante que compromete un solo contenedor puede moverse lateralmente a otros servicios internos sin ser detectado por firewalls de borde. Zero trust con mTLS (Service Mesh como Istio/Linkerd/Cilium) + NetworkPolicy implementa: 1) Toda comunicación entre servicios es autenticada y cifrada (mTLS), 2) Solo se permite comunicación explícitamente declarada (NetworkPolicy deny-all + allow específico), 3) La identidad del servicio (SPIFFE) es verificable criptográficamente, no basada en IP. Esto es necesario incluso en redes "internas" porque el insider threat es real.

**Por qué**: El paper de Google "BeyondCorp" (2014) y el de Netflix sobre service mesh documentan la necesidad de zero trust. El CIS K8s Benchmark recomienda NetworkPolicy como control esencial. Incidentes reales (Capital One breach 2019, Tesla cryptojacking 2018) involucraron movimientos laterales dentro del cluster que firewalls perimetrales no detectaron. La implementación práctica: NetworkPolicy + mTLS con Istio/Linkerd/Cilium + runtime security con Falco.
