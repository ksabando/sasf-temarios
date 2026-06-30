---
sidebar_label: "Ejercicio"
---

﻿# Ejercicios -” Docker en Produccion

## Ejercicio 1: Limites de memoria
Ejecuta un contenedor con --memory=256m --memory-reservation=128m.
Ejecuta docker stats y verifica los limites.

## Ejercicio 2: Limites de CPU
Ejecuta contenedor con --cpus=0.5. Genera carga y verifica en stats.

## Ejercicio 3: Restart policy
Ejecuta contenedor con --restart always. Deten el proceso dentro, verifica que se reinicia.

## Ejercicio 4: Prune seguro
Ejecuta docker system prune -a --volumes. Verifica el espacio liberado.

## Ejercicio 5: Graceful shutdown
Crea un script que atrape SIGTERM. Ejecuta docker stop y verifica el graceful shutdown.
