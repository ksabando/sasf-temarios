---
sidebar_label: "Cuestionario"
---

# Cuestionario M19 — Networking y Service Mesh

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente el "Gateway API" de Kubernetes y cómo mejora sobre el Ingress tradicional? ¿Por qué se creó un nuevo estándar en lugar de extender Ingress?

**Respuesta**: Gateway API (K8s SIG-Network, 2020+) es un estándar de próxima generación para enrutamiento L4-L7 en K8s que reemplaza/ complementa Ingress. Introduce recursos más expresivos y role-oriented: 1) `GatewayClass` (infra admin): define qué controller (istio, nginx, contour) y qué tipo de load balancer, 2) `Gateway` (cluster operator): instancia específica escuchando en puertos con TLS, 3) `HTTPRoute` (developer): reglas de enrutamiento por host, path, headers, weight, y filtros (rate limiting, retries). Mejoras sobre Ingress: 1) Role-oriented (RBAC granular: developer define routes, infra admin define gateways), 2) Soporte L4 (TCP, UDP, gRPC) además de HTTP, 3) Traffic splitting (pesos para canary), 4) Backend policy (timeouts, health checks), 5) Extensibilidad (custom filters). No se extendió Ingress porque Ingress es un recurso plano (todos los campos en un solo objeto), mientras Gateway API separa responsabilidades.

**Por qué**: Gateway API es mantenido por el mismo SIG-Network que mantiene Ingress (Tim Hockin, Bowei Du, Rob Scott). La motivación: Ingress quedó limitado (soporte de features varía por controller con annotations propietarias). Gateway API estandariza features avanzadas (traffic splitting, header matching) que antes requerían annotations específicas de nginx/traefik. Los controllers migran gradualmente: nginx-gateway-fabric, Istio (ambient mesh), Contour, y Traefik ya soportan Gateway API.

---

### 2. [Investigar] ¿Qué es exactamente "ambient mesh" (Istio Ambient) y cómo difiere del modelo sidecar tradicional? ¿Qué ventajas de rendimiento y operaciones ofrece?

**Respuesta**: Istio Ambient (introducido en Istio 1.18, 2023) es un nuevo modo de service mesh que NO requiere un sidecar por Pod. En lugar de inyectar un proxy Envoy en cada Pod, Ambient divide la funcionalidad en dos capas: 1) **ztunnel** (zero trust tunnel, por nodo): proxy L4 que maneja mTLS, autenticación, y TCP routing entre nodos, sin parsear HTTP. 2) **waypoint proxy** (opcional, por service account): proxy L7 que maneja HTTP policies, traffic management, y telemetría, solo cuando se necesita. El sidecar tradicional (Envoy por Pod) requiere un proxy extra por cada Pod, consumiendo recursos (CPU/memoria) y agregando latencia. Ambient elimina el sidecar de Pods que no necesitan L7, reduciendo el overhead de recursos (ztunnel es compartido por todos los Pods del nodo) y simplificando operaciones (no hay que inyectar, actualizar, o debuggear sidecars individuales).

**Por qué**: Ambient fue presentado por Solo.io y Google (Istio maintainers) en KubeCon 2022 como respuesta a las críticas de complejidad de sidecars. Ztunnel usa eBPF y el kernel networking para enrutamiento L4 eficiente (sin proxy user-space para tráfico L4). Waypoint es un proxy Envoy por service account (no por Pod), reduciendo el número total de proxies en el cluster. Ambient es backward-compatible con sidecar (pueden coexistir). Linkerd (Buoyant) respondió con un modelo similar (Linkerd 2.14+).

---

### 3. [Investigar] ¿Cómo funciona exactamente Cilium como CNI y como replacement de kube-proxy usando eBPF? ¿Qué es el "Cilium Cluster Mesh" para multi-cluster?

