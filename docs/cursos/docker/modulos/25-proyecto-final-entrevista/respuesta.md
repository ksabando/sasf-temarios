---
sidebar_label: "Soluciones"
---

# Soluciones M25 — Proyecto Final y Simulación de Entrevista

## Ejercicio 1: Ciclo completo de imagen
**Solución esperada**:
```bash
# 1. Dockerfile → 2. Build → 3. Tag → 4. Push
docker build -t myapp:latest .
docker tag myapp:latest registry.example.com/myapp:v1.0.0
docker tag myapp:latest registry.example.com/myapp:$(git rev-parse --short HEAD)
docker push registry.example.com/myapp:v1.0.0
docker push registry.example.com/myapp:$(git rev-parse --short HEAD)
```

**Posibles mejoras**:
- Usar BuildKit para builds más rápidos y secretos de build: `DOCKER_BUILDKIT=1 docker build`.
- Agregar escaneo de seguridad antes del push: `trivy image --severity CRITICAL --exit-code 1 myapp:latest`.
- Firmar la imagen antes de publicar: `cosign sign --key cosign.key registry.example.com/myapp:v1.0.0`.
- Usar tagging múltiple: SHA (trazabilidad), semver (release), branch (entorno).

---

## Ejercicio 2: Redes y comunicación
**Solución esperada**:
- Red por defecto: `bridge`. Los contenedores en la red bridge default solo se comunican por IP, no por nombre.
- Red personalizada: `docker network create mynet` → los contenedores se comunican por nombre gracias al DNS embebido.
- Red overlay (Swarm): comunicación multi-host via VXLAN.
- Red host: el contenedor comparte el namespace de red del host.

**Posibles mejoras**:
- Usar siempre redes personalizadas en lugar de la red default para habilitar DNS y control de subred.
- Configurar `--internal` en redes que no necesitan acceso a internet (ej. red de base de datos) para reducir superficie de ataque.
- Aislar servicios con NetworkPolicies en K8s o `--internal` + segmentación en Docker.

---

## Ejercicio 3: Orquestación declarativa (Compose)
**Solución esperada**:
Docker Compose permite orquestación multi-contenedor declarativa. Un archivo `docker-compose.yml` define servicios, redes, volúmenes, variables de entorno, y dependencias. `docker compose up -d` levanta todo el stack.

**Posibles mejoras**:
- Usar override files para separar configuración por entorno: `docker-compose.yml` (base) + `docker-compose.prod.yml` (producción).
- Agregar HEALTHCHECK y `condition: service_healthy` para garantizar orden de inicio correcto y detección de fallas.
- Configurar `restart: unless-stopped` en servicios críticos para alta disponibilidad básica.

---

## Ejercicio 4: Orquestadores (Swarm vs K8s)
**Solución esperada**:
- **Swarm**: nativo de Docker, simple (`docker swarm init`), usa Compose para stacks, ideal para equipos pequeños con Docker experience.
- **Kubernetes**: ecosistema más grande, más complejo, estándar de la industria, soporta operadores, CRDs, service mesh, auto-scaling avanzado.

**Posibles mejoras**:
- Swarm: para proyectos chicos/medianos con menos de 10 servicios. K8s: para arquitecturas de microservicios con requisitos de escalado complejos.
- Considerar K3s (Kubernetes ligero) como puente entre Swarm y K8s completo para edge/IoT.
- Para desarrollo local, Docker Desktop incluye K8s integrado + Swarm mode; ambos pueden coexistir.

---

## Ejercicio 5: Ingress en K8s
**Solución esperada**:
Ingress es un recurso K8s que define reglas de enrutamiento HTTP/HTTPS (host, path) a Services internos. Requiere un Ingress Controller (nginx, traefik, haproxy) desplegado en el cluster para implementar las reglas.

**Posibles mejoras**:
- Configurar TLS con cert-manager y Let's Encrypt para certificados automáticos.
- Usar rewrite rules y rate limiting a nivel de Ingress para proteger servicios backend.
- Evaluar la API Gateway de K8s (sucesor de Ingress) para funcionalidades más avanzadas como header matching, weight-based routing (canary), y mirroring.

---

## Ejercicio 6: Persistencia de datos
**Solución esperada**:
- **Volúmenes Docker**: gestionados por Docker en `/var/lib/docker/volumes/`. Ciclo de vida independiente del contenedor.
- **Bind mounts**: directorio del host montado en el contenedor. Útil para desarrollo (hot reload).
- **PersistentVolumes/ PVCs** en K8s: almacenamiento con ciclo de vida independiente de Pods, provisionado estática o dinámicamente.

**Posibles mejoras**:
- Usar volúmenes con nombre en lugar de anónimos para facilitar backup y migración.
- Configurar StorageClass con provisionamiento dinámico en K8s para automatizar la creación de PVs.
- Implementar estrategia de backup: contenedor temporal con `tar` + cron para volúmenes Docker; Velero o CSI snapshots para K8s.

---

