---
sidebar_label: "Cuestionario"
---

# Cuestionario M23 — Docker en Cloud

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente "Firecracker" y cómo AWS lo usa para Fargate y Lambda? ¿Qué lo hace diferente de una VM tradicional?

**Respuesta**: Firecracker (AWS, 2018, open-source) es un micro-VMM (Virtual Machine Monitor) diseñado específicamente para ejecutar cargas de trabajo serverless y contenedores con la velocidad de un contenedor y la seguridad de una VM. Usa KVM (Kernel-based Virtual Machine) para crear micro-VMs que arrancan en ~125ms (vs segundos de una VM tradicional) y consumen ~5 MB de memoria overhead (vs cientos de MB de QEMU). Cada task de Fargate y cada ejecución de Lambda corre en su propia micro-VM Firecracker aislada. Diferencia con VM tradicional: no emula hardware completo (no BIOS, no VGA, no USB), solo expone dispositivos mínimos (virtio-net, virtio-block). Diferencia con contenedor: Firecracker virtualiza el kernel (cada micro-VM tiene su propio kernel Linux), lo que da más aislamiento que namespaces (ideal para multi-tenant).

**Por qué**: Firecracker fue desarrollado por AWS (Adrian Catangiu, Alexandra Gheorghe, et al.) basado en la experiencia de Google con gVisor y la necesidad de aislar Lambda functions de diferentes clientes en el mismo hardware. La combinación Fargate + Firecracker es lo que permite que AWS ofrezca "serverless containers" sin que los clientes compartan kernel (aislamiento fuerte). Rust (Firecracker está escrito en Rust, más seguro en memoria) y KVM son la base técnica.

---

### 2. [Investigar] ¿Qué es exactamente "Karpenter" y cómo mejora el auto-scaling de nodos en Kubernetes comparado con Cluster Autoscaler?

**Respuesta**: Karpenter (AWS, 2021, open-source) es un auto-scaler de nodos para Kubernetes que reemplaza al Cluster Autoscaler con decisiones más rápidas y flexibles. Diferencias: 1) CA espera que Pods estén en estado `Pending` para escalar (reactivo, puede tardar minutos). Karpenter evalúa constraints de scheduling en tiempo real y escala proactivamente (en segundos). 2) CA solo puede escalar Auto-Scaling Groups predefinidos. Karpenter selecciona dinámicamente el tipo de instancia óptimo (entre cientos de tipos EC2) basado en los Pods pendientes, sin predefinir grupos. 3) Karpenter consolida workloads agresivamente (reubica Pods a instancias más baratas o más eficientes, terminando las menos eficientes). 4) Karpenter puede manejar taints/tolerations, topology spread, y afinidad/anti-afinidad para scheduling óptimo.

**Por qué**: Karpenter fue creado por el equipo de AWS Kubernetes (Ellis Tarn, Prateek Gogia). Es open-source (Apache 2.0) pero con fuerte integración AWS (soporta EC2 y Fargate). La filosofía: "just-in-time capacity". En lugar de gestionar grupos de nodos rígidos, Karpenter crea la instancia exacta que los Pods necesitan, cuando la necesitan, y la elimina cuando no se necesita. Es la evolución del auto-scaling en K8s cloud.

---

### 3. [Investigar] ¿Qué es exactamente "Knative" y cómo se relaciona con Cloud Run? ¿Qué proporciona Knative que K8s nativo no tiene?

**Respuesta**: Knative (Google, 2018, proyecto CNCF) es un framework serverless sobre Kubernetes. Cloud Run (Google Cloud) es la versión gestionada de Knative. Knative proporciona: 1) **Knative Serving**: abstracción `Service` que define una aplicación, su imagen, y escala automáticamente a cero basado en tráfico HTTP. K8s nativo requiere Deployment + Service + HPA + Ingress (4 recursos) para funcionalidad similar, pero no escala a cero. 2) **Knative Eventing**: abstracciones para event-driven architectures (Broker, Trigger, Channel) que conectan fuentes de eventos (S3, Pub/Sub, Kafka) con servicios. 3) **Auto-TLS**: integración con cert-manager para TLS automático. 4) **Traffic splitting**: canary, blue/green deployments a nivel de revisión. Knative convierte K8s en una plataforma PaaS similar a Heroku pero con toda la flexibilidad de K8s.

