---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 14

## Ejercicio 1: cherry-pick un commit
En una rama `hotfix`, haz un commit que corrija un bug. Cambia a `main` y usa `git cherry-pick` para aplicar solo ese fix sin fusionar toda la rama.

## Ejercicio 2: cherry-pick rango de commits
En una rama `feature`, haz 4 commits numerados. En `main`, usa `git cherry-pick` para aplicar los commits 2, 3 y 4 (rango A..B).

## Ejercicio 3: bisect para encontrar bug
Crea 5 commits donde el último introduce un bug (ej: archivo con error). Usa `git bisect` manualmente para identificar el commit culpable.

## Ejercicio 4: git log -S
Busca en el historial de tu repositorio los commits que agregaron o eliminaron una palabra clave específica usando `git log -S`.

## Ejercicio 5: git blame avanzado
Usa `git blame -w` para ignorar cambios de whitespace en un archivo y `git blame` con rango de líneas para analizar solo una sección específica.