**Respuesta**: Cilium como CNI: 1) Asigna IPs a Pods (usando el IPAM de K8s o su propio IPAM), 2) Configura routing entre nodos (con eBPF, sin overlay o con direct routing via BGP), 3) Reemplaza kube-proxy: implementa Service load balancing en eBPF con mapas hash O(1) en lugar de iptables O(n). Para un Service ClusterIP, Cilium inserta un programa eBPF que hace DNAT del ClusterIP al endpoint Pod IP directamente en el kernel, sin reglas iptables. Cilium Cluster Mesh: conecta múltiples clusters K8s con routing directo de Pod IPs entre clusters (sin NAT, sin gateways), usando eBPF para encriptación (WireGuard/IPsec) y políticas de red globales. Los Pods en cluster A pueden comunicarse con Pods en cluster B usando sus IPs nativas, con mTLS y NetworkPolicy cross-cluster.

**Por qué**: Cilium (Isovalent/Cisco, CNCF graduado) es el CNI más avanzado en eBPF. Thomas Graf y el equipo de Isovalent demostraron que eBPF reemplaza iptables con rendimiento 10-100x mejor para Service load balancing. Cluster Mesh usa el concepto de "identity" (basado en labels de Pod) que es global entre clusters. Esto habilita multi-cluster service routing y failover. Para NetworkPolicy: Cilium puede aplicar políticas a nivel de API (HTTP/gRPC/Kafka) usando eBPF para inspeccionar tráfico L7 sin sidecar.

---

### 4. [Investigar] ¿Qué es exactamente "SPIFFE" y cómo se relaciona con mTLS en service meshes? ¿Por qué la identidad de servicio es fundamental para zero trust?

**Respuesta**: SPIFFE (Secure Production Identity Framework for Everyone) es un estándar CNCF que define cómo identificar servicios de manera criptográfica en entornos cloud-native. SPIFFE ID es un URI como `spiffe://cluster.local/ns/default/sa/myservice` que identifica unívocamente un servicio (basado en su ServiceAccount, namespace, y trust domain). SPIRE (la implementación de SPIFFE) emite certificados X.509 o JWTs que prueban esa identidad. En service meshes (Istio, Linkerd, Consul Connect), los sidecars usan certificados SPIFFE para mTLS: el proxy cliente verifica que el proxy servidor tiene un certificado con la identidad esperada. Zero trust se implementa porque la confianza se basa en identidad criptográfica (SPIFFE ID en certificado), no en IP o ubicación de red.

**Por qué**: SPIFFE fue creado por Google, Netflix, Uber, y otras empresas (Evan Gilman, Douglas Reid). La especificación define: SPIFFE ID (identidad), SVID (documento que prueba la identidad), y SPIRE (implementación). En Istio, istiod actúa como SPIRE server emitiendo SVIDs a cada sidecar Envoy. En Linkerd, el control plane emite identidades con su propia CA. SPIFFE es la base de autenticación en mTLS: sin identidad criptográfica, mTLS solo cifra pero no autentica quién es el peer.

---

### 5. [Conectar] La clase menciona NetworkPolicy. ¿Qué diferencia hay entre NetworkPolicy de K8s y las políticas de seguridad de un Service Mesh (Istio AuthorizationPolicy)? ¿Cuándo usar una sobre la otra?

**Respuesta**: NetworkPolicy (K8s nativa): opera a L3/L4. Reglas basadas en IPs, namespaces, y puertos. Ejemplo: "Permitir tráfico TCP desde namespace `frontend` a Pods con label `app: backend` en puerto 8080". Simple, eficiente (implementado por CNI/iables/eBPF), pero no entiende HTTP/gRPC. AuthorizationPolicy (Istio): opera a L7. Reglas basadas en identidad SPIFFE, paths HTTP, headers, métodos, y claims JWT. Ejemplo: "Permitir GET a /api/users solo desde servicios con ServiceAccount `web`". AuthorizationPolicy requiere Service Mesh (sidecar). Usar NetworkPolicy cuando: solo necesitás segmentación L3/L4 básica, sin dependencia de Service Mesh. Usar AuthorizationPolicy cuando necesitás: políticas a nivel de API, autenticación JWT, rate limiting por usuario, o auditoría L7.

