---
sidebar_label: "Cuestionario"
---

# Cuestionario M02 — Instalación y Configuración

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funciona exactamente Docker en modo rootless y qué primitivas del kernel Linux utiliza para permitir que un usuario sin privilegios ejecute contenedores? ¿Qué limitaciones tiene comparado con el modo root?

**Respuesta**: Docker rootless (introducido en Docker 19.03 como experimental, estable en 20.10) ejecuta dockerd y containerd como procesos de usuario sin privilegios, usando: 1) user namespaces para mapear UID 0 dentro del contenedor a un UID no privilegiado del host (~100000+), 2) rootlesskit (de Akihiro Suda) que crea un network namespace con slirp4netns o pasta para networking TCP/UDP sin necesidad de iptables ni NET_ADMIN capability, 3) fuse-overlayfs para el sistema de capas (ya que overlay2 requiere CAP_SYS_ADMIN). Limitaciones: no se puede usar `--network host`, no se pueden publicar puertos < 1024, no soporta ping (ICMP requiere raw sockets), y fuse-overlayfs es más lento que overlay2 nativo.

**Por qué**: Akihiro Suda (NTT, mantenedor de containerd y rootless Docker) presentó rootless Docker en DockerCon 2019 y documentó la arquitectura en github.com/rootless-containers. Rootless usa `unshare --user` para crear un user namespace donde el usuario es "falso root". Las limitaciones de networking se resuelven con slirp4netns (usermode TCP/IP stack, creado por Akihiro Suda) y pasta (de Red Hat, más rápido, incluido en passt). La limitación de overlay2 nativo (requiere CAP_SYS_ADMIN para montar) se resuelve con fuse-overlayfs, un driver FUSE que implementa OverlayFS en userspace. Rootless mode es ideal para entornos de desarrollo, CI/CD multi-tenant, y HPC donde los usuarios no deben tener acceso root al host.

---

### 2. [Investigar] ¿Qué es LinuxKit y cómo Docker lo utiliza internamente en Docker Desktop para crear la VM Linux que corre los contenedores? ¿Qué relación tiene con el proyecto Moby?

**Respuesta**: LinuxKit es un toolkit open-source (parte del proyecto Moby, iniciado por Docker Inc.) para construir sistemas operativos Linux mínimos, inmutables y seguros. Cada componente (kernel, init, containerd, SSH, etc.) se define como una imagen de contenedor en un archivo YAML. Docker Desktop usa LinuxKit para construir la VM Linux ligera (~60 MB) que corre dentro de Hyper-V (Windows) o Virtualization.framework (macOS). Esta VM contiene solo lo necesario: un kernel Linux configurado para contenedores, containerd, y servicios mínimos. Moby es el proyecto "upstream" de Docker que separa los componentes open-source (LinuxKit, containerd, runc, BuildKit) del producto comercial Docker.

**Por qué**: LinuxKit fue anunciado en DockerCon 2017 por Solomon Hykes (fundador de Docker) como parte del proyecto Moby. La filosofía es "container-native OS": cada servicio corre como contenedor, incluso dentro de la VM. LinuxKit genera una imagen bootable (ISO, initrd, o VHD) que se inicia directamente sin instalación. En Docker Desktop, LinuxKit genera la VM que corre internamente; cada actualización de Docker Desktop incluye una nueva build de LinuxKit con kernel y componentes actualizados. Esto explica por qué Docker Desktop puede ser tan ligero comparado con una VM tradicional de Linux: no incluye systemd, package manager, ni software innecesario. Rancher Desktop usa un enfoque similar pero con su propia distribución (k3s en VM).

---

### 3. [Investigar] ¿Qué diferencia hay entre instalar Docker Engine directamente en Windows Server (con procesos de Windows) frente a Docker Desktop con WSL 2? ¿Por qué existen dos arquitecturas tan diferentes?

**Respuesta**: Docker en Windows tiene dos modos: 1) Windows Server containers: usan namespaces y cgroups del kernel Windows NT para ejecutar procesos Windows directamente (sin VM), solo sirven imágenes Windows. 2) Docker Desktop con backend Linux (WSL 2 o Hyper-V): ejecutan una VM Linux dentro de Windows para correr contenedores Linux. Son arquitecturas fundamentalmente diferentes: Windows Server containers comparten el kernel Windows y aíslan procesos Windows (equivalente a contenedores Linux pero en NT), mientras Docker Desktop virtualiza Linux. La razón es que los contenedores Linux requieren kernel Linux, que no existe en Windows sin virtualización.

