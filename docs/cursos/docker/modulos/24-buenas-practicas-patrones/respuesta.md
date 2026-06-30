---
sidebar_label: "Soluciones"
---

# Soluciones M24 — Buenas Prácticas y Patrones Docker

## Ejercicio 1: Patrón Sidecar
**Solución esperada**:
Sidecar comparte volúmenes y red con el contenedor principal:
```bash
# Contenedor principal
docker run -d --name app -v logs:/var/log/app myapp
# Sidecar (log shipper)
docker run -d --name log-shipper --volumes-from app --network container:app fluentd
```
El sidecar lee logs del volumen compartido y los envía al sistema centralizado, sin modificar la app.

**Posibles mejoras**:
- En Compose, definir el sidecar en el mismo file con `network_mode: "service:app"` y `volumes_from: [app]` para una configuración declarativa.
- En Kubernetes, el sidecar es simplemente otro contenedor en la spec del Pod. Los admission webhooks (como Istio) pueden inyectar sidecars automáticamente sin modificar los Deployments.
- Considerar el orden de inicio y apagado: en K8s 1.28+, los sidecars pueden configurarse con `restartPolicy: Always` y lifecycle hooks para iniciar antes del contenedor principal.

---

## Ejercicio 2: Graceful shutdown en la aplicación
**Solución esperada** (Node.js):
```javascript
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Starting graceful shutdown...');
  server.close(() => {
    console.log('HTTP server closed. Cleaning up...');
    process.exit(0);
  });
  // Fallback: forzar cierre después de 30s
  setTimeout(() => process.exit(1), 30000).unref();
});
```

**Posibles mejoras**:
- Implementar graceful shutdown en el health check también: que `/healthz` retorne 503 (no healthy) apenas se recibe SIGTERM, para que el load balancer deje de enviar tráfico a esta instancia.
- Usar `server.close()` (Node.js), `http.Server.Shutdown()` (Go), o gunicorn's `--graceful-timeout` (Python) en lugar de implementar desde cero.
- Probar el graceful shutdown regularmente con `docker stop --time=30 <container>` y verificar que no hay requests fallados durante la parada.

---

## Ejercicio 3: Usar --init o tini
**Solución esperada**:
```bash
docker run --init myapp
# O en Dockerfile:
# ENTRYPOINT ["/usr/bin/tini", "-—, "node", "app.js"]
```
`--init` inyecta tini como PID 1, que maneja correctamente señales y recolecta procesos zombie.

**Posibles mejoras**:
- En Kubernetes, usar `shareProcessNamespace: true` en la Pod spec junto con un init container que se encargue del manejo de señales si los contenedores principales no lo hacen bien.
- Verificar que el binario tini está disponible en la imagen (incluido en `docker --init`) o instalarlo en el Dockerfile: `RUN apk add --no-cache tini` (Alpine) o `apt-get install -y tini` (Debian).
- Probar el manejo de señales: `docker run --init -d --name test myapp`, luego `docker stop test` y verificar que el contenedor se detiene en < 2 segundos (no espera los 10s de timeout).

---

## Ejercicio 4: Auditoría con Docker Bench Security
**Solución esperada**:
```bash
docker run --rm --net host --pid host --userns host \
  --cap-add audit_control \
  -v /etc:/etc:ro -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  docker/docker-bench-security
```
Resultados: secciones con [PASS], [WARN], [INFO] para cada control CIS. Priorizar la corrección de WARN.

**Posibles mejoras**:
- Automatizar la ejecución semanal con cron y comparar resultados entre ejecuciones para verificar que las configuraciones de seguridad no se degradan con el tiempo.
- Enfocarse primero en WARNs de alto impacto: contenedores con `--privileged`, imágenes con `latest` en producción, puertos expuestos innecesariamente, y storage driver correcto (overlay2).
- Integrar los resultados en un dashboard de compliance para auditorías (PCI, SOC2, HIPAA) con evidencia de ejecución periódica y remediación de hallazgos.

---

## Ejercicio 5: Uso de labels
**Solución esperada**:
```bash
docker run -d \
  --label "org.label-schema.version=1.0" \
  --label "team=backend" \
  --label "env=production" \
  nginx:alpine
```
Los labels permiten filtrado y organización: `docker ps --filter "label=env=production"`.

**Posibles mejoras**:
- Usar los labels del estándar OCI en Dockerfiles: `LABEL org.opencontainers.image.source="https://github.com/myorg/myrepo"` y `org.opencontainers.image.revision=$GIT_SHA`.
- Definir labels en el compose file bajo cada servicio para consistencia: `labels: { "team": "backend", "tier": "api" }`.
- En Swarm, etiquetar nodos con `docker node update --label-add region=us-east <node>` y usar `--constraint node.labels.region==us-east` en servicios para placement geográfico.