**Por qué**: La mejor práctica es defensa en profundidad: NetworkPolicy para segmentación básica (defensa L3/L4, más robusta porque no depende de sidecar), AuthorizationPolicy para defensa L7 (más granular pero requiere Service Mesh). Un atacante que evite el sidecar será bloqueado por NetworkPolicy (L3/L4). Un atacante que tenga acceso a la red será limitado por AuthorizationPolicy (no puede hacer requests a paths no autorizados).

---

### 6. [Conectar] ¿Cómo funciona exactamente el mTLS en un Service Mesh? ¿Qué es el "auto mTLS" y cómo resuelve el problema de migración gradual?

**Respuesta**: mTLS en Service Mesh: 1) El control plane (istiod, Linkerd) emite certificados X.509 a cada proxy sidecar (identidad SPIFFE), 2) Cuando el sidecar cliente se conecta al sidecar servidor, ambos presentan sus certificados, 3) El sidecar cliente verifica que el certificado del servidor es válido y corresponde a la identidad esperada (según la política), 4) La conexión se cifra con TLS. "Auto mTLS" (Istio) / "permissive mode": permite que un servicio acepte tanto tráfico mTLS (desde sidecars) como tráfico plaintext (desde servicios sin sidecar, durante la migración). Esto resuelve la migración gradual: podés desplegar el mesh incrementalmente sin romper comunicación entre servicios con y sin sidecar.

**Por qué**: El "auto mTLS" de Istio usa un feature llamado "traffic shifting": cuando un sidecar detecta que el peer también tiene sidecar, hace mTLS. Cuando detecta que el peer no tiene, hace plaintext. Esto permite migrar una flota de servicios a Service Mesh uno por uno, sin un "flag day" (día donde todos migran simultáneamente). Linkerd tiene un feature similar (identity-based routing con fallback).

---

### 7. [Conectar] ¿Qué es exactamente "kube-proxy" y cómo se diferencia de los proxies de Service Mesh? ¿Qué significa que kube-proxy opera a L4 y el Service Mesh a L7?

**Respuesta**: kube-proxy (componente de K8s, corre en cada nodo) implementa Service abstraction a nivel L4: mantiene reglas iptables/IPVS que mapean ClusterIP (VIP) → Pod IPs. Opera a nivel TCP/UDP (L4): balancea conexiones, no entiende HTTP, no puede hacer retries, circuit breaking, o routing por headers. Service Mesh proxies (Envoy, linkerd-proxy, sidecar) operan a L7: entienden HTTP/1.1, HTTP/2, gRPC. Pueden: 1) Enrutar basado en headers/path (no solo IP), 2) Hacer retries y timeouts, 3) Traffic splitting (canary), 4) Colectar métricas por endpoint (latencia, status codes), 5) Aplicar políticas de seguridad L7 (RBAC por API path). kube-proxy es esencial para networking básico en K8s. Service Mesh agrega L7 encima.

**Por qué**: kube-proxy usa iptables (modo por defecto) o IPVS. En iptables mode, KUBE-SERVICES chain contiene reglas para cada Service (DNAT del ClusterIP a un endpoint Pod IP). Con 1000 Services, hay ~5000+ reglas que se evalúan para cada paquete (O(n)). Service Mesh proxys operan a L7 y agregan overhead de procesamiento por request (~1-5ms), pero habilitan features avanzadas que kube-proxy no puede.

---

### 8. [Cuestionar] ¿Es Service Mesh (Istio/Linkerd) una necesidad real o un lujo para la mayoría de las empresas? ¿A partir de qué escala se justifica?

