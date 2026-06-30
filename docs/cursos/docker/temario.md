---
sidebar_position: 2
sidebar_label: "Temario"
---

## Estructura de cada Módulo

Cada módulo tiene su carpeta en `Modulos/` con 5 archivos:

| Archivo | Propósito |
|---------|-----------|
| `clase.md` | Lección teórica con ejemplos prácticos |
| `ejercicio.md` | Enunciados de ejercicios prácticos (4-6 por módulo) |
| `respuesta.md` | Soluciones completas con comandos comprobables |
| `diap.pptx` | Diapositivas PowerPoint (8-10 slides) para dictar la clase |
| `cuestionario.md` | 10 preguntas de nivel medio con respuestas |

---

## SEMANA 1 — Fundamentos de Docker

> **Objetivo:** Entender la virtualización por contenedores, instalar Docker, dominar el ciclo de vida de contenedores e imágenes, volúmenes y persistencia.

---

### Módulo 01 — Introducción a Contenedores y Docker
- `01-Introduccion-Contenedores/`

- ¿Qué son los contenedores? vs Máquinas Virtuales
- Historia: LXC, Docker, OCI, containerd
- Arquitectura de Docker: cliente, servidor (dockerd), runtime
- Imagen vs contenedor: diferencias fundamentales
- Capas (layers) y Union Filesystem (OverlayFS)
- Registro de imágenes (Docker Hub, registros privados)
- Ecosystem: Docker Compose, Swarm, Kubernetes
- Ciclo de vida de un contenedor: pull, run, stop, rm
- Aislamiento: namespaces (pid, net, mnt, uts, ipc, user)
- Limitación de recursos: cgroups (CPU, memoria, I/O)

---

### Módulo 02 — Instalación y Configuración
- `02-Instalacion-Configuracion/`

- Instalación en Windows (Docker Desktop con WSL 2)
- Instalación en macOS (Docker Desktop o Colima)
- Instalación en Linux (Ubuntu, Debian, Fedora, Arch)
- `docker version` y `docker info` — verificar instalación
- Configuración de Docker Engine: daemon.json
- Directorios importantes: `/var/lib/docker`, `~/.docker/`
- Contextos de Docker: `docker context`
- Configuración de recursos en Docker Desktop
- WSL 2: integración, rendimiento, config
- Solución de problemas comunes de instalación

---

### Módulo 03 — Comandos Fundamentales de Docker
- `03-Comandos-Fundamentales/`

- `docker run` — crear y ejecutar contenedores
- `docker ps` — listar contenedores en ejecución
- `docker ps -a` — listar todos los contenedores
- `docker stop`, `docker start`, `docker restart`
- `docker rm` — eliminar contenedores
- `docker logs` — ver logs de un contenedor
- `docker exec -it` — ejecutar comandos dentro del contenedor
- `docker inspect` — metadatos detallados
- `docker stats` — estadísticas de uso de recursos
- Flags importantes: `-d` (detach), `-it` (interactivo), `--rm` (autoeliminar), `--name`

---

### Módulo 04 — Imágenes y Dockerfiles
- `04-Imagenes-Dockerfiles/`

- `docker pull` — descargar imágenes del registro
- `docker images` — listar imágenes locales
- `docker rmi` — eliminar imágenes
- `docker build` — construir imágenes desde Dockerfile
- Sintaxis de Dockerfile: FROM, RUN, COPY, ADD, CMD, ENTRYPOINT
- EXPOSE, ENV, ARG, WORKDIR, USER, LABEL
- Jerarquía de capas: cada instrucción crea una capa
- Caché de construcción: orden óptimo de instrucciones
- `docker history` — ver capas de una imagen
- Buenas prácticas: imágenes pequeñas, capas mínimas, .dockerignore

---

### Módulo 05 — Volúmenes y Persistencia de Datos
- `05-Volumenes-Persistencia/`

- Estado efímero de los contenedores
- Tipos de montaje: bind mount, volume, tmpfs
- `docker volume create`, `docker volume ls`, `docker volume rm`
- `docker run -v` y `--mount` — montar volúmenes
- Bind mounts: montar directorio del host en el contenedor
- Volúmenes anónimos vs nombrados
- `docker volume prune` — limpiar volúmenes no usados
- Compartir datos entre contenedores
- Backup y restore de volúmenes
- Persistencia en producción: NFS, EBS, CSI drivers

