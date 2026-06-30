---
sidebar_label: "Clase"
---

﻿# Clase 18 -” Helm Charts

## 1. Que es Helm?
Gestor de paquetes para Kubernetes. Charts = paquetes K8s preconfigurados.

## 2. Helm 3
- Sin Tiller (mejora seguridad)
- Modelo de permisos basado en kubeconfig
- Soporte para OCI registries

## 3. Estructura de un Chart
mychart/
  Chart.yaml          # metadatos
  values.yaml         # valores por defecto
  charts/             # dependencias
  templates/          # templates Go
    deployment.yaml
    service.yaml
    _helpers.tpl    # helpers
    NOTES.txt       # instrucciones post-instalacion
  .helmignore

## 4. Comandos Basicos
helm create mychart                    # crear chart
helm install myrelease ./mychart       # instalar
helm upgrade myrelease ./mychart       # actualizar
helm rollback myrelease 1              # revertir
helm list                              # listar releases
helm uninstall myrelease               # eliminar
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install nginx bitnami/nginx

## 5. Values
values.yaml:
replicaCount: 3
image:
  repository: nginx
  tag: alpine
service:
  port: 80

En template: {{ .Values.replicaCount }}
