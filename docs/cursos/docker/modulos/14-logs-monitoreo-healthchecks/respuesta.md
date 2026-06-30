---
sidebar_label: "Soluciones"
---

# Soluciones M14 — Logs, Monitoreo y Healthchecks

## Ejercicio 1: Logs en tiempo real
**Solución esperada**:
```bash
docker logs -f web
# Muestra cada request HTTP al servidor nginx en tiempo real
```
Cada línea de logs aparece con timestamp y detalle de la request (IP del cliente, método, path, status code, tamaño).

**Posibles mejoras**:
- Combinar con `--tail` para no volcar logs históricos: `docker logs --tail 50 -f web` para ver las últimas 50 líneas y luego seguir en tiempo real.
- Agregar `--timestamps` (`-t`) para ver exactamente cuándo ocurrió cada línea de log, crítico para correlacionar eventos entre múltiples contenedores.
- Configurar rotación de logs por contenedor: `docker run -d --log-opt max-size=10m --log-opt max-file=3 nginx:alpine` para evitar que un contenedor ocupe todo el disco con logs.

---

## Ejercicio 2: Enviar logs a syslog
**Solución esperada**:
```bash
docker run -d --log-driver syslog --log-opt syslog-address=udp://localhost:514 nginx:alpine
# Los logs aparecen en syslog del host
# Verificar con: grep docker /var/log/syslog (o /var/log/messages)
```

**Posibles mejoras**:
- Usar `--log-opt tag="nginx-{{.Name}}"` para agregar tags personalizados que identifiquen el contenedor en los logs de syslog, facilitando el filtrado.
- Para producción, usar un driver que envíe a un agregador centralizado: `--log-driver fluentd --log-opt fluentd-address=tcp://fluentd-server:24224` con Fluentd + Elasticsearch + Kibana (EFK) o Grafana Loki.
- Configurar múltiples drivers con plugins de logging (Docker Enterprise) o usar un sidecar container de shipping (Fluentd/Fluent Bit) que lea los logs json-file y los envíe al backend, manteniendo `json-file` como buffer local.

---

## Ejercicio 3: HEALTHCHECK en Dockerfile
**Solución esperada**:
```dockerfile
FROM nginx:alpine
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1
```

El HEALTHCHECK se ejecuta periódicamente cada 30 segundos. `docker inspect <container>` muestra el estado de salud y los últimos resultados.

**Posibles mejoras**:
- Usar `curl -f` en lugar de `wget` si la imagen ya incluye curl (más liviano): `CMD curl -f http://localhost:80/ || exit 1`.
- Configurar un endpoint dedicado de health (`/healthz`, `/ready`) en la aplicación que verifique dependencias (BD, cache) además de solo responder HTTP 200. Un endpoint `/healthz` que solo retorna 200 prueba liveness, un `/ready` que verifica dependencias prueba readiness.
- Ajustar `start-period` según el tiempo real de arranque de la aplicación: si tu app tarda 20s en inicializar, usar `--start-period=30s` para evitar falsos negativos durante el arranque.

---

## Ejercicio 4: depends_on con healthcheck en Compose
**Solución esperada**:
```yaml
services:
  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
  app:
    depends_on:
      db:
        condition: service_healthy
```
`condition: service_healthy` hace que el servicio `app` espere hasta que `db` esté realmente listo para aceptar conexiones.

**Posibles mejoras**:
- Implementar retry logic en la aplicación además de `condition: service_healthy` como defensa en profundidad: si la BD se reinicia después del deploy, la app puede reconectarse sin intervención.
- Usar `restart: on-failure` en la aplicación para que si falla durante el arranque (incluso con depends_on), se reintente automáticamente.
- Monitorear el tiempo que tarda en alcanzar `healthy`: si consistentemente excede el `start-period`, considerar aumentar el `start-period` o investigar la causa del arranque lento.

---

## Ejercicio 5: Monitoreo con cAdvisor
**Solución esperada**:
```bash
docker run -d --name cadvisor -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /sys:/sys:ro -v /var/lib/docker:/var/lib/docker:ro \
  gcr.io/cadvisor/cadvisor
# Acceder a http://localhost:8080 para ver UI web con métricas
# Métricas disponibles en http://localhost:8080/metrics (formato Prometheus)
```

cAdvisor muestra métricas de CPU, memoria, red, y disco de cada contenedor.

**Posibles mejoras**:
- Integrar cAdvisor con Prometheus: configurar `scrape_configs` en Prometheus apuntando a `localhost:8080` y usar Grafana Dashboard ID 193 (Docker monitoring) para visualización.
- Agregar node_exporter para métricas del host que cAdvisor no cubre (presión de CPU del sistema, uso de disco a nivel host, estadísticas de red del host).
- Configurar alertas en Alertmanager: memoria de contenedor > 90% del límite, OOM kills detectados, contenedores en restart loop.
