---
sidebar_label: "Soluciones"
---

# Soluciones M17 — ConfigMaps, Secrets y Volumes en K8s

## Ejercicio 1: ConfigMap como variables de entorno
**Solución esperada**:
```bash
kubectl create configmap app-config --from-literal=APP_ENV=production
# En el Pod/Deployment:
# envFrom:
#   - configMapRef:
#       name: app-config
kubectl exec -it <pod> -- env | grep APP_ENV
# APP_ENV=production
```

**Posibles mejoras**:
- Usar `--from-file` para cargar un archivo de configuración completo: `kubectl create configmap app-config --from-file=config.yaml`, permitiendo manejar configuraciones complejas como archivos.
- Montar el ConfigMap como volumen en lugar de variables de entorno para soportar actualización en caliente (hot reload) cuando el ConfigMap cambia.
- Agregar labels al ConfigMap para organización: `kubectl label configmap app-config app=myapp env=production`.

---

## Ejercicio 2: Secret como variable de entorno
**Solución esperada**:
```bash
kubectl create secret generic db-secret --from-literal=DB_PASSWORD=s3cr3t
# En el Pod/Deployment:
# env:
#   - name: DB_PASSWORD
#     valueFrom:
#       secretKeyRef:
#         name: db-secret
#         key: DB_PASSWORD
kubectl exec -it <pod> -- env | grep DB_PASSWORD
# DB_PASSWORD=s3cr3t
```

**Posibles mejoras**:
- Montar el Secret como archivo en lugar de variable de entorno para mayor seguridad: `volumeMounts: [{name: secret, mountPath: /etc/secrets, readOnly: true}]`. Los archivos no son visibles en process environment.
- Configurar Encryption at Rest en el API Server para que los Secrets se cifren en etcd (`EncryptionConfiguration` con provider `aescbc` o `kms`).
- Restringir acceso a Secrets con RBAC: crear un Role que permita `get secrets` solo a ServiceAccounts específicas, no a usuarios genéricos.

---

## Ejercicio 3: PersistentVolume y PersistentVolumeClaim
**Solución esperada**:
```yaml
# PV (administrador)
apiVersion: v1
kind: PersistentVolume
metadata:
  name: task-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
---
# PVC (desarrollador)
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: task-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
```

El archivo persiste aunque el Pod se reinicie — el PV mantiene los datos.

**Posibles mejoras**:
- Usar StorageClass con provisionamiento dinámico en lugar de PV estático: crear un PVC que referencie una StorageClass (`storageClassName: standard`) y el provisioner crea el PV automáticamente.
- En cloud providers, usar el CSI driver nativo en lugar de `hostPath`: `ebs.csi.aws.com` para AWS EBS, `disk.csi.azure.com` para Azure Disk, `pd.csi.storage.gke.io` para GCP Persistent Disk.
- Configurar `reclaimPolicy: Retain` en el PV para que los datos no se eliminen automáticamente cuando el PVC se borra, permitiendo recuperación o backup posterior.

---

## Ejercicio 4: Montar ConfigMap como archivos
**Solución esperada**:
```yaml
volumes:
  - name: config
    configMap:
      name: app-config
volumeMounts:
  - name: config
    mountPath: /etc/config
```

Los archivos del ConfigMap se montan en `/etc/config` — cada key se convierte en un archivo independiente.

**Posibles mejoras**:
- Usar `subPath` para montar solo un archivo específico sin sobrescribir otros archivos en el directorio: `mountPath: /etc/app/config.yaml` con `subPath: config.yaml`.
- Configurar permisos explícitos: `defaultMode: 0400` en el volumen para que los archivos sean solo legibles por el owner.
- Tener en cuenta que con `subPath`, los archivos NO se actualizan automáticamente cuando el ConfigMap cambia (a diferencia de montar el volumen completo sin subPath). Para hot reload, evitar subPath o usar un sidecar que detecte cambios y envíe SIGHUP.

---

## Ejercicio 5: ImagePullSecret para registry privado
**Solución esperada**:
```bash
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass
# En el Pod:
# imagePullSecrets:
#   - name: regcred
```
`imagePullSecrets` en la spec del Pod permite pull de registros privados.

**Posibles mejoras**:
- Asignar el ImagePullSecret a la ServiceAccount del namespace: `kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "regcred"}]}'`. Todos los Pods que usen esa SA heredan automáticamente el secret.
- Usar un Secret de tipo `kubernetes.io/dockerconfigjson` creado desde `~/.docker/config.json` para incluir credenciales de múltiples registries en un solo Secret.
- Para ECR en AWS, usar `ecr-credential-helper` o `kubelet-image-credential-provider` en lugar de ImagePullSecrets, evitando la renovación manual de tokens temporales de ECR.
