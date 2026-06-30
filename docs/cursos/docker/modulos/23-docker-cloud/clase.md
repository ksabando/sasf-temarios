---
sidebar_label: "Clase"
---

﻿# Clase 23 -” Docker en Cloud

## 1. AWS ECS (Elastic Container Service)
- Fargate: Serverless, sin gestionar servidores
- EC2: Tu gestionas los nodos

## 2. AWS EKS (Elastic Kubernetes Service)
Kubernetes gestionado por AWS.
aws eks create-cluster --name mycluster

## 3. Azure Container Instances (ACI)
Serverless containers en Azure.
az container create --resource-group myrg --name mycontainer --image nginx:alpine --ports 80

## 4. Google Cloud Run
Serverless containers, escala a cero.
gcloud run deploy my-service --image gcr.io/project/myapp:1.0 --region us-central1 --allow-unauthenticated

## 5. Terraform para Docker
```
resource "docker_image" "nginx" {
  name = "nginx:alpine"
}
resource "docker_container" "nginx" {
  image = docker_image.nginx.image_id
  name  = "nginx"
  ports {
    internal = 80
    external = 8080
  }
}
```
