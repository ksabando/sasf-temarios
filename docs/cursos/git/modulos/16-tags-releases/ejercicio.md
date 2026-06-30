---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 16

## Ejercicio 1: Crear Tags Lightweight y Annotated
Crea un repositorio, haz 3 commits. Crea un tag lightweight `v1.0.0` en el primer commit y un tag annotated `v2.0.0` en el último con el mensaje "Versión mayor". Muestra la diferencia con `git show` para cada tag.

## Ejercicio 2: Publicar Tags en Remoto
Sube los tags creados al remoto usando `git push origin <tag>` para uno y `git push --tags` para el resto. Verifica en el repositorio remoto que aparezcan.

## Ejercicio 3: Eliminar Tags Local y Remoto
Elimina un tag local con `git tag -d` y otro remoto con `git push origin --delete <tag>`. Verifica la eliminación.

## Ejercicio 4: Crear un Release en GitHub
Desde el repositorio remoto, crea un Release asociado a un tag annotated. Incluye notas de versión describiendo los cambios.

## Ejercicio 5: Crear un Tag Firmado
Configura GPG (si no lo tienes), genera un tag firmado con `git tag -s` y verifica la firma con `git tag -v`.