---

## SEMANA 2 — Redes, Compose y Registros

> **Objetivo:** Dominar redes Docker, orquestación multi-contenedor con Compose, configuración avanzada y optimización de imágenes.

---

### Módulo 06 — Redes en Docker
- `06-Redes-Docker/`

- `docker network` — gestión de redes
- Tipos de red: bridge, host, none, overlay, macvlan
- Bridge network: comunicación entre contenedores en el mismo host
- `docker network create` — redes personalizadas
- `docker run --network` — conectar contenedor a una red
- `docker network connect` / `disconnect`
- DNS interno de Docker: resolución por nombre de contenedor
- Exposición de puertos: `-p` (publish) y `-P` (random)
- Host networking: rendimiento máximo
- Macvlan: direcciones IP propias para cada contenedor

---

### Módulo 07 — Docker Compose
- `07-Docker-Compose/`

- ¿Qué es Docker Compose? — orquestación multi-contenedor
- `docker-compose.yml` — estructura y sintaxis YAML
- Servicios, redes y volúmenes en Compose
- `docker compose up`, `docker compose down`
- `docker compose ps`, `docker compose logs`
- `docker compose exec` — ejecutar comandos en servicios
- `docker compose build` — construir imágenes del compose
- `depends_on` — orden de inicio de servicios
- `healthcheck` — verificar salud del servicio
- `docker compose profiles` — perfiles de servicios

---

### Módulo 08 — Variables de Entorno y Configuración
- `08-Variables-Entorno-Configuracion/`

- `ENV` en Dockerfile — variables de entorno en build-time
- `docker run -e` — pasar variables al contenedor
- `--env-file` — archivo de variables de entorno
- `docker compose environment` y `env_file`
- Orden de precedencia de variables
- `.env` en Docker Compose — interpolación de variables
- ARG vs ENV: build-time vs run-time
- Secrets en Docker Compose (v3.1+)
- Configs en Docker Swarm
- Buenas prácticas: no hardcodear secrets, usar .env.example

---

### Módulo 09 — Registros de Imágenes (Docker Hub, Registros Privados)
- `09-Registros-Docker-Hub/`

- Docker Hub: repositorios públicos y privados
- `docker login`, `docker logout`
- `docker tag` — etiquetar imágenes
- `docker push` — subir imágenes al registro
- Nomenclatura: `usuario/imagen:tag`
- Registros privados: `docker registry` (imagen oficial)
- `docker run registry` — levantar registro local
- Autenticación y autorización en registros privados
- Harbor: registro empresarial con escáner de vulnerabilidades
- GitHub Container Registry (ghcr.io), AWS ECR, Azure ACR, Google GAR

---

### Módulo 10 — Multi-stage Builds y Optimización de Imágenes
- `10-MultiStage-Build-Optimizacion/`

- Problema: imágenes grandes (ej: SDK de Java, Node)
- Multi-stage build: múltiples FROM en un Dockerfile
- `COPY --from=etapa` — copiar artefactos entre etapas
- Imágenes base: Alpine, Distroless, Slim
- `docker-slim` — minimizar imágenes automáticamente
- Análisis con Dive: inspeccionar capas
- Hadolint: linter para Dockerfiles
- Caché eficiente: ordenar instrucciones por frecuencia de cambio
- .dockerignore: excluir archivos innecesarios
- Benchmarks: optimizar tiempo de build y tamaño final

---

## SEMANA 3 — Orquestación y Producción con Swarm

> **Objetivo:** Orquestar contenedores con Docker Swarm, gestionar servicios, seguridad, logs y monitoreo en producción.

---

### Módulo 11 — Docker Swarm (Modo Swarm)
- `11-Docker-Swarm/`

- ¿Qué es Docker Swarm? — orquestador nativo de Docker
- Conceptos: manager node, worker node, raft consensus
- `docker swarm init` — inicializar swarm
- `docker swarm join` — agregar nodos
- `docker node ls` — listar nodos del cluster
- Alta disponibilidad: múltiples managers (3, 5)
- Tolerancia a fallos: quorum de managers
- Lock del swarm: `--autolock`
- Actualización y rollback de managers
- Modo swarm vs Docker Compose standalone

---

### Módulo 12 — Servicios, Stacks y Secrets en Swarm
- `12-Servicios-Stacks-Secrets/`

