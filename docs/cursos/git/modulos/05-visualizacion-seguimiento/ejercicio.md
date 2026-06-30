---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 05

## Ejercicio 1: Historial con diferentes formatos
Crea al menos 6 commits en un repositorio, algunos en distintas ramas. Luego usa:
- `git log --oneline --graph --all --decorate`
- `git log --since="1 day ago"`
- `git log --author="tu nombre" --oneline`

## Ejercicio 2: Usar git blame
Crea un archivo con múltiples líneas escritas en diferentes commits. Ejecuta `git blame archivo.txt` e identifica en qué commit se modificó cada línea y por quién.

## Ejercicio 3: Pickaxe con git log -S
Agrega una función o palabra única en un commit. Luego usa `git log -S "palabraUnica" --oneline` para encontrar el commit que introdujo esa palabra. Verifica también con `git show`.

## Ejercicio 4: Usar git describe
Crea un tag en un commit con `git tag -a v1.0 -m "Versión 1.0"`. Luego haz 3 commits más. Ejecuta `git describe` y explica el formato de la salida.

## Ejercicio 5: Recuperar un commit perdido con reflog
Realiza un `git reset --hard HEAD~2` para "perder" commits. Usa `git reflog` para encontrar los hashes perdidos y recupera uno con `git checkout hash`.
