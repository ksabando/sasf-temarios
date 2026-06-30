---
sidebar_label: "Clase"
---

﻿# Clase 20 -” Docker Registry, Harbor y Gestion de Artefactos

## 1. Docker Registry
Registro de imagenes OCI. Open-source, minimalista.

docker run -d -p 5000:5000 --restart always --name registry registry:2
docker tag myapp localhost:5000/myapp:1.0
docker push localhost:5000/myapp:1.0

## 2. Harbor
Registro cloud-native enterprise.
Caracteristicas: UI web, RBAC, escaneo Trivy, replicacion, firma Cosign, OCI artifacts, proxy cache.

## 3. Autenticacion y Autorizacion
- LDAP / Active Directory
- OIDC (Keycloak, Google, GitHub)
- Token-based (robot accounts)

## 4. Firma de Imagenes (Cosign)
cosign generate-key-pair
cosign sign --key cosign.key localhost:5000/myapp:1.0
cosign verify --key cosign.pub localhost:5000/myapp:1.0

## 5. Replicacion
Copia imagenes entre registros (on-prem â†” cloud).
