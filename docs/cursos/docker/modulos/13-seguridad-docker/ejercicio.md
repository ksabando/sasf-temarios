---
sidebar_label: "Ejercicio"
---

﻿# Ejercicios -” Seguridad en Docker

## Ejercicio 1: No-root
Crea un Dockerfile que ejecute la app como usuario no-root.

## Ejercicio 2: Cap-drop
Ejecuta nginx con --cap-drop ALL --cap-add NET_BIND_SERVICE.

## Ejercicio 3: Escaneo con Trivy
Instala Trivy. Escanea nginx:alpine y revisa vulnerabilidades.

## Ejercicio 4: No-new-privileges
Ejecuta un contenedor con --security-opt no-new-privileges:true.

## Ejercicio 5: Content Trust
Activa DOCKER_CONTENT_TRUST y descarga una imagen firmada.