**Por qué**: Knative fue creado por Google (basado en la experiencia de App Engine y Cloud Run) en colaboración con Pivotal, IBM, Red Hat. Cloud Run for Anthos es Knative gestionado. La diferencia con K8s nativo: K8s te da bloques de construcción (Deployment, Service), Knative te da una experiencia PaaS (especificás imagen + tráfico, y Knative maneja el resto). La escala a cero de Knative usa el "activator" (un proxy que encola requests mientras la instancia arranca) y el "autoscaler" (scale-to-zero cuando no hay requests por un período configurable).

---

### 4. [Investigar] ¿Qué es exactamente "FinOps" en el contexto de contenedores cloud? ¿Cómo se optimizan costos de ECS/EKS/Cloud Run?

**Respuesta**: FinOps es la práctica de gestionar costos cloud de manera colaborativa entre finanzas, operaciones, y desarrollo. En contenedores cloud: 1) **Rightsizing**: ajustar CPU/memoria requests y limits basado en uso real (métricas de Prometheus/CloudWatch), no en guesses. La mayoría de los equipos sobredimensionan (requests 3-5x el uso real), desperdiciando 50-70% del costo. 2) **Spot/Preemptible instances**: para workloads tolerantes a fallos, usar instancias spot (60-90% descuento) en EKS/Karpenter o Fargate Spot. 3) **Scaling**: auto-scaling basado en métricas reales (no solo CPU, sino también requests por segundo, queue depth), y scale-to-zero para dev/staging (Cloud Run lo hace nativo, ECS con Fargate necesita scripting). 4) **Commitment discounts**: Savings Plans (AWS), Reserved Instances, Committed Use Discounts (GCP) para cargas estables. 5) **Tagging**: labels en todos los recursos para atribuir costos a equipos/proyectos.

**Por qué**: La FinOps Foundation (parte de la Linux Foundation) publica el "State of FinOps" anualmente. En 2024, el reporte muestra que el 65% de las organizaciones tienen "waste" en contenedores (recursos no usados). Herramientas como Kubecost, CloudHealth, y Vantage analizan el uso de recursos por namespace/Pod y recomiendan optimizaciones. Para contenedores, el mayor ahorro viene de rightsizing (ajustar requests/limits a uso real) y usar instancias spot para dev/staging.

---

### 5. [Conectar] La clase menciona ECS, EKS, ACI, Cloud Run. ¿Cómo elegir entre un managed K8s (EKS/AKS/GKE) y un serverless container service (Fargate/Cloud Run/ACI)?

**Respuesta**: Elegir managed K8s (EKS/AKS/GKE) cuando: necesitás el ecosistema de K8s (Helm, operators, service mesh, CRDs), tenés workloads con requisitos de red complejos (NetworkPolicy, multi-cluster), querés portabilidad multi-cloud (misma plataforma en AWS, Azure, on-prem), o tu aplicación ya está empaquetada como Helm charts. Elegir serverless containers (Fargate/Cloud Run/ACI) cuando: querés simplicidad operativa (cero gestión de nodos/cluster), el tráfico es variable o intermitente (pagar solo por uso), la aplicación es stateless HTTP/gRPC (Cloud Run) o batch jobs (Fargate tasks), o el equipo es pequeño y no tiene expertise en K8s. Cloud Run es ideal para APIs y microservicios HTTP. Fargate es ideal para tasks batch o aplicaciones que necesitan más control (VPC, secrets). ACI es ideal en ecosistema Azure.

**Por qué**: La encuesta de CNCF (2024) muestra que el 50% de las organizaciones usan managed K8s y el 30% usan serverless containers. La tendencia es "managed K8s para la plataforma, serverless containers para las aplicaciones". Por ejemplo: equipo de plataforma gestiona EKS con Karpenter, los desarrolladores despliegan en Cloud Run (Knative sobre el mismo GKE) sin preocuparse por nodos.

