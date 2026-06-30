---
sidebar_label: "Clase"
---

﻿# Clase 14 -” Logs, Monitoreo y Healthchecks

## 1. Logs de Docker
docker logs web                # logs completos
docker logs -f web             # seguir en tiempo real
docker logs --tail 100 web     # ultimas 100 lineas
docker logs --since 5m web     # ultimos 5 minutos

## 2. Drivers de Logging
json-file: Default, escribe a JSON
syslog: Envia a syslog del host
fluentd: Envia a Fluentd
awslogs: Envia a CloudWatch
gelf: Formato Graylog Extended Log
journald: Envia a systemd journal
none: Sin logging

## 3. Healthchecks
En Dockerfile:
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget --quiet --tries=1 http://localhost:3000/health || exit 1

En Compose:
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 5s
  retries: 3

## 4. Monitoreo con cAdvisor
docker run -d --name cadvisor -p 8080:8080 -v /:/rootfs:ro -v /var/run:/var/run:ro -v /sys:/sys:ro -v /var/lib/docker:/var/lib/docker:ro gcr.io/cadvisor/cadvisor
