---
sidebar_label: "Cuestionario"
---

# Cuestionario M06 — Redes en Docker

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funciona exactamente la red overlay de Docker Swarm usando VXLAN? Describí el encapsulamiento de paquetes y el rol del plano de control (gossip) vs plano de datos (VXLAN).

**Respuesta**: VXLAN (Virtual eXtensible LAN, RFC 7348) encapsula tramas Ethernet L2 dentro de paquetes UDP (puerto 4789) sobre la red IP subyacente (underlay). En Swarm: 1) El contenedor envía una trama Ethernet a su veth pair, 2) El bridge virtual del overlay recibe la trama, 3) Si la MAC destino está en otro nodo, el driver overlay encapsula la trama en un paquete VXLAN con el VNI (Virtual Network Identifier) correspondiente a la red overlay, 4) El paquete se envía al nodo destino por la red física (underlay) usando la IP del host destino, 5) El nodo destino desencapsula y entrega la trama al contenedor. El plano de control (gossip protocol, puerto 7946) distribuye la tabla de mapeo MAC→IP de nodo y las membresías de red overlay a todos los nodos del cluster. El plano de datos (VXLAN, puerto 4789) transporta el tráfico real.

**Por qué**: La arquitectura de networking de Swarm está documentada en github.com/moby/libnetwork y en charlas de Madhu Venugopal (Docker networking lead). VXLAN fue elegido sobre GRE o STT porque: usa UDP (tratable por firewalls y load balancers estándar), soporta hasta 16 millones de redes virtuales (VNI de 24 bits), y tiene soporte de hardware offloading (NICs modernos pueden encapsular/desencapsular VXLAN en hardware). El gossip usa SWIM (Scalable Weakly-consistent Infection-style Membership) para propagar estado de red entre nodos sin depender del manager central.

---

### 2. [Investigar] ¿Qué es exactamente eBPF en el contexto de networking de contenedores y cómo Cilium lo usa para reemplazar kube-proxy? ¿Por qué iptables escala mal?

**Respuesta**: Cilium usa eBPF para implementar load balancing en el kernel con complejidad O(1) usando mapas hash, en lugar del enfoque O(n) de kube-proxy con iptables. kube-proxy con iptables escala mal porque: cada Service crea múltiples reglas en las cadenas NAT/FILTER, y para cada paquete el kernel evalúa secuencialmente todas las reglas (O(n) con n = número de Services). Con 10,000 Services, un paquete puede atravesar 50,000+ reglas iptables, causando latencia y consumo de CPU del kernel. Cilium inserta programas eBPF en el kernel que implementan un lookup hash O(1) para resolver Service→Endpoint, y manejan DNAT directamente en el kernel sin pasar por iptables. Además, eBPF puede inspeccionar hasta L7 (HTTP headers, gRPC) para aplicar políticas de red a nivel de API.

**Por qué**: Thomas Graf (Cilium co-creator, Isovalent) demostró en múltiples benchmarks (KubeCon 2018, 2019) que iptables se degrada con miles de Services, mientras eBPF mantiene rendimiento constante. El problema de iptables es su diseño: cada regla es evaluada secuencialmente en una lista enlazada en el kernel. IPVS (otro modo de kube-proxy) mejora esto con hash O(1) para el backend selection, pero sigue usando iptables para el DNAT inicial. eBPF elimina completamente iptables del data path. Cilium es ahora un proyecto graduado de CNCF y el CNI por defecto en GKE Dataplane V2. La programabilidad de eBPF permite hacer operaciones que eran imposibles con iptables: inspección de tráfico HTTP/gRPC/Kafka, métricas de latencia por API endpoint, y políticas de red basadas en identidad.

---

### 3. [Investigar] ¿Cómo funciona exactamente el DNS interno de Docker a nivel de implementación? ¿Qué es `127.0.0.11` y cómo el daemon Docker intercepta las consultas DNS desde los contenedores?

