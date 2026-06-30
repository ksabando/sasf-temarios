---
sidebar_label: "Ejercicio"
---

﻿# Ejercicios -” Comandos Fundamentales

## Ejercicio 1: Nginx
Ejecuta nginx en background, nombre "web1", puerto 8080:80. Verifica en navegador.

## Ejercicio 2: Logs
Ejecuta docker logs -f web1. Accede al navegador varias veces. Observa los logs.

## Ejercicio 3: Exec
Ejecuta docker exec -it web1 bash. Crea un archivo en /usr/share/nginx/html/test.html.

## Ejercicio 4: Inspect
Usa docker inspect web1 para encontrar: IPAddress, Mounts, NetworkSettings.

## Ejercicio 5: Stats
Ejecuta docker stats web1 y observa CPU, memoria, I/O.

## Ejercicio 6: Cleanup
Deten y elimina el contenedor: docker stop web1 && docker rm web1.
