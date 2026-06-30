---
sidebar_label: "Cuestionario"
---

# Cuestionario M01 — Introducción a Contenedores

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué rol juega exactamente containerd en la arquitectura de Docker y cómo se diferencia de dockerd y runc? ¿Por qué containerd se convirtió en un proyecto graduado de la CNCF independiente de Docker?

**Respuesta**: containerd es el runtime manager que gestiona el ciclo de vida completo del contenedor (pull de imágenes, creación de snapshots, gestión de storage, networking) y delega la ejecución de bajo nivel en runc. dockerd (daemon Docker) es la capa superior que expone la API REST, gestiona volúmenes, redes, Swarm, y plugins. containerd se separó de Docker en 2017 como donación a la CNCF, convirtiéndose en proyecto graduado en 2019. Hoy containerd es usado por Kubernetes directamente (a través del CRI plugin) sin necesidad de dockerd.

**Por qué**: La arquitectura actual de Docker documentada en docker.com y el GitHub de containerd muestra que dockerd llama a containerd vía gRPC, y containerd invoca runc usando la OCI runtime spec. containerd se diseñó para ser un runtime manager independiente y portable, mientras dockerd agrega la experiencia de desarrollador (CLI, Compose, Swarm). La donación a CNCF fue estratégica para permitir que Kubernetes y otros orquestadores usaran containerd como runtime sin dependencia de Docker, lo cual fue formalizado en K8s 1.20 con la deprecación de dockershim.

---

### 2. [Investigar] ¿Qué especifica exactamente la OCI Runtime Spec y por qué runc es una implementación de referencia pero no la única? Mencioná al menos dos alternativas a runc y sus diferencias.

**Respuesta**: La OCI Runtime Spec (github.com/opencontainers/runtime-spec) define el formato `config.json` y el ciclo de vida que un runtime debe implementar: create, start, state, kill, delete. Define el OCI bundle (config.json + root filesystem), hooks de prestart/poststart/poststop, Linux namespaces y capabilities, mounts, y seccomp. runc es la implementación de referencia (golang, ~100 MB), pero existen alternativas como crun (C, ~500 KB, ~4x más rápido y con soporte cgroups v2 nativo y eBPF) y youki (Rust, enfocado en seguridad de memoria). Kubernetes soporta ambos a través del CRI.

**Por qué**: El OCI Runtime Spec (v1.1.0) define explícitamente que cualquier runtime que implemente estas operaciones es compatible. crun fue desarrollado por Red Hat (Giuseppe Scrivano) para ser más rápido y ligero, y es el runtime por defecto en Podman y Fedora CoreOS. youki surgió del interés de la comunidad de Rust por tener un runtime memory-safe. La existencia de múltiples runtimes demuestra el éxito del estándar OCI: interoperabilidad real, no vendor lock-in.

---

### 3. [Investigar] ¿Qué es eBPF y cómo está impactando el ecosistema de contenedores en áreas como networking, seguridad y observabilidad? Mencioná proyectos concretos.

**Respuesta**: eBPF (extended Berkeley Packet Filter) permite ejecutar programas sandboxeados en el kernel Linux sin modificar el código fuente del kernel ni cargar módulos. En contenedores, eBPF se usa para: 1) Networking — Cilium reemplaza kube-proxy con eBPF para load balancing O(1) en lugar de iptables O(n), 2) Seguridad — Falco usa eBPF para detectar llamadas al sistema anómalas en tiempo real sin módulo de kernel, 3) Observabilidad — Pixie (New Relic) usa eBPF para tracing automático sin instrumentación. También Tetragon (Isovalent/Cilium) implementa políticas de seguridad a nivel de kernel con eBPF.

**Por qué**: Brendan Gregg (Netflix, Intel) documentó extensivamente cómo eBPF revoluciona la observabilidad (BPF Performance Tools, 2019). Thomas Graf (Cilium co-creator) demostró que eBPF puede reemplazar iptables con mejor rendimiento y más funcionalidad. La CNCF aceptó Cilium como proyecto graduado en 2023, validando eBPF como tecnología fundamental para cloud-native networking. eBPF permite inspeccionar paquetes, syscalls, y eventos del kernel con overhead mínimo (~1%), que es imposible con enfoques tradicionales de user-space.

---

### 4. [Investigar] ¿Cómo funciona Podman en modo rootless y por qué su arquitectura fork-exec se considera más segura que el modelo cliente-servidor de Docker?

**Respuesta**: Podman (Red Hat) no tiene daemon central. Cada comando podman es un proceso independiente que usa fork-exec para crear contenedores directamente mediante runc/crun, sin un proceso persistente corriendo como root. En modo rootless, Podman usa user namespaces para mapear el UID 0 del contenedor a un UID no privilegiado del host, y slirp4netns/pasta para networking sin privilegios. Docker también soporta rootless desde 2021, pero su arquitectura de daemon persiste como proceso de larga duración, lo que representa una superficie de ataque mayor.

