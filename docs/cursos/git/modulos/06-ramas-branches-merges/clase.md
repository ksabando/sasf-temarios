---
sidebar_label: "Clase"
---

# Clase - Módulo 06: Ramas, Branches y Merges

## ¿Qué es una rama (branch)?

Una rama en Git es un puntero móvil a un commit específico. Por defecto, la rama principal se llama `main` (o `master`). Crear una rama es crear un nuevo puntero que apunta al commit actual.

## git branch

- `git branch` — Lista las ramas locales. La rama activa aparece con un asterisco (`*`).
- `git branch <nombre>` — Crea una nueva rama en el commit actual.
- `git branch -m <viejo> <nuevo>` — Renombra una rama.
- `git branch -d <nombre>` — Elimina una rama ya fusionada.
- `git branch -D <nombre>` — Elimina una rama sin fusionar (forzado).

## git checkout vs git switch

- `git checkout <rama>` — Cambia a otra rama (estilo clásico).
- `git checkout -b <rama>` — Crea y cambia a una nueva rama.
- `git switch <rama>` — Cambia a otra rama (moderno, introducido en Git 2.23).
- `git switch -c <rama>` — Crea y cambia a una nueva rama.

## Merge Fast-Forward

Ocurre cuando la rama destino no tiene commits nuevos desde que se creó la rama fuente. Git simplemente mueve el puntero hacia adelante (fast-forward).

```
      A---B---C  feature
     /
D---E            main (se mueve a C)
```

## Merge 3-Way (Recursivo)

Ocurre cuando ambas ramas tienen commits divergentes. Git crea un nuevo commit de merge con dos padres.

```
      A---B---C  feature
     /         \
D---E-----------F  main (commit de merge)
```

## git merge

- `git merge <rama>` — Fusiona `<rama>` en la rama activa.
- `git merge --no-ff <rama>` — Fuerza un merge 3-way incluso si es posible fast-forward.

## Ramas Remotas

- `origin/main` — Es la referencia a la rama `main` del remoto `origin`.
- `git branch -a` — Lista todas las ramas (locales y remotas).
- `git branch -vv` — Muestra las ramas locales con su relación de seguimiento (`tracking`).

## Buenas prácticas

- Mantener ramas con nombres descriptivos: `feature/login`, `bugfix/issue-42`.
- Eliminar ramas ya fusionadas para mantener el repositorio limpio.
- Usar `--no-ff` para preservar la historia de ramas temáticas en equipos.
