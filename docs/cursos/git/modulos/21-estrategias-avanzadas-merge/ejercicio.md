---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 21

## Ejercicio 1: Estrategia Ours
Crea dos ramas `main` y `experimental`. En `experimental` agrega cambios no deseados. Fusiona `experimental` en `main` usando la estrategia `ours` para ignorar los cambios entrantes. Verifica que el contenido de `main` no haya cambiado.

## Ejercicio 2: Estrategia Theirs
En la rama `main` crea un archivo `conflicto.txt`. En otra rama `feature` modifica las mismas líneas. Fusiona `feature` aceptando todos los cambios de la rama entrante con `-X theirs`.

## Ejercicio 3: Octopus Merge
Crea tres ramas (`feat-a`, `feat-b`, `feat-c`) desde `main` con cambios en archivos distintos. Fusiónalas todas en `main` en un solo comando usando la estrategia octopus.

## Ejercicio 4: Squash vs Regular Merge
En un repositorio con 3 commits en una rama `feature`, realiza un squash merge a `main`. Compara el historial con un merge regular y explica la diferencia.

## Ejercicio 5: Conflicto por Renombre
Crea un archivo `datos.txt` en `main`. En una rama `feature`, renómbralo a `info.txt`. En `main`, modifica `datos.txt`. Al fusionar, resuelve el conflicto de rename manualmente.
