---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 09

## Respuesta 1
```bash
gh repo fork https://github.com/usuario/repo --clone
cd repo
git switch -c feature/amazing
echo "cambio" > file.txt && git add . && git commit -m "Amazing change"
git push -u origin feature/amazing
gh pr create --title "Feature amazing" --body "Descripción del cambio"
```

## Respuesta 2
```bash
gh pr checkout 42
# gh pr review 42 --comment --body "Revisa la línea 10"
# gh pr review 42 --request-changes --body "Corrige X"
# gh pr review 42 --approve
```

## Respuesta 3
```bash
gh pr create --title "Nueva feature" --body "Implementa X" --base main
gh pr list --state open
```

## Respuesta 4
```bash
# Squash: git merge --squash feature && git commit -m "Squashed"
# vs Rebase: git rebase feature && git merge feature
# Squash = 1 commit; Rebase = historia lineal individual
```

## Respuesta 5
Ir a Settings → Branches → Add rule:
- Branch name pattern: `main`
- Require a pull request before merging: 1 required approval
- Require status checks
- Require up-to-date branches