**Respuesta**: Para empresas con <10 microservicios, Service Mesh es overkill: la complejidad de operar Istio/Linkerd supera los beneficios. mTLS y observabilidad L7 pueden implementarse con soluciones más simples (cert-manager para TLS, OpenTelemetry para tracing, Prometheus para métricas). Service Mesh se justifica cuando: 1) 20+ microservicios con comunicación compleja, 2) Necesitás trazabilidad end-to-end automática sin instrumentar cada app, 3) Requisitos de seguridad requieren mTLS universal y políticas de acceso L7, 4) Necesitás traffic management avanzado (canary, dark launches, fault injection). La complejidad operativa de Istio es real (sidecars, debugging de red con dos proxies adicionales por llamada). Linkerd es más simple y ligero (proxy en Rust, zero config mTLS), siendo una mejor opción para empresas que recién adoptan Service Mesh.

**Por qué**: William Morgan (CEO Buoyant, creador de Linkerd) argumenta que Linkerd fue diseñado para ser "un service mesh que no requiere un equipo dedicado", justamente porque Istio es demasiado complejo para la mayoría. Istio, por otro lado, tiene features que Linkerd no (Wasm plugins, multi-cluster avanzado, Envoy ecosystem). La decisión: ¿necesitás las features avanzadas de Istio y tenés equipo para operarlo? Si no, Linkerd o incluso no usar mesh.

---

### 9. [Cuestionar] CNI plugins: ¿Calico, Cilium, o Flannel? ¿Cómo elegir el CNI correcto para tu cluster?

**Respuesta**: Flannel: el más simple, overlay VXLAN/host-gw. No soporta NetworkPolicy (necesita extensiones como Canal). Ideal para desarrollo, aprendizaje, y clusters pequeños sin requisitos de seguridad. Calico: usa BGP puro (sin overlay, mejor rendimiento) o VXLAN/IPIP. Soporta NetworkPolicy y Calico NetworkPolicy (más expresivo que K8s NetworkPolicy). Ideal para producción con alta performance y network security. Cilium: usa eBPF (máximo rendimiento, L7 observability sin sidecar). Soporta NetworkPolicy, API-level security, y replacement de kube-proxy. Ideal para producción avanzada con service mesh integrado, multi-cluster, y seguridad L7. Elección: Flannel para simplicidad, Calico para performance + seguridad, Cilium para lo más avanzado.

**Por qué**: El benchmark de CNI (KubeCon 2023, Isovalent) mostró que Cilium eBPF tiene el mejor rendimiento y menor latencia. Calico BGP es similar en rendimiento (sin overhead de overlay). Flannel es el más usado por simplicidad, pero sin NetworkPolicy no es apto para producción con requisitos de seguridad. Canal (Calico + Flannel) combina simplicidad de Flannel con NetworkPolicy de Calico. La tendencia: Cilium está ganando adopción rápidamente (default en GKE Dataplane V2, EKS-A, Azure CNI).

---

### 10. [Cuestionar] ¿Es el modelo de red de K8s ("todos los Pods pueden comunicarse") un riesgo de seguridad inherente? ¿Debería cambiarse el default a "deny all"?

**Respuesta**: El modelo default-allow es un riesgo: un Pod comprometido puede escanear y atacar cualquier otro Pod en el cluster (todos los Pods son alcanzables sin NAT). En contraste, Docker bridge default está aislado (solo comunicación entre contenedores en la misma red). El modelo de K8s fue diseñado para simplicidad (Borg, el predecesor de K8s, también era flat network) antes de que la seguridad multi-tenant fuera prioritaria. Hoy, la mejor práctica es: 1) Implementar NetworkPolicy deny-all por defecto en cada namespace, 2) Cada aplicación declara explícitamente qué comunicación necesita (allow list). Pero cambiar el default a deny-all rompería compatibilidad hacia atrás. Herramientas como Kyverno/OPA Gatekeeper pueden forzar políticas de red por defecto.

**Por qué**: La comunidad de K8s ha debatido esto por años (issue #1246, 2015). La conclusión es que cambiar el default rompería demasiados clusters existentes. En cambio, K8s agregó NetworkPolicy como mecanismo para implementar deny-all. Para nuevos clusters, se recomienda: habilitar NetworkPolicy desde el día 1, usar un admission controller que rechace Pods sin NetworkPolicy, y usar service mesh para mTLS entre Pods (defensa en profundidad).
