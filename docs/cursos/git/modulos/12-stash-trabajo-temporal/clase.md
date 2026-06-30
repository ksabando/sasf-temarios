---
sidebar_label: "Clase"
---

# Stash — Trabajo Temporal

## Introducción

`git stash` guarda cambios no confirmados (working directory y staging) en una pila temporal, permitiendo limpiar el working directory para cambiar de rama o hacer otra tarea y recuperarlos después.

## git stash push

Guarda los cambios en el stash y revierte el working directory al último commit:

```bash
git stash push -m "mensaje descriptivo"
# o simplemente:
git stash
```

## git stash pop vs apply

- **pop**: Aplica los cambios del stash más reciente y lo elimina de la pila.
- **apply**: Aplica los cambios pero conserva el stash en la pila.

```bash
git stash pop stash@{0}
git stash apply stash@{0}
```

## git stash list

Lista todos los stashes guardados:

```bash
git stash list
# stash@{0}: On main: WIP: corrección urgente
# stash@{1}: On feature: refactor parcial
```

## git stash drop y clear

```bash
git stash drop stash@{1}   # elimina un stash específico
git stash clear             # elimina todos los stashes
```

## Stash parcial (git stash -p)

Permite seleccionar interactivamente qué cambios guardar en el stash, útil para guardar solo partes del working directory:

```bash
git stash -p
# Git pregunta por cada bloque (hunk): (y/n/q/a/d...)
```

## git stash branch

Crea una nueva rama desde el commit donde se creó el stash y aplica los cambios automáticamente. Muy útil si se hizo stash en la rama equivocada:

```bash
git stash branch nueva-rama stash@{0}
```

## Stash de archivos no trackeados

Por defecto `git stash` solo guarda archivos trackeados. Para incluir untracked:

```bash
git stash -u              # include untracked
git stash --include-untracked
```

Para incluir también los ignorados: `git stash -a` o `git stash --all`.

## Ver contenido del stash

```bash
git stash show -p stash@{0}   # muestra el diff completo
git stash show stash@{0}      # solo resumen de archivos
```

## Flujo de trabajo típico

```bash
# trabajando en feature, llega una urgencia
git stash push -m "feature incompleto"
git checkout main
# ... trabajar en la urgencia ...
git checkout feature
git stash pop
```

## Buenas prácticas

- Usar mensajes descriptivos con `-m` para identificar cada stash.
- Preferir `git stash branch` si el stash lleva tiempo guardado.
- No abusar del stash; commits pequeños son mejores para cambios a largo plazo.
