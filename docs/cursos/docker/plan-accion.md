---
sidebar_position: 1
private: true
sidebar_class_name: private
sidebar_label: "Plan de Acción"
---

## Metodología de Estudio por Módulo

Cada módulo sigue este flujo de trabajo. Respetar el orden maximiza el aprendizaje:

```
1. DIA POSITIVA   → Abrir diap.pptx, ver las 10 slides (15 min)
2. CLASE TE—RICA   → Leer clase.md completo, tomar notas (30 min)
3. EJERCICIOS      → Resolver ejercicio.md SIN ver la respuesta (60-90 min)
4. AUTO-CORRECCI—N → Comparar con respuesta.md, corregir errores (30 min)
5. CUESTIONARIO    → Responder las 10 preguntas de cuestionario.md (20 min)
6. REPASO          → Marcar dudas para preguntar al instructor (10 min)
```

> Revisar **Regla de oro:** No mirar `respuesta.md` hasta haber intentado todos los ejercicios.

---

## Semana 1 — Fundamentos de Docker

**Objetivo:** Entender contenedores vs VMs, instalar Docker, dominar el ciclo de vida de contenedores e imágenes, y persistencia de datos.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M01 | Introducción a Contenedores y Docker | 3h | [ ] `docker run hello-world` OK [ ] Conceptos claros [ ] Ej. resueltos |
| **Mar** | M02 | Instalación y Configuración | 3h | [ ] Docker Desktop OK [ ] WSL 2 (Windows) [ ] Sin `sudo` (Linux) |
| **Mié** | M03 | Comandos Fundamentales | 4h | [ ] Contenedor nginx [ ] exec/logs/inspect [ ] 5 comandos esenciales |
| **Jue** | M04 | Imágenes y Dockerfiles | 4h | [ ] Dockerfile propio [ ] Build exitoso [ ] Push a Docker Hub |
| **Vie** | M05 | Volúmenes y Persistencia | 4h | [ ] Volumen creado [ ] Datos persistentes [ ] Backup/restore |

**Checkpoint semana 1:** Contenedor con Dockerfile propio, datos persistentes en volumen, imagen publicada en Docker Hub.

---

## Semana 2 — Redes, Compose y Registros

**Objetivo:** Dominar redes Docker, orquestación multi-contenedor con Compose, configuración avanzada y optimización de imágenes.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M06 | Redes en Docker | 3h | [ ] Bridge personalizado [ ] DNS por nombre [ ] Puertos publicados |
| **Mar** | M07 | Docker Compose | 4h | [ ] YAML con 2+ servicios [ ] `up -d` [ ] `down` sin pérdida datos |
| **Mié** | M08 | Variables de Entorno y Configuración | 4h | [ ] `.env` separado [ ] Secrets [ ] Perfiles por entorno |
| **Jue** | M09 | Registros de Imágenes | 3h | [ ] Push a Docker Hub [ ] Registry local [ ] Harbor (opcional) |
| **Vie** | M10 | Multi-stage Builds y Optimización | 4h | [ ] Dockerfile multi-stage [ ] Imagen reducida [ ] .dockerignore |

**Checkpoint semana 2:** Stack Compose (app + BD + Redis) con variables de entorno, imagen optimizada con multi-stage.

---

## Semana 3 — Orquestación y Producción con Swarm

**Objetivo:** Orquestar contenedores con Docker Swarm, gestionar servicios, seguridad, logs y monitoreo.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M11 | Docker Swarm | 3h | [ ] Swarm init [ ] Nodo worker [ ] `docker node ls` |
| **Mar** | M12 | Servicios, Stacks y Secrets | 4h | [ ] Servicio replicado [ ] Stack deploy [ ] Secrets montados |
| **Mié** | M13 | Seguridad en Docker | 4h | [ ] No-root [ ] Cap-drop [ ] Escaneo Trivy sin críticos |
| **Jue** | M14 | Logs, Monitoreo y Healthchecks | 4h | [ ] Healthcheck en Dockerfile [ ] Logs centralizados [ ] cAdvisor |
| **Vie** | M15 | Docker en Producción | 4h | [ ] Límites CPU/memoria [ ] Restart policy [ ] Prune seguro |

**Checkpoint semana 3:** Stack Swarm con 3 réplicas, healthchecks, secrets, monitoreo con Prometheus/Grafana.

---

