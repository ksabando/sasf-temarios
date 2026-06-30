---
sidebar_label: "Soluciones"
---

# Soluciones M16 — Introducción a Kubernetes

## Ejercicio 1: Ver información del cluster
**Solución esperada**:
```bash
kubectl cluster-info
# Kubernetes control plane is running at https://kubernetes.docker.internal:6443
# CoreDNS is running at ...
```
Muestra la URL del API Server y los servicios del plano de control (CoreDNS).

**Posibles mejoras**:
- Verificar la versión del cliente y servidor: `kubectl version --short` para asegurar compatibilidad entre cliente kubectl y API server.
- Listar todos los nodos: `kubectl get nodes -o wide` para ver estado, roles, versión de K8s, IP interna y externa, y SO de cada nodo.
- Verificar los componentes del plano de control: `kubectl get pods -n kube-system` para listar los pods del sistema (etcd, kube-apiserver, kube-controller-manager, kube-scheduler, coredns).

---

## Ejercicio 2: Crear un Deployment
**Solución esperada**:
```bash
kubectl create deployment nginx --image=nginx:alpine --replicas=3
kubectl get deployments
kubectl get pods          # 3 pods en ejecución
```

**Posibles mejoras**:
- Crear el Deployment con YAML declarativo en lugar de imperativo: `kubectl create deployment nginx --image=nginx:alpine --replicas=3 --dry-run=client -o yaml > deployment.yaml`, editar y aplicar con `kubectl apply -f deployment.yaml`.
- Agregar resource requests y limits en el YAML: `resources: { requests: { cpu: "100m", memory: "128Mi" }, limits: { cpu: "500m", memory: "256Mi" } }` para que el scheduler pueda tomar decisiones informadas.
- Configurar un healthcheck (liveness y readiness probe) en el Deployment para que K8s monitoree y reinicie los Pods si es necesario.

---

## Ejercicio 3: Exponer un Deployment con Service
**Solución esperada**:
```bash
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl get services
# nginx   NodePort   10.96.x.x   <none>   80:<NodePort>/TCP
# Acceder en http://localhost:<NodePort>
```

**Posibles mejoras**:
- Usar `--type=LoadBalancer` en cloud providers (EKS, GKE, AKS) para provisionar un load balancer externo automáticamente.
- Para desarrollo local (Minikube/kind), usar `minikube service nginx` o `kubectl port-forward service/nginx 8080:80` para exponer el Service sin NodePort.
- Crear un Ingress para enrutamiento HTTP más sofisticado en lugar de NodePort: permite TLS, virtual hosts, y path-based routing.

---

## Ejercicio 4: Escalar un Deployment
**Solución esperada**:
```bash
kubectl scale deployment nginx --replicas=5
kubectl get pods
# 5 pods en ejecución (3 originales + 2 nuevos)
```

**Posibles mejoras**:
- Usar `kubectl edit deployment nginx` para cambiar el `replicas` directamente en el YAML y aplicar el cambio, manteniendo un registro de la configuración en el historial del Deployment.
- Implementar Horizontal Pod Autoscaler: `kubectl autoscale deployment nginx --min=2 --max=10 --cpu-percent=80` para escalado automático basado en uso de CPU.
- Verificar el rollout status después de escalar: `kubectl rollout status deployment/nginx` para confirmar que todos los Pods están listos.

---

## Ejercicio 5: Actualizar imagen (Rolling Update)
**Solución esperada**:
```bash
kubectl set image deployment/nginx nginx=nginx:1.25-alpine
kubectl rollout status deployment/nginx
# Waiting for deployment "nginx" rollout to finish: 3 out of 5 new replicas have been updated...
# deployment "nginx" successfully rolled out
```

**Posibles mejoras**:
- Monitorear el progreso del rollout con `kubectl rollout status deployment/nginx --watch` en tiempo real.
- Si algo falla, hacer rollback: `kubectl rollout undo deployment/nginx` para volver a la versión anterior.
- Ver historial de revisions: `kubectl rollout history deployment/nginx` y hacer rollback a una revisión específica con `kubectl rollout undo deployment/nginx --to-revision=2`.
- Configurar la estrategia de update en el Deployment YAML: `strategy: { type: RollingUpdate, rollingUpdate: { maxUnavailable: 1, maxSurge: 1 } }`.
