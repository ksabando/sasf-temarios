---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 10

## Respuesta 1
```bash
git init repo-conflicto && cd repo-conflicto
echo "linea1" > archivo.txt && git add . && git commit -m "Init"
git switch -c rama-a
echo "linea1 modificada por A" > archivo.txt && git add . && git commit -m "Cambio A"
git switch main
echo "linea1 modificada por main" > archivo.txt && git add . && git commit -m "Cambio main"
git merge rama-a  # conflicto
# Editar archivo.txt: dejar solo "linea1 resuelta"
git add archivo.txt && git commit
```

## Respuesta 2
```bash
git config merge.tool vimdiff
git mergetool
# En vimdiff: Ctrl+w + flechas para navegar paneles
# :qa para cerrar todos los paneles
git add archivo.txt && git commit
```

## Respuesta 3
```bash
git switch -c feature
echo "cambio feature" > data.txt && git add . && git commit -m "Feature"
git switch main
echo "cambio main" > data.txt && git add . && git commit -m "Main"
git switch feature && git rebase main  # conflicto
# Resolver archivo, git add, luego git rebase --continue
```

## Respuesta 4
```bash
# En conflicto:
git checkout --ours conflicto.txt   # versión de HEAD
git checkout --theirs conflicto.txt # versión entrante
git add conflicto.txt && git commit
```

## Respuesta 5
```bash
git config --global rerere.enabled true
# Repetir mismo conflicto dos veces
# La primera vez: resolución manual
# La segunda vez: rerere reaplica la resolución previa
```

