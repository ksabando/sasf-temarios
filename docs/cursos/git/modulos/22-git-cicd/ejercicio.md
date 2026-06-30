---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 22

## Ejercicio 1: Workflow Básico
Crea un archivo `.github/workflows/ci.yml` que ejecute `npm install` y `npm test` en cada push a `main` y en cada PR contra `main`.

## Ejercicio 2: Auto Tagging
Extiende el workflow anterior para que, al hacer push a `main`, cree un tag automático con la versión del `package.json` y lo suba al repositorio.

## Ejercicio 3: GitLab CI Pipeline
Crea un `.gitlab-ci.yml` con stages `build`, `test` y `deploy`. Incluye artefactos del build y despliegue condicional solo en `main`.

## Ejercicio 4: Changelog desde Commits
Usa `git log --oneline` para generar un changelog entre dos tags. Luego usa `conventional-changelog` para generar un archivo CHANGELOG.md.

## Ejercicio 5: Versionado con describe
Crea 3 tags en un repositorio, haz commits después del último tag y ejecuta `git describe --tags` para ver la versión automática generada.