## Semana 4 — Kubernetes y Contenedores Avanzados

**Objetivo:** Introducción a Kubernetes, ConfigMaps, Secrets, Helm, networking y registros empresariales.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M16 | Introducción a Kubernetes | 4h | [ ] Minikube/kind [ ] `kubectl get nodes` [ ] Deployment + Service |
| **Mar** | M17 | ConfigMaps, Secrets y Volumes en K8s | 4h | [ ] ConfigMap [ ] Secret [ ] PVC montado |
| **Mié** | M18 | Helm Charts | 4h | [ ] Chart creado [ ] `helm install` [ ] `helm upgrade` |
| **Jue** | M19 | Networking y Service Mesh | 4h | [ ] Ingress configurado [ ] NetworkPolicy [ ] Istio o Linkerd |
| **Vie** | M20 | Docker Registry, Harbor y Artefactos | 3h | [ ] Harbor UI [ ] Escaneo [ ] Firma con Cosign |

**Checkpoint semana 4:** App en Kubernetes con Helm, Ingress, ConfigMaps y Secrets.

---

## Semana 5 — DevOps, Cloud y Proyecto Final

**Objetivo:** Integrar Docker con CI/CD, aplicaciones reales, cloud providers, buenas prácticas y proyecto integrador.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M21 | Docker en CI/CD | 4h | [ ] GitHub Actions build [ ] Push a registro [ ] Escaneo automático |
| **Mar** | M22 | Docker con Aplicaciones | 4h | [ ] App dockerizada [ ] Docker Compose stack [ ] Hot reload |
| **Mié** | M23 | Docker en Cloud | 4h | [ ] ECS o Cloud Run [ ] Despliegue desde CI [ ] Costos |
| **Jue** | M24 | Buenas Prácticas y Patrones | 3h | [ ] Docker Bench Security [ ] Sidecar/Ambassador [ ] Graceful shutdown |
| **Vie** | M25 | Proyecto Final + Entrevista | 6h | [ ] 3 microservicios [ ] 60 preguntas [ ] 10 ejercicios |

**Checkpoint semana 5:** Stack completo desplegado (local o cloud), CI/CD pipeline, Docker Bench pasado, simulación entrevista aprobada.

---

## Rúbrica de Auto-Evaluación

Al final de cada módulo, calificarse de 0 a 5:

| Puntaje | Significado | Acción |
|---------|-------------|--------|
| 5 | Puedo explicarlo y aplicarlo sin ayuda | Avanzar |
| 4 | Lo entiendo pero necesito consultar la guía | Avanzar, repasar luego |
| 3 | Entiendo el concepto pero fallo en implementación | Rehacer ejercicios |
| 2 | No entiendo partes clave | Volver a clase.md + diapositivas |
| 1 | No entiendo casi nada | Pedir ayuda al instructor |
| 0 | No lo vi | Hacer el módulo |

---

## Reglas de Oro del Curso

1. **Nunca copies y pegues.** Escribe cada línea de Dockerfile y comando manualmente.
2. **Lee el error completo.** Docker te dice exactamente qué falló y en qué línea.
3. **Usa `docker logs -f` como debug.** Sigue los logs en tiempo real.
4. **Primero diseña el Dockerfile, después construye.** El 50% del trabajo es un buen Dockerfile.
5. **No te saltes ejercicios.** Cada uno construye sobre el anterior.
6. **Usa `docker system prune` con cuidado.** Solo cuando sepas qué estás limpiando.
7. **Pregunta.** Si algo no te cierra después de 15 minutos, pregunta.

---

## Recursos

| Recurso | Enlace |
|---------|--------|
| Temario completo | `Modulos/Temario-Docker-2026.md` |
| Ejercicios y soluciones | `Modulos/` (25 carpetas) |
| Libro base sugerido | `Libros/` — *Docker Deep Dive* de Nigel Poulton |
| Docker Docs | https://docs.docker.com |
| Play with Docker | https://labs.play-with-docker.com |
| Docker Hub | https://hub.docker.com |
| ArtefactHub (Helm) | https://artifacthub.io |
| Docker Bench Security | https://github.com/docker/docker-bench-security |
| Hadolint (Dockerfile linter) | https://github.com/hadolint/hadolint |
| Dive (image explorer) | https://github.com/wagoodman/dive |
| Trivy (vulnerability scanner) | https://github.com/aquasecurity/trivy |