- `docker service create` — crear servicio replicado
- `docker service ls`, `docker service ps`
- `docker service scale` — escalar servicios
- `docker service update` — rolling update
- `docker service rollback` — revertir actualización
- Modos de replicación: replicated vs global
- Stacks: `docker stack deploy` desde compose file
- Secrets en Swarm: `docker secret create`
- Configs en Swarm: `docker config create`
- Healthchecks en servicios swarm

---

### Módulo 13 — Seguridad en Docker
- `13-Seguridad-Docker/`

- Aislamiento por namespaces y cgroups
- `docker run --security-opt` — opciones de seguridad
- `--cap-drop`, `--cap-add` — capacidades de Linux
- `--privileged` — (NO USAR en producción)
- `USER` en Dockerfile — no ejecutar como root
- `seccomp` — perfiles de llamadas al sistema
- `AppArmor` y `SELinux` — perfiles de seguridad
- Escaneo de vulnerabilidades: Trivy, Snyk, Docker Scout
- Content Trust: `DOCKER_CONTENT_TRUST=1`
- `docker scan` y firmado de imágenes con Notary/Cosign

---

### Módulo 14 — Logs, Monitoreo y Healthchecks
- `14-Logs-Monitoreo-Healthchecks/`

- `docker logs` — logs de contenedores individuales
- `docker logs -f`, `--tail`, `--since`
- Drivers de logging: json-file, syslog, fluentd, awslogs, gelf
- `docker compose logs -f` — logs de servicios
- Docker stats y `docker events`
- Healthcheck en Dockerfile: `HEALTHCHECK` instruction
- Healthcheck en Compose: `healthcheck:` bloque
- Prometheus + cAdvisor: métricas de contenedores
- Grafana: dashboards de monitoreo
- ELK/Promtail + Loki: centralización de logs

---

### Módulo 15 — Docker en Producción (Recursos, Políticas y Restarts)
- `15-Docker-Produccion-Recursos/`

- Límites de recursos: `--memory`, `--cpus`, `--memory-reservation`
- `docker update` — actualizar recursos en caliente
- Políticas de reinicio: `--restart no | on-failure | always | unless-stopped`
- `--stop-timeout` — gracia para detener contenedores
- OOM Killer: cómo prevenirlo con reservas de memoria
- `--pids-limit` — prevenir fork bombs
- `--ulimit` — límites del sistema
- `docker system df` — uso de disco
- `docker system prune` — limpieza de recursos no usados
- `docker system events` — monitoreo de eventos del daemon

---

## SEMANA 4 — Kubernetes y Contenedores Avanzados

> **Objetivo:** Introducción a Kubernetes, gestión de configuraciones, Helm, networking avanzado y registros empresariales.

---

### Módulo 16 — Introducción a Kubernetes (Pods, Deployments, Services)
- `16-Introduccion-Kubernetes/`

- ¿Qué es Kubernetes? — orquestador de contenedores
- Arquitectura: control plane, nodes, etcd, kubelet, kube-proxy
- Pod: la unidad mínima (uno o más contenedores)
- Deployment: declarar el estado deseado de Pods
- Service: abstracción de red para Pods
- `kubectl` — comandos básicos (get, describe, logs, exec)
- Minikube, kind, k3s: clústeres locales para desarrollo
- Namespaces: aislamiento lógico en K8s
- Labels y Selectors: organización de recursos
- Deployments: rolling update, rollback, replicas

---

### Módulo 17 — ConfigMaps, Secrets y Volumes en Kubernetes
- `17-ConfigMaps-Secrets-Volumes-K8s/`

- ConfigMap: configuración desacoplada de la imagen
- `kubectl create configmap` — desde literales, archivos, directorios
- Secret: datos sensibles (base64, cifrado en reposo con KMS)
- `kubectl create secret` — generic, tls, docker-registry
- Volumes en K8s: emptyDir, hostPath, PVC, PV
- PersistentVolume (PV) y PersistentVolumeClaim (PVC)
- StorageClass: almacenamiento dinámico (EBS, Azure Disk, GCE PD)
- StatefulSet: aplicaciones con estado (bases de datos)
- CSI (Container Storage Interface): drivers de almacenamiento
- Buenas prácticas: Secrets con Sealed Secrets, External Secrets Operator

---

### Módulo 18 — Helm Charts
- `18-Helm-Charts/`