**Por qué**: Daniel Walsh (Red Hat, creador de Podman) argumentó en múltiples charlas (DevConf, Container Plumbing Days) que eliminar el daemon reduce la superficie de ataque: no hay un proceso root escuchando en un socket esperando comandos. El modelo fork-exec significa que si matás el proceso podman, no hay nada corriendo. Podman rootless fue pionero: desde el kernel 4.18+ con user namespaces habilitados, cualquier usuario puede ejecutar contenedores sin privilegios ni membresía al grupo docker. Docker implementó rootless posteriormente (Akihiro Suda, 2019-2021), pero requiere dockerd rootless corriendo como proceso del usuario, manteniendo la arquitectura cliente-servidor.

---

### 5. [Conectar] ¿Cómo se relacionan los Linux namespaces de la clase con el concepto de "container breakout"? ¿Qué primitivas del kernel limitan realmente la capacidad de un proceso en un contenedor de escapar al host?

**Respuesta**: Los namespaces crean la ilusión de aislamiento, pero no son una barrera de seguridad completa. Un "container breakout" explota que el kernel es compartido: si un proceso dentro del contenedor logra acceder a una syscall vulnerable o adquirir capabilities no restringidas, puede escapar de los namespaces. Las barreras reales son: user namespaces (mapeo de UIDs), seccomp (filtro de syscalls, ~44 bloqueadas por defecto por Docker), capabilities (Docker dropea CAP_SYS_ADMIN y otras peligrosas), y LSMs como AppArmor/SELinux. El caso más famoso de breakout es CVE-2019-5736 (runc vulnerability) que permitía sobrescribir el binario runc del host desde dentro del contenedor.

**Por qué**: Jessie Frazelle (ex-Docker, Microsoft) ha documentado extensivamente en su blog que "los contenedores no contienen" — los namespaces aíslan visibilidad, pero la seguridad real viene de capas adicionales. La OCI Runtime Spec define hooks y configuraciones de seguridad (seccomp, capabilities, LSMs) justamente porque los namespaces solos no bastan. El ataque CVE-2019-5736 explotó el hecho de que runc (el runtime que crea el contenedor) era accesible desde dentro del contenedor vía /proc/self/exe — demostrando que sin seccomp y user namespaces restrictivos, el aislamiento de procesos es frágil.

---

### 6. [Conectar] La clase menciona OverlayFS como sistema de capas. ¿Cómo funciona exactamente a nivel de kernel el mecanismo copy-on-write y qué diferencia hay entre overlay y overlay2?

**Respuesta**: OverlayFS (incluido en el kernel Linux desde 3.18) une múltiples directorios: lowerdir (capas de solo lectura, apiladas), upperdir (capa de escritura), y workdir (directorio de trabajo interno). Cuando un proceso modifica un archivo en lowerdir, OverlayFS copia el archivo completo a upperdir (copy-up) y la modificación se aplica ahí. El archivo original en lowerdir permanece intacto. overlay2 (kernel 4.0+) extiende el número máximo de lowerdir de 2 capas a 500 usando enlaces simbólicos en un directorio de índices, y soporta xattrs nativos y rename mejorado. Docker migró de overlay a overlay2 como storage driver recomendado en 2017.

**Por qué**: La documentación del kernel Linux (Documentation/filesystems/overlayfs.txt) y la presentación de Alexander Larsson (creador de OverlayFS) detallan el mecanismo de copy-up. overlay2 es más eficiente porque reduce el consumo de inodos (usando enlaces en lugar de crear múltiples capas superpuestas) y soporta NFS como lowerdir. Miklos Szeredi (mantenedor de OverlayFS en el kernel) impulsó overlay2 para resolver el problema de "demasiadas capas" que las imágenes Docker modernas requieren (una imagen típica tiene 10-20 capas). Docker usa overlay2 con la opción `index=off` para evitar operaciones de indexado innecesarias.

---

### 7. [Conectar] ¿Cómo se relaciona el OCI Image Spec con el formato de imagen Docker tradicional y qué cambios introdujo la spec v1.1 para soportar artefactos no-contenedor?

**Respuesta**: El OCI Image Spec (github.com/opencontainers/image-spec) estandarizó el formato que Docker ya usaba: manifiestos, configs, y capas (blobs) identificados por digest SHA256. La imagen Docker y la imagen OCI son casi idénticas (misma estructura de archivos tar.gz para capas), con diferencias menores en el JSON de configuración y en el mediaType del manifiesto. La spec v1.1 (abril 2024) introdujo `artifactType` en el manifiesto para diferenciar imágenes de contenedor de otros artefactos (Helm charts, WASM modules, SBOMs) y formalizó el campo `subject` para referenciar artefactos relacionados (ej. una firma que apunta a su imagen), habilitando el ecosistema de supply chain security (Cosign, Notation).

