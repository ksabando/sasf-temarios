---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 19

1. ¿Qué comando crea un nuevo worktree?
   R: `git worktree add <ruta> <rama>`.

2. ¿Qué ventaja tienen los worktrees frente a git stash?
   R: Permiten trabajar en múltiples ramas simultáneamente sin perder contexto.

3. ¿Cómo se listan todos los worktrees activos?
   R: `git worktree list`.

4. ¿Qué comando elimina un worktree?
   R: `git worktree remove <ruta>`.

5. ¿Para qué sirve `git worktree prune`?
   R: Limpia las referencias internas a worktrees que fueron eliminados manualmente.

6. ¿Cómo se crea un worktree con una nueva rama?
   R: `git worktree add -b <nueva-rama> <ruta> <base>`.

7. ¿Qué comando bloquea un worktree?
   R: `git worktree lock <ruta>`.

8. ¿Pueden dos worktrees tener checkout de la misma rama?
   R: No, Git lo impide para evitar conflictos.

9. ¿Comparten los worktrees los objetos del repositorio?
   R: Sí, comparten la base de datos de objetos de Git (`.git`).

10. Menciona un caso de uso típico de worktrees.
    R: Revisar un PR mientras se desarrolla otra funcionalidad.

