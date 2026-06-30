---
sidebar_label: "Cuestionario"
---

# Cuestionario M12 — Servicios, Stacks y Secrets en Swarm

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funciona exactamente el routing mesh de Swarm a nivel de kernel? ¿Qué es IPVS y cómo Docker lo configura para balancear tráfico entre réplicas en diferentes nodos?

**Respuesta**: El routing mesh es la capacidad de Swarm de que CUALQUIER nodo del cluster (incluso los que no tienen réplicas) acepte tráfico en un puerto publicado y lo redirija a un nodo que SÍ tiene réplicas. Implementación: 1) Cada nodo (manager y worker) ejecuta un IPVS (IP Virtual Server) configurado por Docker. 2) Cuando creás un servicio con `--publish 8080:80`, Docker configura IPVS en TODOS los nodos para que escuchen en el puerto 8080. 3) IPVS mantiene una tabla de backends (las IPs de todas las réplicas en todos los nodos). 4) Cuando llega tráfico al puerto 8080 en cualquier nodo, IPVS selecciona un backend (según el algoritmo configurado, default round-robin) y forwardea el paquete. Si el backend está en otro nodo, IPVS envía el paquete a través de la red overlay (VXLAN) al nodo destino, donde IPVS local lo entrega al contenedor.

**Por qué**: IPVS (parte del kernel Linux, incluye módulos `ip_vs`, `ip_vs_rr`, `ip_vs_wrr`) es un load balancer L4 de alta velocidad implementado en el kernel. Docker lo usa en lugar de HAProxy o nginx porque opera a nivel de kernel (sin context switch a userspace) y soporta NAT, DR (Direct Routing), y tunneling. El routing mesh reemplazó al modelo anterior basado en iptables que era menos escalable. IPVS soporta múltiples schedulers: rr (round-robin), wrr (weighted), lc (least connection), sh (source hashing). En Swarm, el default es `rr`. Para inspeccionar la tabla IPVS: `ipvsadm -Ln` en el host (requiere instalar ipvsadm). El routing mesh es lo que permite hacer `curl http://<cualquier-nodo>:8080` y obtener respuesta, incluso si ese nodo no tiene réplicas.

---

### 2. [Investigar] ¿Qué es exactamente el DNS Round-Robin (DNSRR) en Swarm y en qué se diferencia del balanceo VIP? ¿Cuándo usarías uno sobre el otro?

**Respuesta**: Swarm ofrece dos modos de balanceo para servicios: 1) **VIP (Virtual IP)**: el default. Swarm asigna una IP virtual al servicio. El DNS resuelve el nombre del servicio a la VIP. IPVS en el kernel balancea el tráfico hacia la VIP entre las réplicas. 2) **DNSRR (DNS Round-Robin)**: el DNS resuelve el nombre del servicio a las IPs de TODAS las réplicas (devuelve múltiples A records en orden rotativo). El cliente recibe la IP de una réplica y se conecta directamente (sin pasar por VIP ni IPVS). DNSRR es útil cuando: la aplicación maneja su propio load balancing (ej. Redis Cluster), la aplicación necesita conectarse a una réplica específica (stateful), o cuando IPVS introduce latencia indeseada. La desventaja de DNSRR: clientes que cachean la primera IP resuelta (muchas aplicaciones lo hacen) no se balancean. VIP es la recomendación general.

**Por qué**: DNSRR es configurado con `--endpoint-mode dnsrr` en `docker service create`. La diferencia práctica: con VIP, tus conexiones pasan por IPVS en el nodo local. Con DNSRR, el cliente contacta directamente la IP del contenedor destino, que puede estar en otro nodo, y el tráfico viaja por VXLAN. DNSRR es más simple y eficiente para algunos casos (elimina el hop extra de IPVS), pero la falta de balanceo adecuado en clientes que cachean DNS es un problema real. En K8s, el equivalente es: ClusterIP (VIP) vs Headless Service (DNS con todos los Pod IPs, análogo a DNSRR).

---

### 3. [Investigar] ¿Cómo funciona exactamente el proceso de creación y distribución de un Secret en Swarm? Describí el flujo desde `docker secret create` hasta que el archivo aparece en `/run/secrets/` del contenedor.

