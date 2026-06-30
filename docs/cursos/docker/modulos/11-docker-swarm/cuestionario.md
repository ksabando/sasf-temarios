---
sidebar_label: "Cuestionario"
---

# Cuestionario M11 — Docker Swarm

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funciona exactamente el algoritmo Raft en Swarm? Describí el proceso de elección de líder, replicación de logs, y qué ocurre durante una partición de red (split-brain).

**Respuesta**: Raft (Diego Ongaro, 2014) es un algoritmo de consenso donde un cluster de managers elige un líder que recibe todas las escrituras y las replica a los followers. El proceso: 1) **Leader election**: cada manager tiene un timeout de elección aleatorio (150-300ms). Si un follower no recibe heartbeat del líder dentro de ese timeout, se convierte en candidato, incrementa su término, vota por sí mismo, y solicita votos de otros managers. Si recibe mayoría, es el nuevo líder. 2) **Log replication**: el líder recibe un comando (ej. crear servicio), lo agrega a su log, y envía AppendEntries a los followers. Cuando la mayoría confirma, el líder commitea la entrada y aplica el cambio. 3) **Split-brain**: si una partición de red divide el cluster en dos grupos, solo el grupo con mayoría (quorum) puede elegir líder y continuar operando. El grupo minoritario no puede elegir líder ni aceptar escrituras (se vuelve read-only). Cuando la partición se resuelve, los nodos del grupo minoritario se reintegran y sus logs divergentes se sobrescriben con los del líder.

**Por qué**: La tesis doctoral de Diego Ongaro (Stanford, "In Search of an Understandable Consensus Algorithm") es la referencia canónica sobre Raft. Swarm implementa Raft usando la biblioteca etcd-io/raft (la misma que usa etcd). El Raft log de Swarm se almacena en `/var/lib/docker/swarm/raft/`. Cada manager tiene un ID único y participa en el grupo Raft. El número de managers debe ser impar (3, 5, 7) para maximizar tolerancia a fallos. El quorum es (N/2)+1. Con 3 managers, quorum=2, tolerancia=1 fallo. Con 5 managers, quorum=3, tolerancia=2. La elección de líder típicamente toma <1 segundo.

---

### 2. [Investigar] ¿Qué es SwarmKit y cómo se relaciona con Docker Swarm? ¿Qué otros proyectos usan SwarmKit?

**Respuesta**: SwarmKit (github.com/moby/swarmkit) es el toolkit open-source de orquestación que implementa el núcleo de Docker Swarm: Raft consensus, scheduler, dispatcher, allocator, service management, networking, y secrets. Docker Swarm es esencialmente Docker Engine + SwarmKit integrado. SwarmKit fue separado del código de Docker en 2016-2017 como parte del proyecto Moby, para permitir que otros proyectos usaran el orquestador sin dependencia de Docker Engine. Proyectos que usan SwarmKit: **InfraKit** (Docker, toolkit para infraestructura declarativa), **Docker App** (experimental, Docker application format), y varios proyectos académicos y de investigación.

**Por qué**: Andrea Luzzardi y el equipo de Docker (antes de la venta a Mirantis) diseñaron SwarmKit como un orquestador modular y reusable. La separación fue análoga a cómo containerd se separó: un componente core que puede integrarse en diferentes productos. SwarmKit implementa el scheduler (con estrategias spread/binpack), el dispatcher (envía tareas a workers), y el allocator (asigna IPs, puertos). En Docker, SwarmKit se compila dentro de dockerd como un subsistema. La API de SwarmKit es gRPC, y el CLI de Docker traduce comandos a llamadas gRPC de SwarmKit internamente.

---

### 3. [Investigar] ¿Cómo funciona exactamente el gossip protocol (SWIM) en Swarm y qué información se comparte? ¿Por qué es "eventualmente consistente" y no "fuertemente consistente" como Raft?

**Respuesta**: Swarm usa SWIM (Scalable Weakly-consistent Infection-style Membership), un protocolo de gossip donde cada nodo periódicamente selecciona un subconjunto aleatorio de otros nodos y les envía un "ping" con su estado conocido. La información compartida incluye: membresía de nodos (qué nodos existen), estado de nodos (alive, suspect, dead), IPs y puertos de otros nodos, y la tabla de encaminamiento de redes overlay (qué IP corresponde a qué nodo para VXLAN). El gossip es "eventualmente consistente" (no "fuertemente" como Raft) porque: 1) la información se propaga nodo-a-nodo sin un líder central (peer-to-peer), 2) no hay garantía de que todos los nodos tengan el mismo estado en todo momento (puede haber desfases temporales), 3) eventualmente (en segundos), la información converge. El estado del servicio (réplicas, updates) es fuertemente consistente (vía Raft en los managers). El gossip es para descubrimiento de red y membresía, que no requiere consistencia fuerte.

