---
sidebar_label: "Ejercicio"
---

﻿# Ejercicios -” Logs, Monitoreo y Healthchecks

## Ejercicio 1: Logs en tiempo real
Ejecuta nginx y observa logs con docker logs -f. Genera trafico.

## Ejercicio 2: Driver syslog
Ejecuta contenedor con --log-driver syslog. Verifica los logs en /var/log/syslog.

## Ejercicio 3: Healthcheck en Dockerfile
Crea un Dockerfile con HEALTHCHECK que verifique un endpoint HTTP.

## Ejercicio 4: Healthcheck en Compose
Agrega healthcheck a un servicio en docker-compose.yml. Usa condition: service_healthy.

## Ejercicio 5: cAdvisor
Levanta cAdvisor. Explora la UI en http://localhost:8080.