- ¿Qué es Helm? — gestor de paquetes para Kubernetes
- Helm 3: sin Tiller, modelo de seguridad mejorado
- `helm create` — estructura de un Chart
- Templates Go: valores, variables, funciones
- `values.yaml` — configuración por defecto
- `helm install`, `helm upgrade`, `helm rollback`
- `helm repo add` — repositorios de Charts
- ArtefactHub: https://artifacthub.io
- Charts oficiales: nginx, redis, postgresql, cert-manager
- Dependencias y sub-charts

---

### Módulo 19 — Networking y Service Mesh
- `19-Networking-Service-Mesh/`

- Modelo de red de K8s: CNI (Calico, Flannel, Cilium, Weave)
- Service types: ClusterIP, NodePort, LoadBalancer, ExternalName
- Ingress Controller: Nginx, Traefik, HAProxy, Kong
- Ingress resources: reglas de enrutamiento HTTP/HTTPS
- NetworkPolicies: firewall entre Pods
- Service Mesh: Istio, Linkerd, Consul
- Sidecar proxy: Envoy (Istio), linkerd-proxy
- mTLS: tráfico cifrado entre servicios
- Observabilidad: métricas, trazabilidad, logs
- Gateway API: evolución de Ingress

---

### Módulo 20 — Docker Registry, Harbor y Gestión de Artefactos
- `20-Registry-Harbor-Artefactos/`

- Docker Registry: implementación open-source
- Harbor: registro cloud-native con UI, RBAC, escaneo
- Autenticación: LDAP, OIDC, token-based
- Replicación entre registros (push/pull)
- Garbage collection en registros
- Escaneo de vulnerabilidades con Trivy
- Notary + Cosign: firma de imágenes
- OCI artifacts: Helm Charts, OPA bundles, etc.
- Retención de artefactos: políticas de limpieza
- Proxy cache: Docker Hub mirror con Harbor

---

## SEMANA 5 — DevOps, Cloud y Proyecto Final

> **Objetivo:** Integrar Docker con CI/CD, aplicaciones, cloud providers, dominar buenas prácticas y completar proyecto integrador.

---

### Módulo 21 — Docker en CI/CD (GitHub Actions, GitLab CI, Jenkins)
- `21-Docker-CICD/`

- Build de imágenes en CI: `docker/build-push-action`
- Caché de capas en CI: `docker/build-push-action` con cache-from/to
- `docker compose` en pipelines de CI
- Servicios auxiliares en CI (bases de datos, redis)
- Multi-platform builds: `docker buildx build --platform`
- Kaniko: build sin Docker daemon en K8s
- Testcontainers: testing de integración con contenedores
- Publicación en registros desde CI
- Etiquetado automático: git SHA, branch, tag semántico
- Escaneo de seguridad en el pipeline

---

### Módulo 22 — Docker con Aplicaciones (Spring Boot, Node.js, Python, .NET)
- `22-Docker-Aplicaciones/`

- Dockerizar una app Spring Boot: multi-stage build
- Dockerizar una app Node.js: Alpine, producción vs desarrollo
- Dockerizar una app Python: pip, poetry, dependencias
- Dockerizar una app .NET: SDK vs runtime
- Docker compose con stack completo: app + BD + cache + cola
- Variables de entorno por perfil (dev, staging, prod)
- Healthchecks específicos por tecnología
- Hot reload en desarrollo con volúmenes
- `docker-compose.override.yml` para desarrollo local
- Perfiles de Compose: `--profile`

---

### Módulo 23 — Docker en Cloud (AWS, Azure, GCP)
- `23-Docker-Cloud/`

- AWS ECS (Elastic Container Service): Fargate, EC2, ECR
- AWS EKS (Elastic Kubernetes Service)
- Azure Container Instances (ACI) y Azure Kubernetes Service (AKS)
- Google Cloud Run: serverless containers
- Google GKE (Google Kubernetes Engine)
- Docker en máquinas virtuales cloud (EC2, VM, Compute Engine)
- Terraform: infraestructura como código para Docker
- AWS Copilot: ECS simplificado
- Cloud-specific: ECR, ACR, GAR registries
- Costos y mejores prácticas en cloud

---

### Módulo 24 — Buenas Prácticas y Patrones Docker
- `24-Buenas-Practicas-Patrones/`