**Por qué**: El protocolo SWIM fue propuesto por Abhinandan Das et al. (ACM SIGCOMM 2002) y ha sido usado por Consul (HashiCorp), Serf (HashiCorp), y Cassandra. Swarm implementa SWIM sobre UDP/TCP puerto 7946. Cada nodo mantiene una tabla de miembros con: nombre, IP, estado, y timestamp del último heartbeat. El diámetro de la red gossip es logarítmico (O(log N) rounds para propagar información a N nodos). Esto significa que Swarm escala bien a cientos de nodos sin sobrecarga de managers.

---

### 4. [Investigar] ¿Cómo se compara Docker Swarm con HashiCorp Nomad como orquestador simple? ¿En qué casos Nomad es preferible a Swarm?

**Respuesta**: Ambos son orquestadores "simples" comparados con K8s, pero difieren en filosofía: 1) **Scope**: Swarm orquesta solo contenedores Docker. Nomad orquesta cualquier workload (Docker, Podman, QEMU, Java, raw exec, Windows Containers). 2) **Arquitectura**: Swarm integra orquestación en Docker Engine (acoplado). Nomad es independiente (desacoplado) con su propio binario y agentes. 3) **Configuración**: Swarm usa Compose files para stacks. Nomad usa HCL (HashiCorp Configuration Language) para jobs. 4) **Ecosistema**: Swarm se integra con el ecosistema Docker (Compose, CLI, Hub). Nomad se integra con el ecosistema HashiCorp (Consul, Vault, Terraform). Nomad es preferible cuando: necesitás orquestar workloads que no son contenedores (batch jobs, VMs, raw exec), querés integración nativa con Consul/Vault, o necesitás multi-región/multi-cloud scheduling (Nomad es multi-datacenter nativamente, Swarm es single-cluster).

**Por qué**: Nomad fue creado por Armon Dadgar (HashiCorp) con la filosofía de "un scheduler, muchos tipos de workload". Es un solo binario (~80 MB) que funciona como server (manager) y client (worker). Nomad es popular en entornos que ya usan HashiCorp stack (Consul para service discovery, Vault para secrets). Para equipos que solo necesitan orquestar Docker, Swarm es más simple (activado con `docker swarm init`, sin binarios extra). Para equipos con workloads mixtos o multi-cloud, Nomad es más flexible.

---

### 5. [Conectar] La clase menciona el puerto 2377 para comunicación manager-worker. ¿Qué otros puertos usa Swarm y qué protocolos? ¿Por qué la seguridad de red es crítica en un cluster Swarm?

**Respuesta**: Puertos de Swarm: 1) 2377 TCP: comunicación de gestión entre managers y workers (formato gRPC, protegido por TLS mutuo). 2) 7946 TCP/UDP: gossip network (membresía, descubrimiento de nodos, estado de redes). 3) 4789 UDP: VXLAN data plane (tráfico de aplicación entre contenedores en redes overlay). Estos puertos deben estar abiertos entre TODOS los nodos del cluster (managers y workers). La seguridad de red es crítica porque: el tráfico de la red overlay (VXLAN) viaja SIN cifrar por defecto (aunque IPSEC puede habilitarse), el tráfico de gossip incluye información sensible (IPs de todos los nodos, estado), y el puerto de gestión (2377) debe estar protegido (TLS mutuo por defecto, pero si un atacante obtiene el token de join, puede añadir nodos maliciosos al cluster).

**Por qué**: La documentación de Swarm (docs.docker.com/engine/swarm/networking) detalla estos puertos. Swarm habilita TLS mutuo automáticamente (certificados generados durante `init` y `join`). Pero la capa de red subyacente debe ser segura. En la práctica, Swarm se despliega en una red privada (VPC, VLAN) donde estos puertos están abiertos entre nodos pero no expuestos a internet. El VXLAN sin cifrar (puerto 4789) es un vector: un atacante en la misma red que pueda sniffear paquetes VXLAN puede leer el tráfico entre contenedores. La mitigación: habilitar IPSEC en redes overlay (`docker network create --opt encrypted`).

