---
sidebar_label: "Soluciones"
---

# Soluciones M23 — Docker en Cloud

## Ejercicio 1: ECS Fargate
**Solución esperada**:
ECS Fargate despliega contenedores sin gestionar servidores. Se define una Task Definition (imagen, CPU, memoria, puertos, variables de entorno, secrets) y un Service (número de tareas deseadas, VPC subnets, security groups, load balancer). Fargate provisiona automáticamente la infraestructura subyacente (Firecracker micro-VM).

**Posibles mejoras**:
- Usar Terraform o CloudFormation para definir la infraestructura como código, versionando las task definitions y service configurations.
- Configurar auto scaling basado en métricas: CPU utilization target tracking (> 70% → escala), o request count per target.
- Integrar con AWS Secrets Manager para inyectar credenciales en lugar de variables de entorno, logrando rotación automática de secrets sin redeploy de la aplicación.

---

## Ejercicio 2: Cloud Run
**Solución esperada**:
```bash
gcloud run deploy myapp \
  --image gcr.io/myproject/myapp:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```
Cloud Run escala a cero cuando no hay tráfico y cobra por uso (solo durante el procesamiento de requests). Cold start típico: 1-2 segundos.

**Posibles mejoras**:
- Configurar `--min-instances 1` para eliminar cold starts en producción ($15-30/mes adicional por instancia idle).
- Agregar `--vpc-connector` para acceder a recursos privados (Cloud SQL, Memorystore, VPC interna) sin exponerlos públicamente.
- Configurar `--concurrency=80` para permitir múltiples requests simultáneos por instancia (default 80, máximo 1000).
- Implementar revisiones con traffic splitting para blue/green deployments.

---

## Ejercicio 3: Azure Container Instances (ACI)
**Solución esperada**:
ACI permite multi-container groups compartiendo red y almacenamiento (similar a un Pod en K8s). Se define un YAML con los contenedores, imágenes, puertos, y recursos, y se despliega con `az container create`.

**Posibles mejoras**:
- Para cargas de trabajo periódicas, usar Azure Logic Apps o Azure Functions para triggerear ACI bajo demanda, eliminando el contenedor al terminar (solo pago por segundos de ejecución).
- Configurar `restart-policy: Never` para tareas batch que deben ejecutarse una vez y terminar.
- Montar Azure Files como volumen compartido entre contenedores del mismo container group para intercambio de datos.

---

## Ejercicio 4: Terraform para infraestructura Docker
**Solución esperada**:
```hcl
provider "docker" {
  host = "unix:///var/run/docker.sock"
}

resource "docker_image" "nginx" {
  name = "nginx:alpine"
}

resource "docker_container" "nginx" {
  image = docker_image.nginx.image_id
  name  = "web"
  ports {
    internal = 80
    external = 8080
  }
}
```
Terraform gestiona infraestructura como código para Docker y servicios cloud.

**Posibles mejoras**:
- Combinar providers: usar Terraform para provisionar el cluster (EKS, AKS, GKE) + recursos cloud (VPC, RDS, S3), y usar Helm/Kubectl providers desde Terraform para desplegar aplicaciones en el cluster creado.
- Almacenar el estado de Terraform en un backend remoto (S3 + DynamoDB, Azure Storage, GCS) con state locking para colaboración en equipo.
- Usar `terraform plan` en CI/CD como paso de validación antes de `terraform apply` para revisar cambios.

---

## Ejercicio 5: Tabla comparativa servicios cloud
**Solución esperada**:

| Servicio | Cloud | Serverless | Kubernetes | Caso de uso principal |
|----------|-------|------------|------------|----------------------|
| ECS Fargate | AWS | Sí | No | Apps, APIs, workers sin gestionar servidores |
| AKS | Azure | No (Autopilot: Sí) | Sí | Orquestación completa con integración .NET/Azure |
| GKE Autopilot | GCP | Sí | Sí | K8s gestionado (nodos y control plane) |
| Cloud Run | GCP | Sí | No (basado en Knative) | APIs serverless, escala a cero, HTTP/gRPC |

**Posibles mejoras**:
- Incluir columnas adicionales: costo del control plane (EKS: $72/mes, AKS: gratis, GKE zonal: gratis), soporte para GPU (Fargate: No, GKE: Sí con nodos GPU), y límites de recursos.
- Agregar servicios similares de otros clouds: DigitalOcean App Platform, Vercel (contenedores serverless), Fly.io (edge containers).
- Para cada servicio, documentar el "lock-in level": ECS es específico de AWS, Kubernetes (EKS/AKS/GKE) es portable entre clouds con esfuerzo de migración de storage y networking.
