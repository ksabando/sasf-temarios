---
sidebar_label: "Clase"
---

﻿# Clase 19 -” Networking y Service Mesh

## 1. Modelo de Red K8s
- Todos los Pods pueden comunicarse sin NAT
- Todos los Nodes pueden comunicarse con todos los Pods
- La IP que ve un Pod es la misma que ven los demas

## 2. CNI Plugins
Calico: NetworkPolicies, BGP, rendimiento
Flannel: Simple, overlay VXLAN
Cilium: eBPF, Security Policies, Hubble
Weave: Mesh, cifrado, simple

## 3. Service Types
ClusterIP (default): IP interna en el cluster
NodePort: Puerto en cada nodo
LoadBalancer: Balanceador externo (cloud)
ExternalName: DNS alias

## 4. Ingress
`
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
  - host: miapp.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80
`

## 5. NetworkPolicy
`
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
`

## 6. Service Mesh (Istio)
- Sidecar proxy (Envoy) por Pod
- mTLS entre servicios
- Observabilidad (Kiali, Jaeger, Grafana)
- Traffic management (canary, circuit breaker)
