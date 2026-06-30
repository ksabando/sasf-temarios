---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 25

## Ejercicio 1: Init y Configuración
Inicializa un repositorio Git. Crea `.gitignore` para Node.js (node_modules/, .env, dist/) y `.gitattributes` para normalizar archivos (LF para .sh, CRLF para .bat, binarios para .png/.jpg).

## Ejercicio 2: Git Flow
Crea ramas `develop` y 3 feature branches (`feat-login`, `feat-api`, `feat-ui`). Desarrolla en cada una y fusiónalas a `develop`. Luego crea `release/v1.0` desde `develop`.

## Ejercicio 3: Conflicto Complejo
En `main`, crea `index.html`. En rama `feature-a` modifica líneas 1-10. En `feature-b` modifica líneas 5-15. Fusiona ambas a `main` y resuelve el conflicto triple.

## Ejercicio 4: Interactive Rebase
Crea 5 commits con mensajes no convencionales. Usa rebase interactivo para squashear los 3 del medio en 1 y renombrar todos con formato Conventional Commits. Deben quedar 3 commits.

## Ejercicio 5: Partial Stash
En `main`, modifica 3 archivos diferentes. Usa stash parcial para guardar solo 2 de ellos. Cambia a otra rama, aplica el stash, y vuelve a `main` para recuperar el tercer archivo con `git checkout`.

## Ejercicio 6: Cherry-pick
En `main`, crea un hotfix commit. Desde `release/v1.0` (sin el hotfix), usa cherry-pick para traer solo ese commit específico.

## Ejercicio 7: Pre-commit Hook
Configura un hook pre-commit que ejecute `npm run lint` y `npm run test` antes de cada commit. Si falla, que impida el commit.

## Ejercicio 8: CI/CD Pipeline
Crea un workflow de GitHub Actions que: haga checkout, instale dependencias, ejecute tests, y si todo pasa, cree un tag automático con la versión del package.json.

## Ejercicio 9: Firmas GPG
Genera un par de claves GPG, configura Git para firmar automáticamente, realiza 3 commits firmados y verifica las firmas con `git log --show-signature`.

## Ejercicio 10: LFS y Limpieza
Crea un archivo grande (>5MB) y haz commit. Configura Git LFS para ese tipo de archivo. Migra el archivo a LFS. Verifica que el historial ahora apunte a punteros LFS.
