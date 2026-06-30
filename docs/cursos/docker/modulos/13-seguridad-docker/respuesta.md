---
sidebar_label: "Soluciones"
---

# Soluciones M13 — Seguridad en Docker

## Ejercicio 1: Contenedor como no-root
**Solución esperada**:
```dockerfile
FROM alpine
RUN adduser -D appuser
USER appuser
CMD ["whoami"]
```
Al construir y ejecutar, el comando `whoami` muestra `appuser` en lugar de `root`.

**Posibles mejoras**:
- Crear también un grupo dedicado: `RUN addgroup -S appgroup && adduser -S appuser -G appgroup` y usar `USER appuser:appgroup` para control explícito de GID.
- Asegurar que todos los archivos copiados pertenecen al usuario correcto: `COPY --chown=appuser:appgroup app /app`. Si COPY se ejecuta antes de USER, los archivos son owned por root y la app podría no poder escribirlos.
- En el comando `docker run`, usar `--user 1000:1000` para forzar ejecución como no-root sin modificar el Dockerfile, ideal para imágenes de terceros que no definen USER.

---

## Ejercicio 2: Restricción de capabilities
**Solución esperada**:
```bash
docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE -p 80:80 nginx:alpine
```
Elimina todas las capabilities y solo agrega la necesaria para bindear puertos < 1024.

**Posibles mejoras**:
- Agregar `--security-opt no-new-privileges:true` para evitar que el proceso o sus hijos obtengan privilegios adicionales mediante binarios setuid.
- Usar un perfil seccomp personalizado: `--security-opt seccomp=/path/to/custom-profile.json` con una whitelist más restrictiva que el perfil por defecto.
- Verificar las capabilities efectivas del proceso: `docker exec <container> cat /proc/1/status | grep Cap` y decodificar con `capsh --decode=<hex>` para confirmar que solo las necesarias están habilitadas.

---

## Ejercicio 3: Escaneo con Trivy
**Solución esperada**:
```bash
trivy image nginx:alpine
# Reporta vulnerabilidades por severidad: CRITICAL, HIGH, MEDIUM, LOW
# Muestra el CVE-ID, paquete afectado, y versión que contiene el fix
```

**Posibles mejoras**:
- Integrar Trivy como quality gate en CI/CD: `trivy image --severity CRITICAL,HIGH --exit-code 1 mi-app:latest` para fallar el pipeline si hay vulnerabilidades altas o críticas.
- Filtrar vulnerabilidades sin fix disponible: `trivy image --ignore-unfixed nginx:alpine` para enfocarse solo en problemas accionables.
- Generar reporte en formato JSON para procesamiento automatizado: `trivy image --format json -o report.json nginx:alpine` y almacenar el resultado como artefacto de build.

---

## Ejercicio 4: Docker Content Trust
**Solución esperada**:
```bash
export DOCKER_CONTENT_TRUST=1
docker pull nginx:alpine
# Si la imagen está firmada, se descarga normalmente.
# Si no está firmada o la firma es inválida, Docker rechaza la operación.
```

Solo imágenes firmadas con Notary pueden descargarse cuando DCT está habilitado.

**Posibles mejoras**:
- Usar Cosign (Sigstore) como alternativa moderna a Notary: `cosign sign --key cosign.key myimage:tag` y `cosign verify --key cosign.pub myimage:tag` para verificar firmas.
- Implementar firma automática en CI/CD: después del build y push, firmar la imagen con `cosign sign` usando una key almacenada en el vault de secretos del CI.
- Configurar políticas de admisión en Kubernetes (OPA/Gatekeeper) o en Harbor para rechazar imágenes no firmadas en despliegues a producción.

---

## Ejercicio 5: Auditoría con Docker Bench Security
**Solución esperada**:
```bash
docker run --rm --net host --pid host --userns host \
  --cap-add audit_control \
  -v /etc:/etc:ro -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  docker/docker-bench-security
```
Produce un reporte con secciones: Host Configuration, Docker Daemon Configuration, Container Images, Container Runtime, Docker Swarm. Resultados: [PASS], [WARN], [INFO].

**Posibles mejoras**:
- Automatizar la ejecución semanal con cron/systemd timer y generar un reporte que se envíe al equipo de seguridad o se almacene como evidencia de compliance.
- Priorizar los WARN y crear un plan de remediación: corregir bind mounts inseguros, eliminar capacidades innecesarias, y asegurar configuraciones del daemon.
- Comparar los resultados entre ejecuciones para verificar que las mejoras de seguridad aplicadas son efectivas y no hay regresiones.