**Por qué**: Microsoft implementó "Windows Containers" en Windows Server 2016 usando el kernel NT: namespaces de NT (silons para filesystem, registry, network), cgroups (Job Objects), y un runtime (Host Compute Service, HCS) en lugar de runc. La documentación de Microsoft (docs.microsoft.com/en-us/virtualization/windowscontainers) detalla esta arquitectura. Docker Engine en Windows Server puede ejecutar solo contenedores Windows (imágenes basadas en `windows/servercore`). Para correr contenedores Linux en Windows, siempre se necesita una VM Linux (WSL 2 o Hyper-V). Docker Desktop abstrae esto con un switch gráfico "Switch to Windows containers / Switch to Linux containers" que cambia el daemon y el backend.

---

### 4. [Investigar] ¿Qué es exactly `docker context` y cómo implementa la conexión a múltiples daemons? ¿Qué diferencia hay entre un context de Docker y un kubeconfig de Kubernetes?

**Respuesta**: `docker context` es un mecanismo para gestionar múltiples endpoints de Docker (daemons locales, remotos, o endpoints cloud) almacenando el endpoint, certificados TLS, y configuración en `~/.docker/contexts/`. Internamente, cada contexto es un directorio con metadata (endpoint, CA, cert, key) que el CLI Docker carga al cambiar de contexto. A diferencia del kubeconfig de K8s (que es un archivo YAML con múltiples clusters, usuarios, y namespaces), los contexts de Docker son directorios separados en el filesystem con archivos PEM para TLS y un JSON de configuración. Docker soporta contextos para ECS (via docker/ecs-plugin) y ACI (via docker/aci-plugin).

**Por qué**: `docker context` fue introducido en Docker 19.03 para reemplazar las variables de entorno `DOCKER_HOST`, `DOCKER_TLS_VERIFY`, `DOCKER_CERT_PATH`. Antes, cambiar de entorno requería setear 3-4 variables manualmente. Los contexts encapsulan toda la configuración en un perfil nombrado. `docker context create prod --docker "host=tcp://prod:2376,ca=ca.pem,cert=cert.pem,key=key.pem"`. El kubeconfig de K8s es más expresivo (soporta múltiples clusters, usuarios con diferentes credenciales, y namespaces por contexto), pero el concepto es similar. Los contextos cloud (ECS/ACI) usan plugins que traducen `docker compose up` a deployments en la nube, sin que el usuario vea infraestructura subyacente.

---

### 5. [Conectar] La clase menciona overlay2 como storage driver. ¿Cómo se compara con btrfs y zfs como storage drivers alternativos, y en qué escenarios serían preferibles a overlay2?

**Respuesta**: overlay2 es el driver universal recomendado. btrfs (B-tree filesystem) y zfs (Zettabyte Filesystem) son filesystems completos que Docker puede usar como storage driver nativo en lugar de overlay2. btrfs usa subvolúmenes y snapshots para implementar capas (cada capa es un snapshot CoW del filesystem), y soporta compresión y deduplicación nativas. zfs usa datasets y clones para capas, con compresión, snapshots instantáneos y send/receive para backup incremental. Serían preferibles a overlay2 en servidores que ya usan btrfs/zfs como sistema de archivos raíz (ej. Ubuntu con ZFS, Synology NAS con btrfs), o cuando necesitás features avanzadas de snapshot/rollback a nivel de filesystem.

**Por qué**: La documentación oficial de Docker (docs.docker.com/storage/storagedriver) lista overlay2 como preferido para todas las distribuciones modernas. btrfs y zfs son filesystems CoW completos (no solo para Docker), lo que significa que las capas de imágenes se benefician de deduplicación a nivel de bloque. ZFS en particular ofrece `zfs send/receive` que permite migrar imágenes y contenedores entre hosts con snapshots incrementales, similar a `docker save` pero a nivel filesystem. La desventaja es la complejidad: overlay2 funciona en cualquier filesystem (ext4, xfs), mientras btrfs/zfs requieren que el sistema de archivos del host esté formateado con esos filesystems. Para la mayoría de los casos, overlay2 sobre xfs/ext4 es la recomendación.

---

### 6. [Conectar] ¿Cómo funciona el Docker Socket (`/var/run/docker.sock`) y por qué exponerlo a un contenedor es equivalente a dar acceso root al host? ¿Qué alternativas seguras existen?