- Patrón Sidecar: contenedor auxiliar junto al principal
- Patrón Ambassador: proxy entre contenedor y mundo exterior
- Patrón Adapter: normalizar interfaces entre contenedores
- 12 Factor App en contenedores
- Un solo proceso por contenedor
- Imágenes inmutables: no actualizar dentro del contenedor
- Graceful shutdown: manejar SIGTERM correctamente
- `tini` o `dumb-init` como init process
- Labels para organización y metadatos
- Docker Bench Security: auditoría de seguridad

---

### Módulo 25 — Proyecto Final + Simulación de Entrevista
- `25-Proyecto-Final-Entrevista/`

**Módulo capstone integrador.** Simula un proyecto real y una entrevista técnica sobre Docker.

- Proyecto: arquitectura de microservicios completa con Docker Compose, Swarm o K8s
- 10 ejercicios prácticos combinando: Dockerfiles, Compose, redes, volúmenes, seguridad, CI/CD, cloud
- Ejercicios: dockerizar app Spring Boot + PostgreSQL + Redis, multi-stage build, Compose con healthchecks, Swarm stack con secrets, Kubernetes Deployment + Service + Ingress, CI/CD pipeline, escaneo de seguridad, monitoreo con cAdvisor + Prometheus, backup/restore de volúmenes, release con tags
- Cuestionario de 60 preguntas para el entrevistador (6 categorías)
- Escenarios: desarrollo, QA, producción, cloud, DevOps

---

## Resumen del Calendario

| Semana | Módulos | Fase | Contenido |
|--------|---------|------|-----------|
| **1** | 01 — 05 | Fundamentos de Docker | Contenedores, instalación, comandos, imágenes, volúmenes |
| **2** | 06 — 10 | Redes, Compose y Registros | Redes, Compose, config, registros, multi-stage builds |
| **3** | 11 — 15 | Orquestación con Swarm | Swarm, servicios, seguridad, logs, producción |
| **4** | 16 — 20 | Kubernetes y Avanzado | K8s, ConfigMaps, Helm, networking, Registry |
| **5** | 21 — 25 | DevOps y Proyecto Final | CI/CD, aplicaciones, cloud, buenas prácticas, simulación |

---

## Dominios de Práctica por Fase

| Fase | Dominio | Escenario |
|------|---------|-----------|
| Fundamentos | Desarrollo local | App simple en contenedor con persistencia |
| Redes y Compose | Equipo pequeño | Stack multi-servicio con Compose |
| Orquestación | Producción Swarm | Cluster Swarm con alta disponibilidad |
| Kubernetes | Equipo mediano | App desplegada en Kubernetes con Helm |
| DevOps | Enterprise | CI/CD + Cloud + Monitoreo + Seguridad |

---

## Criterios Generales de Evaluación

| Nivel | Descripción |
|-------|-------------|
| OK **Aprobado** | Contenedores funcionan, Dockerfiles eficientes, buenas prácticas aplicadas |
| Revisar **Revisar** | Funciona pero usa anti-patrones (ej: `--privileged`, imágenes enormes, sin .dockerignore) |
| Repetir **Repetir** | Contenedores no arrancan, errores de configuración, no comprende el concepto |

### Rúbrica por ejercicio

- **Corrección funcional (40%):** El resultado es el esperado
- **Optimización (25%):** Imágenes pequeñas, capas bien ordenadas, multi-stage cuando aplica
- **Buenas prácticas (20%):** Seguridad, healthchecks, graceful shutdown, .dockerignore
- **Infraestructura (15%):** Compose, redes, volúmenes, orquestación

---

## Línea de Tiempo y Diagrama de Avance (Gantt)

```
SEMANA 1                  SEMANA 2                  SEMANA 3                  SEMANA 4                  SEMANA 5
Fundamentos Docker        Redes y Compose           Orquestación Swarm        Kubernetes y Avanzado      DevOps + Proyecto Final
```

### Hitos por Semana

