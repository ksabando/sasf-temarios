---
sidebar_label: "Ejercicio"
---

﻿# Ejercicios -” Variables de Entorno y Configuracion

## Ejercicio 1: Variables con -e
Ejecuta un contenedor alpine con -e MENSAJE=Hola y muestra la variable.

## Ejercicio 2: --env-file
Crea un archivo .env con USER=admin y PASS=123. Usalo con --env-file.

## Ejercicio 3: Compose con variables
Crea un docker-compose.yml que use  de un .env file.

## Ejercicio 4: ARG vs ENV
Crea un Dockerfile con ARG VERSION y ENV APP_VERSION. Build con --build-arg VERSION=2.0.

## Ejercicio 5: Secrets en Compose
Crea un secret con file: en Compose. Verifica que esta montado en /run/secrets/.