**Respuesta**: `/var/run/docker.sock` es un socket Unix que expone la API REST del daemon Docker. Cualquier proceso que pueda escribir en este socket puede ejecutar comandos Docker, incluyendo `docker run -v /:/host --privileged`, que monta el filesystem raíz del host dentro del contenedor, otorgando acceso root completo al host. Exponer el socket a un contenedor (ej. para que Jenkins construya imágenes, o Portainer) significa que si ese contenedor es comprometido, el atacante obtiene root en el host. Alternativas seguras: 1) TCP con TLS y autenticación (más complejo), 2) docker-socket-proxy (de Tecnativa, expone solo endpoints específicos con filtrado REST), 3) usar Kaniko o BuildKit sin acceso al daemon, 4) Podman sin daemon.

**Por qué**: El socket Unix hereda los permisos del sistema de archivos (propiedad root:docker, permisos 660). Cualquier usuario en el grupo `docker` (o root) puede escribir en él. La API REST de Docker no tiene granularidad de permisos: si podés hablar con el socket, podés hacer cualquier cosa (incluso cambiar configuraciones del daemon). El proxy de Tecnativa (github.com/Tecnativa/docker-socket-proxy) agrega una capa HAProxy que filtra las rutas de API permitidas: podés dar acceso a `/containers/json` (listar) pero no a `/containers/create` (crear), implementando RBAC rudimentario sobre la API de Docker. En Kubernetes, montar `/var/run/docker.sock` en un Pod es una vulnerabilidad de seguridad crítica documentada en el CIS Benchmark.

---

### 7. [Conectar] ¿Qué son exactamente los storage drivers `devicemapper` y `aufs` y por qué fueron deprecados en favor de overlay2? ¿Qué problema de diseño fundamental tenían?

**Respuesta**: aufs (Another UnionFS) fue el primer storage driver de Docker (~2013-2016). Implementaba un union filesystem a nivel de archivo, pero nunca fue aceptado en el kernel Linux mainline, requiriendo un módulo de kernel externo que debía compilarse para cada versión de kernel — esto es lo que lo mató. devicemapper (2014-2018) operaba a nivel de bloque usando thin provisioning (LVM thin pools): creaba un dispositivo de bloque virtual de 10 GB por contenedor, con snapshots para capas. El problema: usaba asignación estática de espacio (si configuraste 10 GB, ocupaba 10 GB en el pool incluso vacío), tenía latencia de I/O significativa (operaba a nivel de bloque, no de archivo), y requería configuración manual del thin pool. overlay2 opera a nivel de archivo (es más rápido porque el kernel puede cachear a nivel de page cache), no requiere configuración especial, y está en el kernel mainline.

**Por qué**: La historia de storage drivers de Docker es una lección de "usar lo que está en el kernel, no módulos externos". aufs era excelente técnicamente pero la dependencia de un módulo externo fue insostenible (los usuarios de Ubuntu lo tenían, los de RHEL no). devicemapper era una solución de compromiso para kernels sin overlay2 pero su modelo de bloque era ineficiente. La documentación de Docker (moby/moby) y issues en GitHub (incluidos posts de Solomon Hykes) muestran que el equipo siempre quiso overlay2, pero tuvo que esperar a que fuera estable y estuviera disponible en kernels LTS (RHEL/CentOS 7 no tenía overlay2 estable). Desde Docker 18.09, overlay2 es el único driver recomendado y los demás están deprecados.

---

### 8. [Cuestionar] La controversia de la licencia de Docker Desktop 2021: ¿fue un movimiento necesario para la supervivencia de Docker Inc. o alienó a la comunidad que construyó el ecosistema?

**Respuesta**: Docker Inc. enfrentaba un dilema: Docker Desktop era usado masivamente pero no generaba ingresos, y la empresa había quemado cientos de millones en VC sin un modelo de negocio claro después de vender su negocio enterprise a Mirantis (2019). La decisión de cobrar a empresas grandes ($10M+ revenue o 250+ empleados) fue pragmática: el segmento enterprise puede pagar y efectivamente paga por herramientas similares (IntelliJ, GitLab, GitHub Enterprise). La comunidad open-source pequeña, educación y uso personal siguen siendo gratuitos. El contraargumento: Docker Inc. se benefició durante años de la comunidad que promovió Docker; cobrar ahora fue visto como "bait and switch". La reacción masiva de migración a Colima/Rancher Desktop demuestra que la comunidad sintió la decisión como una traición.