| Semana | Día | Hito | Módulo | Entregable |
|--------|-----|------|--------|------------|
| **1** | Lun | OK Docker instalado y funcionando | M01 | `docker --version` + `hello-world` |
| **1** | Mar | OK Configuración completa del entorno | M02 | `docker info` sin errores |
| **1** | Mié | OK Primeros contenedores ejecutados | M03 | Contenedor nginx accesible en localhost |
| **1** | Jue | OK Dockerfile propio creado | M04 | Imagen propia subida a Docker Hub |
| **1** | Vie | OK Volumen creado y datos persistentes | M05 | Contenedor que sobrevive a `docker rm` |
| **2** | Lun | OK Red bridge personalizada funcionando | M06 | Ping entre contenedores por nombre |
| **2** | Mar | OK Compose con 2+ servicios | M07 | App web + BD funcionando con `up -d` |
| **2** | Mié | OK Variables de entorno aplicadas | M08 | `.env` separado por entorno |
| **2** | Jue | OK Imagen subida a registro | M09 | `docker push` exitoso a Docker Hub |
| **2** | Vie | OK Multi-stage build optimizado | M10 | Imagen reducida >50% de tamaño |
| **3** | Lun | OK Swarm inicializado con 2 nodos | M11 | `docker node ls` con manager + worker |
| **3** | Mar | OK Servicio escalado en Swarm | M12 | Stack con 3 réplicas y secrets |
| **3** | Mié | OK Contenedor no-root con cap-drop | M13 | Escaneo Trivy sin vulnerabilidades críticas |
| **3** | Jue | OK Logs centralizados con Loki | M14 | Dashboard Grafana con métricas |
| **3** | Vie | OK Recursos limitados y restart policy | M15 | Contenedor con memory/cpu limit |
| **4** | Lun | OK Kubernetes local funcionando | M16 | `kubectl get nodes` + Deployment creado |
| **4** | Mar | OK ConfigMap y Secrets aplicados | M17 | App leyendo configuración de K8s |
| **4** | Mié | OK Helm Chart desplegado | M18 | `helm install` + `helm upgrade` |
| **4** | Jue | OK Ingress configurado | M19 | App accesible por dominio local |
| **4** | Vie | OK Harbor registry levantado | M20 | Imagen escaneada y firmada |
| **5** | Lun | OK Pipeline CI/CD construye imagen | M21 | Build automático en GitHub Actions |
| **5** | Mar | OK App dockerizada con multi-stage | M22 | Spring Boot/Node.js en contenedor |
| **5** | Mié | OK App desplegada en cloud | M23 | ECS/Cloud Run funcionando |
| **5** | Jue | OK Docker Bench Security pasado | M24 | Score > 90% en auditoría |
| **5** | Vie | OK Proyecto final + entrevista | M25 | Stack completo + 60 preguntas |

### Progreso Visual

| Semana | Módulos | Avance | Barra de progreso |
|--------|---------|--------|--------------------|
| **1**   | 01 — 05 | 20%   | `#####-----------------------`  5/25 |
| **2**   | 06 — 10 | 40%   | `##########------------------` 10/25 |
| **3**   | 11 — 15 | 60%   | `###############-------------` 15/25 |
| **4**   | 16 — 20 | 80%   | `####################--------` 20/25 |
| **5**   | 21 — 25 | 100%  | `#############################` 25/25 |

---

## Recursos de Referencia

- - **Libro base:** `../Libros/docker-deep-dive.pdf` (https://www.amazon.com/Docker-Deep-Dive-Nigel-Poulton/dp/1521822808)
- - **Docker Docs:** https://docs.docker.com
- Y"- **Docker Hub:** https://hub.docker.com
- YT **Play with Docker:** https://labs.play-with-docker.com
- - **Docker Captain:** https://www.docker.com/community/captains
- - **Plan de Acción:** `../Plan-Accion-Curso.md`

## Cursos en Video de Referencia

- - **Docker para desarrolladores (español):** [MoureDev Docker](https://www.youtube.com/watch?v=4Dko5B5fChA&list=PLNdFk2_bbNgY7D4TbLuOr7Y_l80SSLEId)
- - **Docker Deep Dive (inglés):** [Nigel Poulton Docker Course](https://www.youtube.com/watch?v=Gjnup-PuquQ)
- - **Kubernetes para desarrolladores:** [K8s en español - Pizzip](https://www.youtube.com/watch?v=o8L1S54RcCk&list=PLH31SaTAe3EwAeYml3kIXZpf5p6GZq7Sz)
- - **Docker Compose en 1 hora:** [TechWorld with Nana](https://www.youtube.com/watch?v=HUPKoECmYrI)
- - **Kubernetes en 4 horas:** [TechWorld with Nana K8s](https://www.youtube.com/watch?v=X48VuDVv0do)