**Respuesta**: Docker configura cada contenedor con un servidor DNS en `127.0.0.11` (dentro del namespace de red del contenedor). Internamente, Docker crea una regla iptables (en la cadena OUTPUT del contenedor) que redirige el tráfico UDP/TCP puerto 53 con destino `127.0.0.11` al daemon Docker en el host. El daemon Docker ejecuta un resolver DNS embebido (no un servidor DNS externo) que: 1) busca el nombre en su tabla interna (contenedores en la misma red con sus nombres y aliases), 2) si no lo encuentra, forwardea la consulta a los DNS servers configurados en el host (o los especificados con `--dns`). El resolver soporta round-robin: si múltiples contenedores comparten el mismo alias, devuelve las IPs en orden rotativo.

**Por qué**: La implementación está en github.com/moby/libnetwork (package `resolvconf` y `embedded DNS`). El DNS embebido usa un servidor DNS interno (basado en `miekg/dns` Go library) que mantiene un registro de todos los endpoints de red. Las consultas se forwardean a los DNS servers externos usando el mismo algoritmo que `resolv.conf` (hasta 3 nameservers, timeout 5s). La regla iptables que redirige el tráfico DNS es: `-t nat -A OUTPUT -d 127.0.0.11 -p udp --dport 53 -j DNAT --to-destination <dockerd-ip>:<port>`. Esto es transparente para el contenedor, que cree que habla con un DNS server normal en 127.0.0.11.

---

### 4. [Investigar] ¿Qué son exactamente los IPvlan y Macvlan drivers en Docker y en qué se diferencian? ¿Cuándo usarías cada uno?

**Respuesta**: Macvlan asigna una MAC address virtual ÚNICA a cada contenedor, haciéndolo aparecer como un dispositivo físico independiente en la red. IPvlan (más moderno) asigna una IP única a cada contenedor pero comparte la misma MAC address del host (o una MAC virtual compartida entre todos los contenedores IPvlan). La diferencia principal es el consumo de MAC addresses (Macvlan necesita una por contenedor, IPvlan comparte) y la compatibilidad con switches de red (algunos switches limitan el número de MACs por puerto). Macvlan se usa para aplicaciones legacy que requieren su propia identidad de red (MAC propia, IP propia, visible al DHCP del corporativo). IPvlan se usa en entornos cloud donde el hypervisor o switch virtual limita las MACs (AWS, Azure bloquean múltiples MACs por instancia EC2/VM, haciendo Macvlan inviable).

**Por qué**: La documentación del kernel Linux (Documentation/networking/ipvlan.txt) detalla los modos de IPvlan: L2 (bridge mode, contenedor aparece en la misma LAN), L3 (router mode, el host actúa como router, los contenedores están en subredes aisladas), y L3S (L3 + soporte para iptables/conntrack). Docker soporta Macvlan desde 1.12 y IPvlan es experimental/third-party. En AWS, el límite de 10 MACs por ENI hace Macvlan inviable, pero IPvlan L3 funciona. IPvlan L3 es útil para escalar: miles de contenedores pueden compartir una sola MAC del host, eliminando la limitación de tabla MAC del switch.

---

### 5. [Conectar] La clase menciona la cadena DOCKER-USER en iptables. ¿Cómo implementarías una whitelist de IPs para un puerto publicado sin que Docker sobreescriba tus reglas? Incluí el enfoque con iptables y con Traefik/nginx como proxy reverso.

**Respuesta**: Con iptables, agregás reglas en la cadena DOCKER-USER que se evalúan ANTES que DOCKER. Ejemplo para restringir puerto 8080 a solo IP 10.0.0.5:
```bash
iptables -I DOCKER-USER -p tcp --dport 8080 ! -s 10.0.0.5 -j DROP
iptables -I DOCKER-USER -p tcp --dport 8080 -s 10.0.0.5 -j RETURN
```
DOCKER-USER persiste entre reinicios del daemon. El enfoque con reverse proxy (recomendado para producción): no publicar el puerto del contenedor con `-p` (el contenedor solo expone en redes internas), y exponer un solo Traefik/nginx que haga proxy reverso con whitelist de IPs en su configuración.

**Por qué**: La cadena DOCKER-USER fue diseñada explícitamente para este propósito. Docker evalúa: DOCKER-USER → DOCKER → FORWARD. Las reglas en DOCKER-USER no son tocadas por Docker durante reinicios. La alternativa moderna (reverse proxy) es más mantenible: Traefik tiene middleware `ipWhiteList`, nginx tiene `allow/deny`. La ventaja: reglas declarativas en YAML, métricas, y TLS centralizado. La desventaja: overhead de proxy L7. Para casos simples, iptables con DOCKER-USER es más eficiente (sin proxy intermedio). Para aplicaciones con tráfico HTTP/HTTPS, reverse proxy es la práctica recomendada.

