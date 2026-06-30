---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 12

## Ejercicio 1: Stash básico
En una rama, modifica 2 archivos y haz un stash. Cambia a `main`, haz un commit y vuelve. Recupera los cambios con `pop`. Verifica que el stash se haya eliminado de la lista.

## Ejercicio 2: Múltiples stashes con nombres
Crea 3 stashes en diferentes ramas con mensajes descriptivos usando `-m`. Lista todos los stashes y aplica uno específico usando `apply`.

## Ejercicio 3: Stash parcial con -p
En un archivo, haz 3 cambios distintos en diferentes líneas. Usa `git stash -p` para guardar solo 2 de los 3 cambios. Verifica que solo se aplicaron los cambios seleccionados al recuperar.

## Ejercicio 4: Crear rama desde stash
Haz cambios en la rama `main` y guárdalos con stash. Crea una nueva rama desde ese stash usando `git stash branch`. Verifica que los cambios estén en la nueva rama.

## Ejercicio 5: Stash de untracked files
Crea un archivo nuevo sin trackear y modifica uno existente. Usa `git stash -u` para guardar ambos. Verifica que el working directory quede limpio. Recupera con `pop`.