---

### 6. [Conectar] ¿Cómo funciona exactamente el scheduler de SwarmKit y qué estrategias de placement ofrece? ¿Cómo se relaciona con los constraints y preferences de la clase?

**Respuesta**: El scheduler de SwarmKit (componente dentro de Swarm) recibe tareas (tasks) del orchestrator y las asigna a nodos workers en dos fases: 1) **Filtrado (constraints)** — elimina nodos que no cumplen los requisitos: node availability (active, drain), constraints de labels (`node.labels.env==prod`), recursos disponibles (CPU/memoria suficiente), puertos publicados (sin conflictos). 2) **Ranking (preferences)** — ordena los nodos restantes según estrategias: **spread** (distribuir uniformemente, default), **binpack** (concentrar en el menor número de nodos, para optimizar uso de recursos), **random** (introspectivo, para testing). Preferencias adicionales: `--placement-pref spread=node.labels.az` distribuye entre availability zones. El scheduler selecciona el nodo con mayor ranking y le asigna la tarea (envío via dispatcher).

**Por qué**: El código de SwarmKit (github.com/moby/swarmkit) implementa el scheduler con un modelo de plugins. Las constraints son filtros booleanos (el nodo cumple o no). Las preferences son funciones de ranking que ordenan nodos. La combinación permite: "solo nodos con SSD y label env=prod, distribuyendo uniformemente entre AZs". Si ningún nodo cumple los constraints, la tarea queda en estado `Pending` con mensaje de error. El scheduler re-evalúa periódicamente (por si nuevos nodos se unen o cambian labels). Esto es conceptualmente similar al scheduler de K8s (kube-scheduler con predicates y priorities) pero más simple.

---

### 7. [Conectar] ¿Qué es el "Raft log compactation" y por qué es crítico para la salud a largo plazo de un cluster Swarm? ¿Qué pasa si el log crece sin control?

**Respuesta**: El Raft log es una secuencia de entradas (creación de servicios, updates, secrets, configs) que crece con cada operación en el cluster. Si no se compacta: 1) consume espacio en disco indefinidamente en cada manager (el log es replicado), 2) al reiniciar un manager, debe reproducir el log COMPLETO para reconstruir el estado, haciendo que los reinicios sean cada vez más lentos, 3) el snapshotting (compactación) reemplaza las entradas viejas del log con un snapshot del estado actual. SwarmKit automáticamente hace snapshotting cuando el log supera un threshold configurable (por defecto, 10,000 entradas o 5 MB). Después del snapshot, las entradas viejas se eliminan.

**Por qué**: La documentación de Raft (Diego Ongaro) enfatiza que la compactación es esencial para la operación continua. Sin snapshotting, un cluster de producción que crea/actualiza servicios diariamente podría acumular gigabytes de log en meses, haciendo los reinicios de managers prohibitivamente lentos (horas para reproducir). SwarmKit usa el snapshot system de la biblioteca etcd-io/raft. El snapshot se almacena en `/var/lib/docker/swarm/raft/snap/`. Para clusters longevos, monitorear el tamaño del log y forzar snapshotting periódico (no hay comando directo, pero reiniciar un manager lo dispara) es una práctica de mantenimiento.

---

### 8. [Cuestionar] Docker Swarm vs Kubernetes para startups: ¿Es Swarm suficiente o es una decisión que limita el crecimiento futuro?

**Respuesta**: Swarm es suficiente para startups en etapas tempranas que: 1) tienen <10 servicios, 2) corren en un solo cluster pequeño (3-10 nodos), 3) usan principalmente Docker Compose, 4) no necesitan features avanzadas de K8s (operators, CRDs, service mesh, HPA). La ventaja: Swarm es radicalmente más simple (se activa con un comando, usa el mismo CLI Docker, los devs no necesitan aprender kubectl ni YAML de K8s). La limitación: si la startup crece y necesita operadores de BD (CloudNativePG), CI/CD con GitOps (Flux/ArgoCD), service mesh (Istio), auto-scaling horizontal (HPA), o políticas de seguridad avanzadas (OPA/Gatekeeper), migrar de Swarm a K8s es un esfuerzo significativo (reescribir todos los manifiestos). La decisión depende de ambición de escala: si el plan es ser un unicornio, empezar con K8s (o al menos tener un plan de migración). Si el plan es un negocio rentable con crecimiento moderado, Swarm puede ser suficiente indefinidamente.