**Respuesta**: Flujo completo: 1) `docker secret create db_pass secret.txt` — el CLI envía el contenido del archivo al manager líder vía API gRPC (TLS mutuo). 2) El manager almacena el secret en memoria, lo encripta con la clave de cifrado (derivada del autolock key si está habilitado), y lo persiste en el Raft log (replicado a followers). 3) El secret queda disponible en el cluster (estado en Raft). 4) Cuando se crea un servicio con `--secret db_pass`, el scheduler asigna réplicas a workers. 5) El dispatcher envía la asignación al worker. 6) El worker contacta al manager líder y solicita el secret por gRPC (TLS mutuo). 7) El manager envía el secret cifrado al worker. 8) El worker descifra el secret y lo monta en un tmpfs dentro del namespace de montaje del contenedor como `/run/secrets/db_pass`. 9) El archivo solo existe mientras el contenedor está corriendo; al eliminarse el contenedor, el tmpfs se destruye.

**Por qué**: La implementación de secrets en Swarm (moby/swarmkit) detalla este flujo. El cifrado en tránsito usa TLS mutuo (el worker y manager tienen certificados emitidos por la CA de Swarm durante el join). El cifrado en reposo depende de autolock: sin autolock, el Raft log en disco está en texto plano (aunque TLS protege la transmisión). Con autolock, el Raft log está cifrado con una clave derivada del unlock key. Los secrets son la feature de Swarm que implementa "least privilege" para credenciales: un worker que ejecuta un servicio SIN declaración de secret no recibe el secret, incluso si otro servicio en el mismo worker lo usa.

---

### 4. [Investigar] ¿Qué es exactamente un "config" en Swarm y cómo se compara con montar un ConfigMap en Kubernetes? ¿Qué limitaciones tiene respecto a tamaño y formato?

**Respuesta**: Docker Configs (`docker config create`) son objetos de configuración no sensible (archivos .conf, JSON, YAML) almacenados en el Raft log y distribuidos a workers. Se montan como archivos en el contenedor (default en `/`). Comparación con K8s ConfigMaps: 1) Ambas almacenan datos de configuración no sensible, 2) Ambas pueden montarse como archivos o usarse como variables de entorno (ConfigMaps pueden, Docker Configs solo como archivos), 3) K8s ConfigMaps tienen límite de 1 MB (en etcd), Docker Configs tienen límite de 500 KB (configurable, pero desaconsejado excederlo porque se almacenan en RAM del manager), 4) K8s ConfigMaps se actualizan automáticamente en los Pods (los archivos montados cambian), Docker Configs son inmutables (para cambiar, crear nuevo config y update service con `--config-rm old --config-add new`).

**Por qué**: Docker Configs fueron introducidos en Docker 17.06 como complemento de Secrets para datos no sensibles. La inmutabilidad es una diferencia de diseño: K8s permite actualizar ConfigMaps y que los Pods vean los cambios (con delay de syncing). Swarm decidió que la configuración es inmutable (como la imagen) para garantizar que un servicio en ejecución siempre tiene la misma configuración. Para cambiar configuración se requiere un `docker service update` (que es un rolling update). Esto es más seguro (auditable, versionable) pero menos conveniente para configuraciones que cambian frecuentemente.

---

### 5. [Conectar] La clase menciona `docker stack deploy`. ¿Cómo se diferencia el deploy de un stack en Swarm de `kubectl apply -f` en Kubernetes? ¿Qué concepto de "estado deseado" comparten?

**Respuesta**: Ambos son declarativos: definís el estado deseado en un archivo (compose file en Swarm, YAML en K8s) y el orquestador reconcilia el estado actual para alcanzarlo. Diferencias: 1) Swarm usa un compose file (Docker-native, single format). K8s usa múltiples objetos YAML (Deployment, Service, Ingress, etc.). 2) `docker stack deploy` es idempotente (ejecutarlo repetidas veces no crea duplicados). `kubectl apply -f` también es idempotente (usa el annotation `kubectl.kubernetes.io/last-applied-configuration` para detectar cambios). 3) Swarm solo acepta compose files; K8s acepta cualquier recurso API. 4) Swarm reconcilia automáticamente (si alguien escala manualmente un servicio, Swarm lo re-escala al estado deseado). K8s reconcilia lo mismo (el controller manager mantiene el estado deseado). El concepto compartido es "reconciliation loop": el estado observado se compara con el estado deseado, y el controlador actúa para minimizar la diferencia.

