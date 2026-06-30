---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 04

## Ejercicio 1: Ciclo de vida completo
Crea un archivo nuevo, verifica que esté untracked, agrégalo al staging (staged), haz commit (unmodified), modifícalo (modified), stagéalo de nuevo, y haz otro commit. Usa `git status` en cada paso.

## Ejercicio 2: Staging interactivo con git add -p
Crea un archivo con al menos 3 bloques de código o párrafos separados por líneas en blanco. Usa `git add -p` para agregar solo algunos fragmentos al staging y confirma con `git diff --staged` que solo esos fragmentos están preparados.

## Ejercicio 3: Crear .gitignore
Crea un archivo `.gitignore` que ignore: archivos `.log`, directorio `node_modules`, archivos `.env`, y archivos `.exe`. Crea algunos de estos archivos y verifica que `git status` no los muestre.

## Ejercicio 4: Usar git commit --amend
Realiza un commit olvidando incluir un archivo. Usa `git add archivo_olvidado` y luego `git commit --amend --no-edit` para agregarlo al commit anterior sin cambiar el mensaje.

## Ejercicio 5: Escribir buenos mensajes de commit
Realiza 3 commits siguiendo las buenas prácticas (asunto ≤ 50 caracteres, cuerpo explicativo). Luego usa `git shortlog -sn` para ver el resumen por autor.