## Ejercicio 7: Optimización con multi-stage
**Solución esperada**:
Multi-stage build: múltiples `FROM` en el mismo Dockerfile. El stage final solo incluye los artefactos necesarios, descartando toolchains, compiladores, y dependencias de desarrollo.

**Posibles mejoras**:
- Medir la reducción: `docker images` antes y después de implementar multi-stage.
- Usar `dive` para analizar eficiencia de capas y detectar archivos residuales.
- Para Node.js: `npm ci --only=production` en el stage de build. Para Python: `pip install --no-cache-dir`. Para Go: `FROM scratch` como stage final.

---

## Ejercicio 8: Helm (gestor de paquetes K8s)
**Solución esperada**:
Helm empaqueta, distribuye, instala y gestiona aplicaciones K8s como Charts parametrizables. Charts contienen templates YAML con Go templates, values.yaml con defaults, y hooks para migraciones/validaciones.

**Posibles mejoras**:
- Usar OCI registries para almacenar charts: `helm push mychart oci://registry.example.com/charts`.
- Implementar GitOps con Flux/ArgoCD que usan Helm charts como fuente, reconciliando automáticamente el estado del cluster.
- Crear library charts (type: library) con templates reutilizables para estandarizar Deployments, Services, y ConfigMaps entre equipos.

---

## Ejercicio 9: Escaneo de vulnerabilidades
**Solución esperada**:
- **Trivy**: open-source, escanea paquetes de SO y dependencias de aplicación.
- **Docker Scout**: integrado con Docker Hub, análisis de dependencias transitivas y remediación contextual.
- **Snyk**: monitoreo continuo de vulnerabilidades y licencias.
- **Harbor**: escaneo automático al hacer push de imágenes.

**Posibles mejoras**:
- Integrar en CI/CD como quality gate: fallar el build si hay vulnerabilidades CRITICAL o HIGH.
- Usar `--ignore-unfixed` para no fallar por vulnerabilidades sin fix disponible.
- Escanear periódicamente imágenes en producción (no solo en el pipeline) y alertar sobre nuevas vulnerabilidades descubiertas en imágenes ya desplegadas.

---

## Ejercicio 10: Regla de oro de Docker
**Solución esperada**:
**Un proceso por contenedor, imágenes inmutables, configuración externalizada**. Cada contenedor ejecuta un solo proceso principal. La imagen se construye una vez y se despliega en todos los entornos sin modificaciones. La configuración se inyecta en runtime vía variables de entorno, archivos montados, o servicios de configuración.

**Posibles mejoras**:
- En Kubernetes, usar admission controllers (OPA/Gatekeeper) para validar que las imágenes desplegadas cumplen estas reglas (no-root, sin latest, con resource limits).
- Para imágenes inmutables, usar tags por SHA de git (`:${{ github.sha }}`) en lugar de tags mutables como `:latest`.
- Para configuración externalizada, usar herramientas como `external-secrets` (K8s) para sincronizar secretos de vaults externos (AWS Secrets Manager, Vault) automáticamente.

---

## Criterios de Evaluación del Proyecto Final

| Criterio | Peso | Descripción |
|----------|------|-------------|
| Dockerfiles optimizados | 15% | Multi-stage, capas ordenadas, sin secretos, no-root |
| Compose funcional | 15% | Servicios interconectados, healthchecks, depends_on |
| Seguridad aplicada | 15% | USER no-root, cap-drop, escaneo Trivy, sin privileged |
| CI/CD funcionando | 15% | Pipeline que construye, testea, escanea y publica |
| Kubernetes/Helm | 15% | Deployments, Services, ConfigMaps, Helm chart |
| Monitoreo | 10% | HEALTHCHECK, Prometheus metrics, logs estructurados |
| Documentación | 15% | README, comentarios en Dockerfile, diagrama de arquitectura |

---

## Preguntas Frecuentes de Entrevista (Resumen General)

1. **Diferencia entre CMD y ENTRYPOINT**: CMD es default sobreescribible; ENTRYPOINT es comando fijo.
2. **¿Cómo funciona el DNS interno de Docker?** Servidor DNS en 127.0.0.11 que resuelve nombres de contenedores en redes personalizadas.
3. **¿Qué hace docker commit?** Crea una imagen del estado de un contenedor. No usar en producción (no reproducible).
4. **¿Cómo limitar recursos?** `--cpus`, `--memory`, `--pids-limit` via cgroups.
5. **¿Qué es un volume driver?** Plugin que permite almacenar volúmenes en storage externo (NFS, EBS, Azure Disk).
6. **¿Rolling update en Swarm?** Actualización gradual de réplicas con delay y rollback automático en fallo.
7. **¿Qué es un Pod?** Unidad mínima de K8s: grupo de contenedores que comparten red y volúmenes.
8. **¿Autoescalado en K8s?** HPA ajusta réplicas por CPU/memoria/metrics custom; Cluster Autoscaler ajusta nodos.
9. **¿Sidecar container?** Contenedor auxiliar que extiende la funcionalidad del principal sin modificarlo.
10. **¿Cómo asegurar un contenedor?** No-root, cap-drop, seccomp, read-only FS, scan de vulnerabilidades, firma de imágenes.
