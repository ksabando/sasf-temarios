---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 19

## Ejercicio 1: Agregar Worktree para Feature
Partiendo de `main`, crea un worktree en `../feature-login` con una nueva rama `feature/login`. Realiza cambios y un commit dentro del worktree.

## Ejercicio 2: Listar Worktrees
Ejecuta `git worktree list` y observa la información de cada worktree activo.

## Ejercicio 3: Hotfix Worktree
Sin interrumpir tu trabajo en `feature/login`, crea un worktree desde `main` en `../hotfix-urgente`, realiza un fix y fusiónalo a main.

## Ejercicio 4: Eliminar y Prune
Elimina el worktree `feature-login` con `git worktree remove`. Luego ejecuta `git worktree prune` para limpiar.

## Ejercicio 5: Bloquear Worktree
Bloquea el worktree `hotfix-urgente` con `git worktree lock`. Intenta eliminarlo y verifica que no sea posible.