**Por qué**: La OCI Image Spec v1.0 (2017) consolidó el formato Docker v2.2 como estándar abierto. La v1.1 fue impulsada por la necesidad de almacenar firmas y SBOMs en registries OCI sin depender de extensiones propietarias (como los `cosign.sig` tags). Steve Lasker (Microsoft, chair OCI) lideró el esfuerzo para que OCI artifacts sean ciudadanos de primera clase. Esto permite que Harbor, ECR, ACR, y cualquier registry OCI-compliant almacene y sirva cualquier tipo de artefacto cloud-native, no solo imágenes Docker.

---

### 8. [Cuestionar] "Serverless va a matar a los contenedores". ¿Es esto cierto o son tecnologías complementarias? Fundamentá con casos reales.

**Respuesta**: Son complementarias, no excluyentes. Los "serverless containers" (Cloud Run, AWS Fargate, ACI) unen ambos mundos: empaquetás tu app como contenedor (flexibilidad total de runtime y dependencias) pero la plataforma gestiona la infraestructura (escalado automático a cero, pago por uso). Kelsey Hightower (Google Cloud) popularizó la frase "Serverless is about the operational experience, not the technology". La tendencia no es "serverless mata contenedores" sino "todo se está volviendo serverless en la experiencia operativa, con contenedores como formato de empaquetado".

**Por qué**: AWS Lambda ahora soporta imágenes de contenedor (hasta 10 GB, 2021), Cloud Run siempre fue contenedores serverless, y Azure Container Apps es K8s serverless. El debate real no es contenedores vs serverless, sino cuándo usar el modelo "pago por request" (Cloud Run/Lambda) vs "pago por recurso provisionado" (K8s/ECS). Para cargas con tráfico impredecible o que escalan a cero, serverless es más económico. Para cargas estables 24/7, K8s puede ser más barato. La industria converge: Kubernetes con KEDA escala a cero Pods, y serverless platforms adoptan OCI containers como formato universal.

---

### 9. [Cuestionar] Docker Desktop cambió su licencia en 2021 exigiendo pago a empresas grandes. ¿Fue una decisión justa o un golpe a la comunidad? ¿Qué alternativas open-source surgieron como respuesta?

**Respuesta**: En agosto 2021, Docker Inc. anunció que Docker Desktop requeriría suscripción paga (Pro, Team, Business) para empresas con más de 250 empleados o $10M de ingresos. La comunidad reaccionó con indignación (muchos lo vieron como "bait and switch" después de años de uso gratuito) pero también con comprensión (Docker Inc. necesitaba un modelo de negocio sostenible). Surgieron alternativas: Colima (Lima + containerd), Rancher Desktop (K8s + containerd/ dockerd), Podman Desktop, y Finch (AWS). Todas ofrecen funcionalidad similar sin costo ni restricciones de licencia.

**Por qué**: Scott Johnston (CEO Docker Inc.) defendió la decisión en entrevistas como necesaria para la sostenibilidad financiera: Docker Desktop requería inversión significativa en ingeniería para soportar macOS y Windows con WSL 2/HyperKit. Por otro lado, empresas pequeñas, uso personal, educación, y open source siguen siendo gratuitos. El ecosistema open-source reaccionó creando alternativas maduras en meses: Colima de Abiosoft (líder), Rancher Desktop de SUSE, y Podman Desktop de Red Hat. Para desarrollo local en equipos grandes, la decisión forzó una evaluación: ¿pagar $9-24/usuario/mes por Docker Desktop o migrar a alternativas gratuitas? Muchas startups migraron a Colima exitosamente.

---

### 10. [Cuestionar] ¿Son los contenedores realmente "máquinas virtuales ligeras" o hay diferencias fundamentales que hacen esta analogía peligrosa? ¿En qué casos la analogía VM-contenedor lleva a malas prácticas?

**Respuesta**: Es una analogía peligrosa porque oscurece diferencias fundamentales. Los contenedores no virtualizan hardware, comparten el kernel con el host, y no tienen su propio sistema operativo. La analogía lleva a malas prácticas como: 1) Tratar contenedores como "pets" (hacerles `docker exec` para debuggear, aplicar parches manualmente en lugar de reconstruir la imagen), 2) Ejecutar múltiples procesos en un contenedor "como una VM", 3) Usar `docker commit` para guardar estado en lugar de Dockerfiles, 4) No implementar graceful shutdown porque "las VMs tienen ACPI shutdown", 5) Instalar SSH dentro del contenedor "para administrarlo como un servidor".

**Por qué**: Julia Evans (wizardzines.com) tiene una zine llamada "Containers aren't VMs" que explica esto visualmente. Kelsey Hightower dijo: "Stop treating containers like VMs. They're processes with isolation." La diferencia radica en que una VM es una abstracción de hardware (hypervisor emula CPU, memoria, dispositivos) mientras un contenedor es una abstracción de SO (kernel aísla procesos con namespaces). Las buenas prácticas de contenedores (un proceso, inmutabilidad, configuración externalizada) son antagónicas a las prácticas de administración de VMs. Tratar contenedores como VMs es el error más común en equipos que migran de infraestructura tradicional.
