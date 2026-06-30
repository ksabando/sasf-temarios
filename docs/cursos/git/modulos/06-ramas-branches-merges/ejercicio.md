---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 06

## Ejercicio 1: Crear ramas y cambiar entre ellas
Crea un repositorio, luego crea tres ramas (`feature/login`, `feature/logout`, `bugfix/error-500`) y cambia entre ellas usando `git switch` y `git checkout`.

## Ejercicio 2: Merge fast-forward
Desde `main`, crea una rama `feature/add-readme`, agrega un archivo README.md con contenido, haz commit, vuelve a `main` y fusiónala con `git merge`. Verifica que sea fast-forward.

## Ejercicio 3: Merge 3-way (recursivo)
Crea una rama `feature/navbar` desde `main`. En `main`, agrega un commit diferente. Luego fusiona `feature/navbar` en `main` y observa el commit de merge con `git log --graph`.

## Ejercicio 4: git branch -vv
Crea una rama local con seguimiento a `origin/main` (simulado localmente). Ejecuta `git branch -vv` e identifica la relación upstream. Luego haz push y verifica cómo cambia la salida.

## Ejercicio 5: git merge --no-ff
Crea una rama `feature/card`, haz un commit, vuelve a `main` y fusiónala con `git merge --no-ff`. Compara `git log --graph` con un merge normal sin `--no-ff`.
