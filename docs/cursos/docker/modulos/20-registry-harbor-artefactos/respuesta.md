---
sidebar_label: "Soluciones"
---

# Soluciones M20 — Registry, Harbor y Gestión de Artefactos

## Ejercicio 1: Registry local
**Solución esperada**:
```bash
docker run -d -p 5000:5000 --name registry registry:2
docker tag alpine:latest localhost:5000/alpine:test
docker push localhost:5000/alpine:test
docker pull localhost:5000/alpine:test
```
Registry local en `localhost:5000`. Push y pull funcionan con tag incluyendo host:port.

**Posibles mejoras**:
- Configurar almacenamiento persistente: `docker run -d -p 5000:5000 -v registry-data:/var/lib/registry --name registry registry:2` para que las imágenes sobrevivan a la eliminación del contenedor.
- Configurar autenticación básica: crear archivo htpasswd con `docker run --rm httpd:2 htpasswd -Bbn user pass > htpasswd` y pasarlo al registry.
- Para producción: configurar TLS con certificados válidos. Sin TLS, Docker requiere `"insecure-registries": ["localhost:5000"]` en daemon.json.
- Verificar qué imágenes están almacenadas con la API: `curl http://localhost:5000/v2/_catalog` y `curl http://localhost:5000/v2/alpine/tags/list`.

---

## Ejercicio 2: Arquitectura de Harbor
**Solución esperada**:
Harbor se despliega con múltiples servicios orquestados (Docker Compose o Helm en K8s): core (API), registry (distribution), portal (UI), trivy (escáner), redis (cache), database (PostgreSQL), jobservice (tareas asíncronas), log (proxy de logs). Cada servicio tiene su contenedor y se comunican internamente.

**Posibles mejoras**:
- Desplegar Harbor en K8s con el Helm chart oficial en lugar de Docker Compose para alta disponibilidad y gestión de recursos de cada componente.
- Configurar almacenamiento externo para el registry (S3, Azure Blob, GCS) en lugar de filesystem local, permitiendo escalabilidad y backups gestionados.
- Configurar autenticación con LDAP/AD/OIDC desde la UI de Harbor (Administration > Configuration > Auth) para SSO corporativo y mapeo de grupos LDAP a roles de proyecto.

---

## Ejercicio 3: Proyectos en Harbor
**Solución esperada**:
Cada proyecto en Harbor es un namespace lógico que contiene repositorios de imágenes. Los proyectos pueden ser públicos (cualquiera puede pull) o privados (requieren autenticación). Cada proyecto tiene políticas de escaneo, retención y seguridad independientes. Roles por proyecto: Admin, Maintainer, Developer, Guest.

**Posibles mejoras**:
- Configurar escaneo automático: en la configuración del proyecto, habilitar "Automatically scan images on push" para que Trivy escanee cada imagen automáticamente al subirla.
- Configurar políticas de retención: "retener últimas 10 versiones de cada imagen" para evitar crecimiento ilimitado del almacenamiento.
- Crear robot accounts por proyecto para CI/CD con permisos mínimos (solo push al proyecto dev, solo pull del proyecto prod).

---

## Ejercicio 4: Escaneo de vulnerabilidades con Trivy (Harbor)
**Solución esperada**:
Harbor usa Trivy para escanear cada imagen subida. Los resultados muestran vulnerabilidades por severidad: CRITICAL, HIGH, MEDIUM, LOW. La UI de Harbor muestra el detalle: CVE ID, paquete afectado, versión actual, versión con fix, y severidad.

**Posibles mejoras**:
- Configurar políticas de admisión: bloquear pulls de imágenes con vulnerabilidades CRITICAL o HIGH (requiere configuración en Administración > Configuración > Políticas).
- Integrar alertas: configurar webhooks que notifiquen al equipo de seguridad cuando se detecta una vulnerabilidad CRITICAL en una imagen de producción.
- Usar `trivy` CLI en CI/CD además de Harbor: `trivy image --severity CRITICAL --exit-code 1 myimage:tag` para fallar el build antes de que la imagen llegue al registry.

---

## Ejercicio 5: Firmar imágenes con Cosign
**Solución esperada**:
```bash
# Generar par de claves
cosign generate-key-pair
# Firmar imagen
cosign sign --key cosign.key localhost:5000/myapp:1.0
# Verificar firma
cosign verify --key cosign.pub localhost:5000/myapp:1.0
```
La firma se almacena en el registry como un tag adicional `.sig`.

**Posibles mejoras**:
- Usar keyless signing (sin manejar claves): `cosign sign myapp:1.0` (requiere que el registry soporte OIDC). La identidad se verifica automáticamente a través de OIDC y la firma se registra en el Rekor transparency log.
- Integrar la verificación de Cosign en el pipeline de deploy: antes de desplegar a producción, verificar que la imagen está firmada con la clave esperada.
- Firmar SBOMs además de la imagen: `cosign attest --predicate sbom.json --key cosign.key myapp:1.0` para adjuntar un Software Bill of Materials firmado a la imagen.