---

### 6. [Conectar] ¿Cómo funciona el networking en AWS Fargate con el modo `awsvpc`? ¿Qué implicaciones tiene que cada task tenga su propia ENI?

**Respuesta**: En Fargate, el network mode `awsvpc` asigna una ENI (Elastic Network Interface) DEDICADA a cada task (grupo de contenedores). La ENI tiene una IP privada de la VPC. Todos los contenedores de la task comparten esta ENI (pueden comunicarse via `localhost` porque comparten network namespace). Implicaciones: 1) Cada task consume una ENI de la cuenta (límites de ENIs por región/instancia pueden ser restrictivos), 2) La task es directamente direccionable desde la VPC (sin NAT, sin overlay), simplificando conectividad con RDS, ElastiCache, etc., 3) Security Groups se aplican a nivel de ENI (a nivel de task, granular), 4) Los contenedores pueden usar cualquier puerto sin mapeo (la IP de la ENI expone todos los puertos directamente). El costo: ENIs son un recurso limitado (por defecto 5000 por región, ampliable). En K8s con CNI (AWS VPC CNI), cada Pod obtiene una ENI o una IP secundaria de una ENI compartida (más eficiente en uso de ENIs).

**Por qué**: `awsvpc` es el modo de red de Fargate porque no tenés control del host (no podés configurar bridges, iptables, o rutas). AWS abstrae el host y asigna una ENI directly-attached a la task via el hypervisor (Nitro). Esto es diferente al `bridge`/`host` de Docker standalone. La limitación práctica: con `awsvpc`, cada task usa una ENI, y si tenés muchas tasks pequeñas, podés agotar ENIs.

---

### 7. [Conectar] ¿Cómo funciona exactamente `gcloud run deploy` con `--no-traffic` y traffic splitting? ¿Cómo implementar blue/green deployment en Cloud Run?

**Respuesta**: `gcloud run deploy --no-traffic` despliega una nueva revisión pero NO le envía tráfico (0%). La revisión existente sigue recibiendo el 100%. Luego podés: 1) `gcloud run services update-traffic --to-revisions <new-revision>=10` (canary: enviar 10% a la nueva revisión), 2) Si funciona bien, aumentar a 50%, luego 100%, 3) Si falla, revertir a 100% a la revisión anterior con `--to-revisions <old-revision>=100`. También podés usar `--tag` para desplegar una revisión con una URL única (ej. `--tag staging`) que permite testear antes de enrutar tráfico. Cloud Run maneja el traffic splitting a nivel de load balancer (Google Front End), sin sidecar ni service mesh. Para blue/green: 1) Deploy blue (actual) con 100%, 2) Deploy green con `--no-traffic`, 3) Test green via tag URL, 4) Migrar tráfico: `update-traffic --to-revisions green=100`. Rollback instantáneo (vuelta a blue) sin re-deploy.

**Por qué**: Traffic splitting en Cloud Run es una feature nativa desde 2019. Internamente, Google Front End (GFE, el mismo load balancer que usa Google Search) distribuye las requests según los pesos. No hay sidecars ni proxies adicionales. La migración de tráfico es instantánea (se actualiza la configuración del GFE en segundos). Esto es más simple que Istio (Service Mesh) para blue/green.

---

### 8. [Cuestionar] ¿Es Terraform la herramienta correcta para gestionar infraestructura Docker/cloud en 2025 o Pulumi/Crossplane/CDKTF son superiores?

**Respuesta**: Terraform (HCL) sigue siendo la herramienta más madura y con mayor ecosistema de providers y módulos. Es la elección segura y standard. Pulumi es superior si el equipo prefiere lenguajes de programación reales (TypeScript, Python, Go) sobre HCL — permite loops, conditionals, y abstracciones con las herramientas que ya conocen. Crossplane es superior si la organización ya está centrada en Kubernetes y quiere GitOps (los recursos cloud se definen como YAML, reconciliados por controladores). CDKTF (CDK for Terraform) permite escribir Terraform en TypeScript/Python (generando JSON de Terraform), combinando lo mejor de ambos mundos. La tendencia: Terraform para equipos DevOps tradicionales, Pulumi para equipos developer-centric, Crossplane para platform engineering sobre K8s.

