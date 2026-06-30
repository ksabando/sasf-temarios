---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 08

## Respuesta 1
```bash
git init --bare repo-remoto.git
git init repo-local && cd repo-local
git remote add origin ../repo-remoto.git
git remote -v
# origin  ../repo-remoto.git (fetch)
# origin  ../repo-remoto.git (push)
```

## Respuesta 2
```bash
echo "cambio" > archivo.txt && git add . && git commit -m "Cambio local"
git push -u origin main
# Simular otro lado: git clone ... y hacer push
# Luego: git pull
```

## Respuesta 3
```bash
git fetch origin
git log HEAD..origin/main  # commits que llegarían con pull
git merge origin/main      # o git rebase origin/main
```

## Respuesta 4
```bash
# Escenario: push rechazado por avances remotos
git fetch origin
git rebase origin/main     # primero integrar cambios
git push --force-with-lease  # seguro, falla si hay cambios desconocidos
```
`--force` ignora el estado remoto; `--force-with-lease` lo verifica.

## Respuesta 5
```bash
git push origin feature/a feature/b feature/c
# En remoto: git branch -d feature/a ...
git remote prune origin
git branch -a  # las ramas eliminadas ya no aparecen
```

