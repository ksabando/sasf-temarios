---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 13

## Ejercicio 1: restore para descartar cambios
Modifica un archivo trackeado sin hacer commit. Usa `git restore` para descartar los cambios. Verifica que el archivo vuelva a su estado original.

## Ejercicio 2: reset soft, mixed y hard
Crea 2 commits. Practica los 3 modos de reset: usa `--soft` y verifica que los cambios queden staged, luego `--mixed` y vea que quedan unstaged, finalmente `--hard` y confirma que todo se pierde.

## Ejercicio 3: revert un commit
Crea 3 commits en main. Usa `git revert` para deshacer el segundo commit sin eliminar la historia. Verifica que se cree un nuevo commit de reversión.

## Ejercicio 4: reflog para recuperar commit perdido
Haz un `git reset --hard HEAD~2` perdiendo 2 commits. Usa `git reflog` para encontrar los commits y recuperarlos creando una rama desde el hash.

## Ejercicio 5: clean de untracked files
Crea varios archivos y directorios no trackeados. Usa `git clean -n` para previsualizar, luego `git clean -fd` para eliminarlos.
