---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 24

## Ejercicio 1: Commitlint + Husky
Instala y configura commitlint con husky en un repositorio. Crea un commit que pase la validación y otro que falle (mensaje sin tipo convencional).

## Ejercicio 2: .gitattributes
Crea un archivo `.gitattributes` que configure: archivos `.sh` con LF, `.bat` con CRLF, imágenes PNG como binarios, y archivos `.txt` con texto normalizado.

## Ejercicio 3: Mantenimiento
Ejecuta `git gc --aggressive` y `git fsck --full` en un repositorio. Explica la salida de cada comando.

## Ejercicio 4: git archive
Usa `git archive` para exportar el repositorio como ZIP y como TAR.GZ. Compara los tamaños.

## Ejercicio 5: git filter-repo
Crea un repositorio con un archivo `secreto.txt` en varios commits. Usa `git filter-repo` para eliminarlo completamente del historial.
