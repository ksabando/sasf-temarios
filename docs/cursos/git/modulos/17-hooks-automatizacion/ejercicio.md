---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 17

## Ejercicio 1: pre-commit Hook
Crea un hook `pre-commit` que busque líneas con `console.log()`, `debugger` o `TODO` en los archivos staged y rechace el commit si encuentra alguna.

## Ejercicio 2: commit-msg Hook
Crea un hook `commit-msg` que valide que el mensaje siga el formato Conventional Commits: `tipo(scope): descripción`. Ej: `feat(login): agrega autenticación`.

## Ejercicio 3: Instalar y Configurar Husky
En un proyecto Node.js, instala Husky y configura un hook `pre-commit` que ejecute `npm test`.

## Ejercicio 4: lint-staged
Configura lint-staged para que ejecute ESLint y Prettier solo sobre los archivos `.js` y `.ts` que estén staged.

## Ejercicio 5: Compartir Hooks
Crea una carpeta `.githooks/` en la raíz del proyecto, mueve allí los hooks creados y configura `core.hooksPath` para que Git los use.
