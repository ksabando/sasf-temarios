---
sidebar_label: "Clase"
---

# Git Worktrees

## ¿Qué son los Worktrees?

Los worktrees permiten tener múltiples directorios de trabajo asociados a un mismo repositorio. Cada worktree puede tener checkout de una rama diferente simultáneamente.

## Comandos Principales

### Agregar un Worktree

```bash
git worktree add ../ruta rama
git worktree add -b feature ../feature   # Crea y checkout de nueva rama
```

### Listar Worktrees

```bash
git worktree list
```

Muestra la ruta, la rama y el commit de cada worktree.

### Eliminar un Worktree

```bash
git worktree remove ../ruta
git worktree prune   # Limpia referencias a worktrees eliminados manualmente
```

### Bloquear / Desbloquear

Evita que un worktree sea eliminado accidentalmente.

```bash
git worktree lock ../ruta
git worktree unlock ../ruta
```

## Casos de Uso

### Trabajar en Múltiples Ramas Simultáneamente
Sin necesidad de stash ni commits temporales.

```bash
git worktree add ../hotfix hotfix-urgente
# Trabajas en hotfix sin alterar tu trabajo actual
```

### Revisar PRs
Cada PR en una carpeta separada.

### Releases Paralelas
Mantener versiones antiguas abiertas mientras desarrollas la nueva.

## Ventajas sobre Alternativas

| Método | Desventaja |
|--------|------------|
| git stash | Se pierde contexto, solo una tarea |
| Múltiples clones | Duplicar disco, sin referencias compartidas |
| Worktrees | Comparten objetos Git, evitan conflictos |

## Buenas Prácticas

- No hacer checkout de la misma rama en dos worktrees.
- Bloquear worktrees que no deban eliminarse.
- Usar `git worktree prune` periódicamente.
- Preferir worktrees sobre stash para tareas paralelas.