**Por qué**: La comunidad debate esto frecuentemente en /r/docker, /r/kubernetes, y HackerNews. La postura pragmática de empresas como 37signals (Basecamp, Hey) es que K8s es overkill para el 95% de las empresas. Ellos usan Docker + kamal (toolkit de deploy simple). Swarm está en un punto intermedio: más capaz que docker-compose standalone pero mucho más simple que K8s. La realidad: Swarm está en modo mantenimiento (Docker Inc. no invierte en nuevas features mayores para Swarm) mientras K8s tiene miles de contribuidores y ecosistema masivo. Para una startup, la pregunta es: ¿quiero simplicidad operativa (Swarm) o ecosistema y future-proofing (K8s)?

---

### 9. [Cuestionar] ¿Docker Swarm está muerto? Evaluá su estado actual (2025) y si Docker Inc. sigue invirtiendo en él.

**Respuesta**: Swarm no está muerto, pero está en modo mantenimiento. Docker Inc. (post-venta del negocio enterprise a Mirantis, 2019) continúa manteniendo Swarm en Docker Engine (bug fixes, parches de seguridad, compatibilidad con nuevas versiones de kernel), pero NO está desarrollando nuevas features significativas. La última feature mayor fue SwarmKit con soporte CSI (Container Storage Interface) que llegó en Docker 23.0. Docker Inc. enfoca su inversión en: Docker Desktop, Docker Hub, Docker Scout, BuildKit, y Compose. Swarm sigue siendo usado (encuestas de la comunidad muestran ~15-20% de usuarios Docker usan Swarm mode), principalmente en pequeñas y medianas empresas, edge computing, y entornos donde la simplicidad es prioridad. No está "muerto" (el código es mantenido), pero está "terminado" en el sentido de que no evolucionará significativamente.

**Por qué**: Después de vender Docker Enterprise a Mirantis (2019), Docker Inc. cambió su foco de orquestación (Swarm vs K8s) a herramientas de desarrollo (Desktop, Hub, Build). Mirantis continuó desarrollando Swarm dentro de Mirantis Kubernetes Engine (MKE, antes Docker Enterprise), pero el Swarm open-source en Docker Engine quedó en mantenimiento. La comunidad (incluyendo ex-empleados de Docker como Andrea Luzzardi) ha expresado que Swarm cumplió su propósito: demostrar que la orquestación simple es posible, y la industria eligió K8s como estándar. Para nuevos proyectos, elegir Swarm es una decisión que debe considerar la baja probabilidad de nuevas features.

---

### 10. [Cuestionar] ¿Es el Raft consensus de Swarm un cuello de botella? ¿Qué implicaciones de rendimiento tiene que todas las operaciones de escritura pasen por el líder?

**Respuesta**: Sí, el modelo de Raft tiene limitaciones de rendimiento: 1) todas las operaciones de escritura (crear servicios, updates, secrets) son serializadas a través del líder, 2) el líder debe replicar cada entrada a la mayoría de followers antes de commitear, añadiendo latencia de red (RTT entre nodos), 3) el throughput de escritura está limitado por el disco más lento entre los managers (cada entrada se persiste en disco antes de replicarse). En la práctica, para la mayoría de los casos de uso (crear/actualizar servicios es una operación infrecuente, comparado con el tráfico de aplicación que no pasa por Raft), esto NO es un cuello de botella. El cuello de botella real en Swarm es la red de datos (VXLAN, 4789/UDP), no el plano de control (Raft). Solo en clústeres extremadamente dinámicos (thousands de servicios creados/destruidos por minuto) Raft puede ser limitante.

**Por qué**: La tesis de Ongaro analiza el rendimiento de Raft. El throughput es ~10,000+ operaciones/segundo en hardware moderno con SSD. Swarm típicamente ejecuta operaciones de gestión en el orden de decenas por minuto (crear servicios, updates), no miles. La latencia de escritura es típicamente <10ms (RTT de red + fsync del líder). Comparativamente, etcd en K8s tiene las mismas limitaciones de Raft (todas las escrituras a K8s pasan por etcd, que también usa Raft). La diferencia es que K8s escala el plano de control con múltiples API servers (que leen de etcd) y caching. Swarm no tiene esta separación (el manager es API server + Raft node). Para el 99% de los deployments, el rendimiento de Raft no es un factor limitante.