**Por qué**: El modelo declarativo y la reconciliación continua son principios fundamentales de orquestadores modernos, inspirados en Borg (Google) y formalizados en el paper de Kubernetes (Burns et al., 2016). Swarm implementa una versión más simple (sin CRDs, sin controladores extensibles), pero el principio es el mismo. La idempotencia de `stack deploy` significa que podés ponerlo en un pipeline CI/CD y ejecutarlo en cada commit sin miedo (GitOps rudimentario). Para stacks complejos con dependencias externas (volúmenes cloud, DNS), la limitación de Swarm es que no puede crear esos recursos (solo orquesta Docker).

---

### 6. [Conectar] La clase menciona `docker service update --update-failure-action rollback`. ¿Qué mecanismo implementa Swarm para detectar que un rolling update falló y cómo ejecuta el rollback automáticamente?

**Respuesta**: El mecanismo: 1) Swarm ejecuta el rolling update según `--update-parallelism` y `--update-delay`. 2) Para cada réplica actualizada, Swarm monitorea el estado del contenedor: si no llega a `running` (falla al iniciar), o si tiene healthcheck y no alcanza `healthy` dentro del timeout. 3) Si una réplica falla, Swarm cuenta cuántas fallas consecutivas han ocurrido. 4) Con `--update-failure-action rollback`, si CUALQUIER réplica falla, Swarm inmediatamente inicia un rollback automático: revierte TODAS las réplicas a la versión anterior (imagen, configs, secrets previos) usando un rolling update inverso. 5) El rollback crea una nueva entrada en el historial del servicio (como si fuera un update hacia atrás). 6) Si el rollback también falla, el servicio queda en estado "paused" (pausado, sin continuar el update ni rollback, requiriendo intervención manual).

**Por qué**: La implementación en SwarmKit (orchestrator.go) muestra que el estado del update se trackea con: `UpdateStatus.State` (updating, completed, paused, rollback). Cuando `State` es `rollback`, SwarmKit reemplaza la spec del servicio con la spec anterior (almacenada en el historial). El rollback usa los mismos parámetros de `update_config` (parallelism, delay). Esto es análogo a `kubectl rollout undo` en K8s (aunque K8s no tiene rollback automático por defecto, requiere configuración con ArgoCD/Flagger o un operador).

---

### 7. [Conectar] ¿Cómo maneja Swarm los puertos publicados en modo `host` vs `ingress`? ¿Qué diferencia práctica hay para aplicaciones que necesitan preservar la IP real del cliente?

**Respuesta**: Swarm tiene dos modos de publicación de puertos: 1) **Ingress mode** (default): usa el routing mesh. El tráfico llega a cualquier nodo en el puerto publicado, pasa por IPVS, y es forwardeado a una réplica. La IP del cliente se pierde (IPVS hace SNAT), el contenedor ve la IP del nodo que hizo el forward. 2) **Host mode**: `--publish published=8080,target=80,mode=host`. El puerto se abre SOLO en los nodos donde hay réplicas ejecutándose. No hay routing mesh. La IP del cliente se preserva (no hay SNAT de IPVS en el medio). Ventaja de host mode: aplicaciones que necesitan la IP del cliente (logs de auditoría, rate limiting por IP, geolocalización). Desventaja: solo podés tener una réplica por nodo (porque el puerto 8080 se bindea directamente en la IP del host, y no puede haber dos binding al mismo puerto). Si dos réplicas caen en el mismo nodo, la segunda falla al bind.

**Por qué**: Host mode es el equivalente de `hostNetwork` en K8s o `--net=host` en Docker standalone. En host mode, Docker configura el puerto directamente en el host (iptables DNAT al contenedor local), sin pasar por IPVS. Para preservar la IP del cliente en ingress mode, la alternativa es usar un proxy L7 externo (nginx/Traefik) con `proxy_protocol` que forwardea la IP original en un header. En K8s, `externalTrafficPolicy: Local` en un Service de tipo NodePort es análogo a Swarm host mode (preserva source IP, pero solo en nodos con Pods).

---

### 8. [Cuestionar] ¿Son los Docker Secrets suficientes para producción o necesitás un gestor de secretos externo como Vault?

