---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 19

## Respuesta 1
```bash
git worktree add -b feature/login ../feature-login main
cd ../feature-login
echo "login page" > login.html
git add . && git commit -m "feat: login page"
```

## Respuesta 2
```bash
git worktree list
# ../repositorio       (main)
# ../feature-login     (feature/login)
# ../hotfix-urgente    (hotfix/urgente)
```

## Respuesta 3
```bash
git worktree add -b hotfix/urgente ../hotfix-urgente main
cd ../hotfix-urgente
echo "fix" > fix.txt && git add . && git commit -m "fix: urgente"
cd ../repositorio
git merge hotfix/urgente
```

## Respuesta 4
```bash
git worktree remove ../feature-login
git worktree prune
git worktree list
```

## Respuesta 5
```bash
git worktree lock ../hotfix-urgente
git worktree remove ../hotfix-urgente  # Error: worktree está bloqueado
git worktree unlock ../hotfix-urgente
```