**Por qué**: Scott Johnston (CEO) explicó en blogs oficiales que el 50%+ de los ingresos de Docker Inc. ahora vienen de Docker Desktop subscriptions, validando la decisión desde el punto de vista financiero. Sin embargo, Alex Ellis (OpenFaaS) y otros líderes comunitarios criticaron que Docker Inc. abandonó el open-source (vendió Docker Hub, Docker Enterprise a Mirantis) para enfocarse en monetizar el desktop. La realidad es que Docker Desktop es un producto excelente (integración WSL 2, Kubernetes, extensiones) con ingeniería significativa que justifica el costo para empresas. La comunidad se benefició de la competencia que surgió (Colima, Rancher Desktop, Podman Desktop) que elevó la calidad de las alternativas open-source.

---

### 9. [Cuestionar] ¿Colima vs Docker Desktop vs Rancher Desktop vs Podman Desktop: cuál debería elegir un equipo de desarrollo en 2025 y por qué?

**Respuesta**: Depende del ecosistema: Docker Desktop es la opción más pulida (WSL 2 integration, Kubernetes integrado, extensiones, soporte empresarial) y vale su costo para empresas. Colima es la mejor opción gratuita para usuarios de macOS/Linux que solo necesitan contenedores Docker (rápido, minimalista, configuración simple vía YAML). Rancher Desktop es ideal si tu target de producción es Kubernetes (incluye k3s, helm, traefik, y una UI de gestión). Podman Desktop es la opción si tu organización estandariza en Red Hat o quiere funcionalidades avanzadas de Podman (rootless desde el inicio, pods nativos, systemd integration). Para un equipo que no tiene restricción de presupuesto: Docker Desktop. Para un equipo que prioriza open-source y no necesita características avanzadas: Colima + docker CLI.

**Por qué**: La comparativa de alternativas fue cubierta extensamente por blogs como Earthly (earthly.dev) y en HackerNews (2022-2024). Colima (Abiosoft) lidera en simplicidad: `brew install colima && colima start` y tenés Docker funcionando. Usa Lima con containerd + dockerd, soporta Kubernetes (k3s), y es configurable. Rancher Desktop (SUSE) es más pesado pero ofrece una experiencia K8s completa. Podman Desktop (Red Hat) tiene la ventaja de sin-daemon y compatibilidad con systemd, pero la compatibilidad con el ecosistema Docker (docker-compose, herramientas que esperan docker.sock) puede tener fricciones. Los benchmarks independientes muestran que el rendimiento es similar entre todos (la VM subyacente es el bottleneck, no la herramienta).

---

### 10. [Cuestionar] ¿Debe Docker Engine ser la única forma de ejecutar contenedores o la estandarización OCI significa que deberíamos movernos hacia runtimes más especializados (containerd directo, CRI-O, Podman)?

**Respuesta**: La estandarización OCI ya logró que el runtime no importe para la mayoría de los casos: Kubernetes usa containerd directamente (vía CRI) desde la deprecación de dockershim (K8s 1.24). Podman implementa la misma OCI spec sin daemon. Docker Engine sigue siendo valioso por su ecosistema (Compose, Swarm, plugins, tooling masivo) y experiencia de desarrollador pulida. El argumento para moverse a runtimes especializados es: contienen lo justo y necesario sin carry-on de features no usadas, menor superficie de ataque (sin API REST expuesta), y mejor integración con el modelo de orquestación (K8s no necesita dockerd). El contrapunto: para desarrollo local y workflows no-K8s, Docker Engine es insustituible en practicidad.

**Por qué**: La deprecación de dockershim en Kubernetes (anunciada en 2020, efectiva en 1.24, 2022) fue el evento canónico que demostró que Docker Engine no es necesario para correr contenedores en producción. K8s habla CRI, y containerd/CRI-O implementan CRI nativamente. Tim Hockin (Google, co-creador de K8s) explicó en el blog de K8s que dockershim era una capa de compatibilidad costosa de mantener, y eliminarla simplificó K8s. Para producción en K8s: containerd o CRI-O. Para desarrollo: Docker sigue siendo el estándar de facto. La tendencia a largo plazo es que el runtime sea un commodity y el valor esté en la orquestación (K8s) y la experiencia de desarrollo.