**Respuesta**: Docker Secrets son suficientes para producción en clusters Swarm pequeños/medianos donde: 1) la rotación manual es aceptable (cada X meses, un admin crea nuevo secret y actualiza servicios), 2) no necesitás secrets dinámicos (credenciales temporales por servicio), 3) no requieren integración con sistemas externos de gestión de secretos. Necesitás Vault (o similar) cuando: 1) querés secrets dinámicos (credenciales que expiran automáticamente, limitando el radio de explosión), 2) necesitás auditoría completa de acceso a secretos (quién accedió, cuándo), 3) querés rotación automática, 4) necesitás integración con HSM, 5) tenés compliance regulatorio (PCI, HIPAA) que requiere gestión centralizada y políticas de acceso.

**Por qué**: Docker Secrets implementan el mínimo viable de gestión de secretos (almacenamiento cifrado, distribución segura, montaje en tmpfs). Vault lleva esto al siguiente nivel con: secrets engine (generación dinámica de credenciales de BD con TTL), cubbyhole response wrapping (el secreto solo puede ser leído UNA vez), y audit logging completo. Para muchas startups y PyMEs, Docker Secrets + rotación manual anual es suficiente. Para empresas con compliance estricto o arquitectura multi-cluster, Vault es necesario.

---

### 9. [Cuestionar] ¿Es el docker compose v3 (compose file para Swarm) un formato adecuado para producción o es demasiado limitado?

**Respuesta**: El compose file v3+ (Compose Specification) es adecuado para producción en Swarm, pero con limitaciones: 1) Campos ignorados en modo stack: `depends_on`, `container_name`, `restart` (usar `deploy.restart_policy`), `build` (imágenes deben estar en registry). 2) No soporta condicionales ni bucles (YAML plano). 3) La configuración de recursos (`deploy.resources`) es estándar, pero no soporta HPA ni VPA. 4) Para configuraciones complejas (múltiples entornos con variaciones significativas), puede volverse repetitivo. Para producción, es adecuado si: la aplicación es de complejidad moderada, usás diferentes archivos de override por entorno (dev/staging/prod), y no necesitás lógica de templating avanzada. Herramientas como Helm (con `helm template`), Kustomize, o Jsonnet ofrecen más flexibilidad para configuraciones complejas.

**Por qué**: La Compose Specification fue diseñada para ser simple y legible. Para el 80% de los casos de uso, es suficiente. Para el 20% restante (configuraciones con muchas variaciones por entorno, necesidad de loops/condicionales), herramientas de templating externas son necesarias. Muchos equipos usan `envsubst` o `gomplate` para preprocesar compose files antes de `docker stack deploy`, generando el YAML final con valores interpolados. Esto es un "templating externo" que mantiene la simplicidad del compose file mientras agrega dinamismo.

---

### 10. [Cuestionar] ¿Cuál es el punto de usar Swarm en modo single-node? ¿No es mejor simplemente usar docker compose?

**Respuesta**: Swarm single-node es útil porque habilita features que docker compose standalone no tiene: 1) **Secrets y Configs** (gestión segura de credenciales), 2) **Rolling updates** con healthcheck y rollback automático, 3) **Routing mesh** (aunque con un solo nodo es redundante, establece el patrón), 4) **Service discovery** avanzado (VIP, DNSRR). Además, iniciar con `docker swarm init` en un solo nodo es trivial y te prepara para escalar a multi-nodo en el futuro sin cambiar nada (solo añadir workers). La desventaja: Swarm mode activa el Raft engine (overhead mínimo, pero existe) y cambia ligeramente el comportamiento de algunas features (restart policies, networking). La pregunta es: ¿necesitás secrets/configs/rolling updates? Si sí, Swarm single-node es mejor que Compose. Si no, Compose es más simple.

**Por qué**: La documentación de Docker menciona "You can run Swarm on a single node for testing and development". La comunidad de DevOps frecuentemente recomienda Swarm single-node como "el upgrade de Compose" para entornos de producción pequeños. La transición de Compose a Swarm stack es mínima (cambiar `docker compose up` a `docker stack deploy`). Muchas herramientas como Portainer, Traefik, y Docker Swarm Visualizer esperan Swarm mode incluso en single-node. La decisión depende de si valorás las features adicionales de Swarm o preferís la simplicidad de Compose.
