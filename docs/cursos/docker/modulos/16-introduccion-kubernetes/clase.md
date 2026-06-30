---
sidebar_label: "Clase"
---

﻿# Clase 16 -” Introduccion a Kubernetes

## 1. Que es Kubernetes?
Orquestador de contenedores declarativo. Automatiza despliegue, escalado y operacion.

## 2. Arquitectura
- Control Plane: API Server, etcd, Scheduler, Controller Manager
- Nodes: kubelet, kube-proxy, container runtime
- Pods: unidad minima de despliegue
- Deployments: estado deseado de Pods
- Services: abstraccion de red

## 3. Primeros Comandos
kubectl get nodes
kubectl get pods
kubectl get deployments
kubectl get services
kubectl describe pod mi-pod
kubectl logs mi-pod
kubectl exec -it mi-pod -- sh

## 4. YAML Basico
`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
`

## 5. Clusters Locales
- Minikube: cluster de un solo nodo
- kind (Kubernetes in Docker): K8s en contenedores Docker
- k3s: K8s ligero para edge/desarrollo
- Docker Desktop Kubernetes: incluido en Docker Desktop