---

### 6. [Conectar] ¿Cómo funciona el hairpin NAT en Docker y por qué `docker-proxy` existe como userland proxy?

**Respuesta**: Hairpin NAT (o NAT loopback) ocurre cuando un contenedor intenta acceder a un servicio publicado de otro contenedor usando la IP pública del host. El tráfico sale del contenedor, llega a la IP del host, y debe ser DNATeado de vuelta al contenedor destino. iptables puede manejar esto pero requiere `route_localnet` y configuraciones específicas. `docker-proxy` (userland proxy) existe como solución a este problema: es un proceso que escucha en el puerto publicado del host y forwardea conexiones al contenedor vía la red Docker interna, sin pasar por iptables. Fue creado antes de que iptables soportara hairpin NAT confiablemente. Se puede deshabilitar con `--userland-proxy=false` en daemon.json, confiando solo en iptables.

**Por qué**: El `docker-proxy` fue una solución pragmática de los primeros días de Docker (2013-2015) cuando el soporte de hairpin NAT en kernels era inconsistente. Hoy, iptables maneja hairpin correctamente en kernels modernos, y `docker-proxy` es técnicamente redundante. Sin embargo, sigue habilitado por defecto por compatibilidad. `docker-proxy` agrega overhead (un proceso extra por cada puerto publicado, context switching userland↔kernel). Para rendimiento en producción, se recomienda `--userland-proxy=false` en el daemon. La cadena PREROUTING maneja el DNAT, y la cadena POSTROUTING maneja el SNAT/MASQUERADE de vuelta.

---

### 7. [Conectar] ¿Cómo funciona el descubrimiento de servicios (service discovery) en una red overlay de Swarm? ¿Qué diferencia hay con el de Kubernetes?

**Respuesta**: En Swarm: 1) Cada servicio obtiene una VIP (Virtual IP) estable, 2) El DNS interno resuelve el nombre del servicio a la VIP, 3) IPVS en el kernel balancea el tráfico de la VIP entre las IPs de las réplicas. En Kubernetes: 1) Cada Service obtiene un ClusterIP (VIP), 2) CoreDNS/kube-dns resuelve `<service>.<namespace>.svc.cluster.local` al ClusterIP, 3) kube-proxy (iptables/IPVS) balancea el tráfico del ClusterIP a los endpoints (Pods). La diferencia principal: en Swarm la VIP es por servicio (cada servicio tiene su VIP que balancea entre réplicas). En K8s, los Pods tienen IPs únicas en todo el cluster (cada Pod tiene IP propia, no NAT entre Pods), y el Service es una abstracción arriba de esas IPs.

**Por qué**: Swarm usa VIP porque replica el modelo de red tradicional (los contenedores tienen IPs privadas en redes overlay con VXLAN). K8s usa Pod IPs porque la especificación CNI exige que cada Pod tenga IP única en todo el cluster y sea alcanzable sin NAT. Esto hace que el modelo de K8s sea más simple para aplicaciones (la app ve su propia IP real) pero más complejo para la red subyacente (el CNI debe implementar routing entre nodos sin overlay). Swarm es más simple de implementar (VXLAN overlay universal), K8s es más flexible (CNI pluggable que puede usar overlay, BGP, o L2).

---

### 8. [Cuestionar] "IPv4 se está agotando, los contenedores deberían usar IPv6 por defecto". ¿Está Docker preparado para IPv6-first? ¿Cuáles son los bloqueantes actuales?

**Respuesta**: Docker tiene soporte para IPv6 desde Docker 1.5 (2015), pero NO está habilitado por defecto y tiene limitaciones significativas: 1) Requiere configuración manual de subnet IPv6 en daemon.json (`"ipv6": true, "fixed-cidr-v6": "2001:db8:1::/64"`), 2) El DNS embebido no soporta AAAA records por defecto (solo A), 3) Docker Compose no tiene soporte nativo para IPv6, 4) Docker Hub y la mayoría de registries no tienen endpoints IPv6, 5) La red bridge default solo configura IPv4 (requiere `docker network create --ipv6`). En Kubernetes, IPv6-only clusters son soportados desde K8s 1.21 (dual-stack desde 1.20, GA en 1.23). Los bloqueantes son ecosistema (muchas imágenes y herramientas asumen IPv4), no técnicos.

