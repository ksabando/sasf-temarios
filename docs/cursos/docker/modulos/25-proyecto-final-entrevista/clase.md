---
sidebar_label: "Clase"
---

﻿# Clase 25 -” Proyecto Final + Simulacion de Entrevista

## Proyecto Capstone: Microservicios con Docker

### Arquitectura
Frontend (React) -> API Gateway (Nginx) -> Orders (Spring), Products (Node), Payment (Python) -> MongoDB, Postgres, Kafka

### Entregables
1. Dockerfile multi-stage para cada microservicio
2. docker-compose.yml con todos los servicios
3. Healthchecks, redes, volumenes
4. Variables de entorno con .env
5. Perfiles: dev, staging, prod
6. CI/CD pipeline (GitHub Actions)
7. Monitoreo (cAdvisor + Prometheus)
8. Documentacion (README con instrucciones)

## Simulacion de Entrevista (60 preguntas)

### Categorias
| Categoria | Preguntas |
|-----------|-----------|
| Fundamentos Docker | 10 |
| Dockerfiles y Build | 10 |
| Redes y Volumenes | 10 |
| Docker Compose / Swarm | 10 |
| Kubernetes | 10 |
| Seguridad y DevOps | 10 |

### Ejercicios Practicos (10)
1. Dockerizar app Spring Boot + PostgreSQL + Redis
2. Optimizar Dockerfile con multi-stage (-50% tamano)
3. Docker Compose con healthchecks y dependencias
4. Stack Swarm con 3 replicas y secrets
5. Deployment de K8s con ConfigMaps y Secrets
6. CI/CD pipeline build + push + scan
7. Ingress + NetworkPolicy en K8s
8. Helm Chart para la aplicacion
9. Docker Bench Security (target >90%)
10. Backup/restore de volumenes
