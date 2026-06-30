---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 11

## Ejercicio 1: Rebase en lugar de merge
Crea una rama `feature` desde `main`, haz 2 commits en `feature` y 1 commit en `main`. Usa `git rebase` para integrar los cambios de `feature` sobre `main` sin crear un merge commit. Verifica que la historia sea lineal.

## Ejercicio 2: Squash de commits
En una rama, realiza 4 commits pequeños. Usa `git rebase -i HEAD~4` para fusionar los 4 commits en 2: el primero queda como está, los siguientes 3 se squashean en el segundo commit.

## Ejercicio 3: Reword un mensaje
Toma un commit existente con un mensaje poco descriptivo. Usa `git rebase -i` para cambiar su mensaje a uno más claro usando la operación `reword`.

## Ejercicio 4: Reordenar commits
Crea 3 commits A, B, C en orden cronológico. Usa `git rebase -i` para reordenarlos como C, A, B.

## Ejercicio 5: rebase --onto
Crea 2 ramas `feature-a` y `feature-b` desde `main`. Haz commits en ambas. Usa `git rebase --onto` para mover los commits de `feature-b` sobre `feature-a` como nueva base.