**Por qué**: El issue tracker de Docker (github.com/moby/moby) tiene issues abiertos desde 2016 sobre IPv6 support gaps. La postura de Docker (según el CTO de Docker, comentado en varios issues) es que IPv6 es importante pero no prioritario porque la mayoría de los usuarios despliegan en entornos IPv4 (cloud providers, redes corporativas). En K8s, el SIG-Network impulsó dual-stack a GA en 1.23, y Cilium soporta IPv6-only clusters. La realidad en 2025: la mayoría de los deployments siguen siendo IPv4 o dual-stack, no IPv6-only. El agotamiento de IPv4 se mitiga con NAT masivo, no con migración a IPv6 en el corto plazo.

---

### 9. [Cuestionar] ¿Es `--net=host` una mala práctica siempre o tiene casos de uso legítimos en producción? ¿Qué alternativas existen cuando necesitás rendimiento de red máximo?

**Respuesta**: `--net=host` elimina el aislamiento de red (el contenedor usa directamente el namespace de red del host). Es legítimo en casos específicos: 1) aplicaciones que requieren máximo rendimiento de red (high-frequency trading, procesamiento de paquetes en espacio de kernel), 2) herramientas de monitoreo de red del host (ntop, Wireshark, cAdvisor), 3) aplicaciones que necesitan escuchar en muchos puertos dinámicos. NO es aceptable para servicios de aplicación generales porque: rompe el aislamiento (el contenedor puede interferir con la red del host), los puertos del contenedor y del host colisionan, y perdés todas las features de networking de Docker (DNS interno, redes personalizadas, NetworkPolicy en K8s). Alternativas: usar `--network=macvlan` (IP propia en la red con rendimiento cercano a nativo) o Podman (que puede mapear puertos <1024 con CAP_NET_BIND_SERVICE sin host networking).

**Por qué**: La documentación de Docker advierte "host networking is only available on Linux and should be used with caution". En términos de rendimiento, `--net=host` es ~2-5% más rápido que bridge (sin overhead de NAT, bridge, veth pair), pero este overhead es despreciable para la mayoría de aplicaciones (API REST, web servers). Solo aplicaciones que procesan millones de paquetes por segundo (load balancers, proxies de alto rendimiento, DPI) se benefician. Cilium/eBPF con CNI chaining ofrece rendimiento cercano a host sin perder aislamiento, y es la alternativa moderna para alto rendimiento en K8s.

---

### 10. [Cuestionar] ¿Deberías usar siempre redes personalizadas (`docker network create`) en lugar de la red bridge default? ¿Hay algún caso donde la red default sea preferible?

**Respuesta**: Sí, siempre deberías usar redes personalizadas en producción y desarrollo. La red bridge default carece de: 1) resolución DNS entre contenedores (solo por IP), 2) aislamiento (todos los contenedores conectados a la default pueden comunicarse entre sí sin restricciones), 3) configuración de subnet y gateway (Docker asigna automáticamente sin tu control). El único caso donde la red default podría ser preferible es en scripts de una línea o demos mínimas donde no necesitás comunicación entre contenedores, o en entornos extremadamente restringidos donde no podés crear recursos adicionales. Incluso para desarrollo, una red personalizada es mejor porque permite que los contenedores se comuniquen por nombre.

**Por qué**: La red bridge default es básicamente legacy behavior mantenido por compatibilidad hacia atrás. Docker mismo recomienda en su documentación: "User-defined bridges provide better isolation and interoperability between containers." En Compose, Docker crea automáticamente una red personalizada por proyecto, que es mucho mejor que la default. La diferencia más práctica que los desarrolladores notan: `docker run --network mynet --name db postgres` y `docker run --network mynet --name app myapp` pueden comunicarse usando `db` como hostname. En la red default, `app` debe conocer la IP de `db` (que cambia cada vez que se recrea).
