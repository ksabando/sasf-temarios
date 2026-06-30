---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 10

## Ejercicio 1: Crear y resolver conflicto manualmente
Crea un repositorio, dos ramas que modifiquen la misma línea del mismo archivo, haz merge para generar conflicto y resuélvelo manualmente editando el archivo.

## Ejercicio 2: Usar mergetool
Configura y ejecuta `git mergetool` para resolver un conflicto usando una herramienta visual (VS Code, kdiff3 o vimdiff).

## Ejercicio 3: Resolver conflicto en rebase
Crea una situación de conflicto durante un rebase. Resuélvelo, usa `git rebase --continue` y completa el rebase.

## Ejercicio 4: git checkout --ours / --theirs
En un conflicto, usa `git checkout --ours archivo.txt` para una línea y `--theirs` para otra. Documenta el resultado.

## Ejercicio 5: Configurar y usar git rerere
Activa `rerere.enabled`, crea el mismo conflicto dos veces y verifica que la segunda vez Git lo resuelve automáticamente.