**Por qué**: El debate "Terraform vs Pulumi vs Crossplane" es activo en la comunidad. Terraform (HashiCorp) cambió su licencia a BSL (2023), lo que generó el fork OpenTofu (Linux Foundation). Pulumi es open-source (Apache 2.0). Para Docker/cloud, Terraform sigue siendo el estándar (el Docker provider y los cloud providers son maduros), pero Pulumi y OpenTofu están ganando adopción.

---

### 9. [Cuestionar] ¿Deberías usar un solo cloud provider para tus contenedores o adoptar multi-cloud desde el principio? ¿Cuándo vale la pena la complejidad de multi-cloud?

**Respuesta**: Para la mayoría de las empresas (startups, PyMEs, incluso grandes empresas que no son tech), single-cloud es suficiente y reduce complejidad operativa masivamente. Multi-cloud se justifica cuando: 1) Compliance/regulación (datos deben residir en país específico donde tu cloud primario no tiene región), 2) Estrategia de negocio (evitar vendor lock-in, poder de negociación con proveedores), 3) Adquisiciones/herencia (equipos que ya usan otro cloud), 4) Disaster recovery (segundo cloud como DR site), 5) Edge computing (diferentes ubicaciones geográficas con diferentes clouds). La complejidad de multi-cloud es alta: dos conjuntos de IAM, networking, monitoreo, CI/CD, y API diferentes. K8s ayuda a abstraer (EKS en AWS + GKE en GCP, misma aplicación), pero servicios gestionados alrededor de K8s (RDS vs Cloud SQL, ECR vs GAR, IAM) no son portables. Si no tenés una razón fuerte, single-cloud es la mejor decisión.

**Por qué**: La encuesta de Flexera (2024 State of the Cloud) muestra que el 89% de las empresas usan multi-cloud, PERO la mayoría es "multi-cloud accidental" (diferentes equipos eligieron diferentes clouds) o "hybrid" (on-prem + un cloud). La estrategia de "multi-cloud activo-activo" (misma aplicación corriendo en 2 clouds simultáneamente) es rara y costosa. Kelsey Hightower dijo: "Multi-cloud is not a strategy, it's an outcome".

---

### 10. [Cuestionar] ¿Son los "serverless containers" (Cloud Run, Fargate) el futuro, o Kubernetes gestionado (EKS, GKE) seguirá siendo el estándar para aplicaciones enterprise?

**Respuesta**: Ambos coexistirán. Serverless containers son el futuro para aplicaciones stateless HTTP/gRPC y event-driven (la mayoría de las nuevas aplicaciones). Kubernetes gestionado seguirá siendo el estándar para: 1) Aplicaciones stateful complejas (bases de datos con operadores), 2) Plataformas que necesitan extensibilidad (CRDs, admission webhooks), 3) Organizaciones que ya invirtieron en K8s (equipos de plataforma, GitOps, tooling). La tendencia: K8s se está volviendo invisible (GKE Autopilot, EKS Auto Mode, AKS Automatic) donde el proveedor gestiona el control plane y los nodos (similar a serverless), y los desarrolladores interactúan con una capa PaaS (Cloud Run for GKE, Knative). La línea entre "serverless containers" y "managed K8s" se está difuminando. El futuro: la experiencia para el desarrollador será serverless (especificá imagen + resources, la plataforma gestiona el resto), y la plataforma subyacente será K8s (con Knative, Karpenter, y operadores).

**Por qué**: Kubernetes co-founder Joe Beda (VMware) y Craig McLuckie (Google) han hablado sobre "Kubernetes disappearing into the infrastructure". GKE Autopilot (2021) y EKS Auto Mode (2024) son ejemplos: K8s sin gestionar nodos. Cloud Run for GKE (2022) ejecuta Knative sobre GKE, combinando serverless con K8s. La visión a 5 años: el desarrollador usa `gcloud run deploy` (o equivalente), y debajo hay K8s gestionado + Knative + Karpenter, invisible para el desarrollador.
