---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 18

## Ejercicio 1: pre-receive Hook
Crea un script `pre-receive` que rechace cualquier push que contenga archivos mayores a 10 MB.

## Ejercicio 2: update Hook
Crea un script `update` que solo permita pushes a `main` si el mensaje del commit contiene una referencia a un issue (ej: `#123`).

## Ejercicio 3: post-receive Deploy
Crea un script `post-receive` que haga checkout a `/var/www/app` y reinicie el servicio PM2.

## Ejercicio 4: GitHub Actions Workflow
Crea un workflow de GitHub Actions que ejecute tests en cada push a `main` y, si pasan, haga deploy a un servidor.

## Ejercicio 5: GitLab CI Pipeline
Crea un archivo `.gitlab-ci.yml` con dos stages: `test` (ejecuta npm test) y `deploy` (ejecuta script de deploy solo en main).
