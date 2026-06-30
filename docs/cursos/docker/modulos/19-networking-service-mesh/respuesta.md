---
sidebar_label: "Soluciones"
---

# Soluciones M19 — Networking y Service Mesh

## Ejercicio 1: Acceder a un Service desde otro Pod
**Solución esperada**:
```bash
kubectl run -it --rm debug --image=nicolaka/netshoot -- bash
curl http://my-service
# O desde otro Pod en el mismo namespace:
kubectl exec -it <otro-pod> -- curl http://my-service
```
Desde otro Pod en el mismo namespace, el nombre del Service (`my-service`) se resuelve por DNS a su ClusterIP.

**Posibles mejoras**:
- Usar el FQDN completo para acceder a Services en otros namespaces: `curl http://my-service.other-namespace.svc.cluster.local`. El DNS de K8s resuelve `<service>.<namespace>.svc.cluster.local`.
- Depurar resolución DNS: `kubectl exec -it <pod> -- nslookup my-service` o `dig my-service` para ver la IP resuelta y verificar que el DNS funciona.
- Verificar conectividad L4 con `nc -zv my-service 80` (netcat) para testear si el puerto está abierto antes de hacer requests HTTP.

---

## Ejercicio 2: NodePort
**Solución esperada**:
```bash
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl get svc nginx
# NAME    TYPE      CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
# nginx   NodePort  10.96.x.x     <none>        80:<NodePort>/TCP   1m
# Acceder en http://localhost:<NodePort>
```

**Posibles mejoras**:
- Especificar un NodePort fijo en lugar de uno aleatorio: `kubectl expose deployment nginx --port=80 --type=NodePort --node-port=30080` para tener un puerto conocido y configurable en firewalls.
- Para desarrollo local con Minikube, usar `minikube service nginx` que abre el navegador automáticamente con la URL correcta.
- Entender que NodePort expone el servicio en TODOS los nodos. Si el Pod no está en un nodo específico, el tráfico se forwardea al nodo correcto a través del kube-proxy (puede agregar un salto extra de latencia).

---

## Ejercicio 3: Ingress
**Solución esperada**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
    - host: myapp.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: myapp-service
                port:
                  number: 80
```

El Ingress enruta tráfico HTTP/HTTPS al Service según el host y path.

**Posibles mejoras**:
- Agregar TLS termination: crear un Secret `tls-secret` con cert y key, y referenciarlo en `spec.tls: [{hosts: [myapp.local], secretName: tls-secret}]`.
- Usar `cert-manager` para automatizar certificados TLS con Let's Encrypt: crear un recurso `Certificate` y cert-manager gestiona la emisión y renovación automática.
- Configurar rewrite rules con annotations (específico del Ingress Controller): `nginx.ingress.kubernetes.io/rewrite-target: /` para reescribir paths antes de forwardear al backend.

---

## Ejercicio 4: NetworkPolicy
**Solución esperada**:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-frontend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              role: frontend
      ports:
        - protocol: TCP
          port: 8080
```

NetworkPolicy aísla Pods. Solo Pods con la label especificada pueden acceder al backend.

**Posibles mejoras**:
- Agregar una política "deny all" como base y luego políticas "allow" específicas (zero trust): `spec: { podSelector: {}, policyTypes: [Ingress] }` sin reglas deniega todo.
- Definir políticas Egress para limitar tráfico saliente: `policyTypes: [Egress]` con `to:` para controlar a qué servicios externos pueden acceder los Pods (ej. solo a una API externa específica).
- Verificar que el CNI soporta NetworkPolicy (Calico, Cilium, Weave). Flannel sin extensión no las soporta y las políticas se ignoran silenciosamente.

---

## Ejercicio 5: Service Mesh (Istio conceptos)
**Solución esperada**:
Istio inyecta un sidecar proxy Envoy en cada Pod usando un mutating admission webhook. mTLS cifra el tráfico entre servicios automáticamente. El control plane (istiod) configura los Envoys con reglas de tráfico, políticas de seguridad, y recolección de telemetría.

**Posibles mejoras**:
- Habilitar mTLS estricto en todo el mesh: `PeerAuthentication` con `mtls.mode: STRICT` para todo el namespace o mesh, asegurando que ningún tráfico sin cifrar circule entre servicios.
- Implementar canary deployments con VirtualService: dividir tráfico 90% a subset v1 y 10% a v2, aumentando progresivamente si las métricas son buenas.
- Configurar circuit breaking con DestinationRule: `connectionPool: { tcp: { maxConnections: 100 }, http: { http1MaxPendingRequests: 10 } }` para proteger servicios de sobrecarga.
