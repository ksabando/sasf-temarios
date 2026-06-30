---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 08

## Ejercicio 1: Crear repositorio remoto y conectar
Crea un repositorio en GitHub (o local simulado con `--bare`), agrega el remoto con `git remote add origin`, verifica con `git remote -v`.

## Ejercicio 2: Push y pull de cambios
Clona un repositorio, haz cambios locales, súbelos con `git push`, luego simula cambios desde otro lado y tráelos con `git pull`.

## Ejercicio 3: Fetch vs Pull
Usa `git fetch` para descargar cambios sin fusionar, inspecciona las diferencias con `git log origin/main..HEAD`, luego decide si hacer merge o rebase.

## Ejercicio 4: --force-with-lease vs --force
Simula un escenario donde otro compañero hizo push antes que tú. Intenta `git push --force` (peligroso) y luego `git push --force-with-lease` (seguro). Observa la diferencia de seguridad.

## Ejercicio 5: Prune de ramas remotas
Crea varias ramas remotas, elimínalas del remoto, ejecuta `git remote prune origin` y verifica que las referencias locales desaparecieron.
