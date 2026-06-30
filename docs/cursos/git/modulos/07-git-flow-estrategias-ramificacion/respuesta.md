---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 07

## Respuesta 1
```bash
git init repo-gitflow
git commit --allow-empty -m "Initial commit"
git branch develop
git switch -c feature/login develop
echo "login" > login.txt && git add . && git commit -m "Add login"
git switch develop && git merge feature/login
git switch -c release/v1.0 develop
git switch main && git merge release/v1.0
git tag v1.0
```

## Respuesta 2
```bash
git switch -c feature/homepage
echo "homepage" > index.html && git add . && git commit -m "Add homepage"
git push -u origin feature/homepage
# Crear PR en GitHub o con gh pr create
# Tras aprobar, fusionar con merge en GitHub
```

## Respuesta 3
```bash
git switch -c hotfix/critical-bug main
echo "fix" > fix.txt && git add . && git commit -m "Critical fix"
git switch main && git merge hotfix/critical-bug
git switch develop && git merge hotfix/critical-bug
```

## Respuesta 4
Crear `comparativa.md` con tabla: Estrategia, Ramas, Pros, Contras, Caso de uso.

## Respuesta 5
- Feature login: `feature/login`
- Bug en paginación: `bugfix/pagination-error`
- Hotfix de seguridad: `hotfix/security-patch`
- Release v2.0: `release/v2.0`
- Rama experimental: `experiment/new-auth`

