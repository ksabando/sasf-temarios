---
sidebar_label: "Clase"
---

﻿# Clase 17 -” ConfigMaps, Secrets y Volumes en K8s

## 1. ConfigMap
Configuracion desacoplada de la imagen.

kubectl create configmap app-config --from-literal=DB_HOST=localhost --from-literal=DB_PORT=5432
kubectl create configmap app-files --from-file=config/

## 2. Secret
Datos sensibles (base64, cifrado en reposo con KMS).

kubectl create secret generic db-secret --from-literal=username=admin --from-literal=password=supersecret
kubectl create secret tls tls-secret --cert=tls.crt --key=tls.key
kubectl create secret docker-registry regcred --docker-server=ghcr.io --docker-username=user --docker-password=token

## 3. Consumir en Pod
`
spec:
  containers:
  - name: app
    envFrom:
    - configMapRef:
        name: app-config
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
`

## 4. Volumenes
- emptyDir: directorio temporal, vive con el Pod
- hostPath: directorio del nodo (no recomendado en produccion)
- PersistentVolume (PV): recurso de almacenamiento
- PersistentVolumeClaim (PVC): solicitud de almacenamiento
- StorageClass: aprovisionamiento dinamico
