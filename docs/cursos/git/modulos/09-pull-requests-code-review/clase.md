---
sidebar_label: "Clase"
---

# Clase - Módulo 09: Pull Requests y Code Review

## ¿Qué es un Pull Request (PR)?

Un PR es una solicitud para fusionar cambios de una rama a otra. Es el mecanismo central de colaboración en GitHub, GitLab y Bitbucket.

## Flujo completo de un PR

1. **Fork** (opcional) — Copia del repositorio a tu cuenta.
2. **Clone** — Clonar el repositorio localmente.
3. **Branch** — Crear una rama para los cambios.
4. **Commit** — Realizar y commiter cambios.
5. **Push** — Subir la rama al remoto.
6. **PR** — Abrir el Pull Request en la plataforma.

## gh CLI (GitHub CLI)

- `gh pr create` — Crea un PR desde la terminal.
- `gh pr review` — Revisa un PR con approve, comment o changes requested.
- `gh pr checkout <número>` — Baja el PR localmente.
- `gh pr list` — Lista PRs abiertos.

## Code Review

- **Comments** — Comentarios en líneas específicas del código.
- **Approvals** — Aprobación del reviewer.
- **Change requests** — Solicitud de cambios antes de aprobar.
- **Draft PR** — PR en borrador, no listo para revisión (GitHub: `gh pr create --draft`).

## GitHub Actions en PRs

Los PRs pueden ejecutar checks automatizados (lint, tests, build) mediante GitHub Actions. El PR no se puede fusionar si los checks fallan (según configuración).

## Estrategias de merge

- **Merge commit** — Crea un commit de merge (como `git merge --no-ff`).
- **Squash merge** — Comprime todos los commits de la rama en uno solo.
- **Rebase merge** — Rebase los commits sobre la base (historia lineal).

## Branch Protection

Reglas en GitHub que exigen:
- PRs aprobados (mínimo N reviewers).
- Checks pasados.
- Sin conflictos.
- Rama actualizada con la base.

## Buenas prácticas de code review

- PRs pequeños y enfocados.
- Revisar el qué y el porqué, no solo el cómo.
- Ser constructivo y respetuoso.
- Usar checklist de revisión.
