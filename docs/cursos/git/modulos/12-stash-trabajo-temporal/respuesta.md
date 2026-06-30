---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 12

## Respuesta 1
```bash
git checkout -b feature-stash
echo "cambio1" > a.txt && echo "cambio2" > b.txt
git stash push -m "WIP feature"
git checkout main
echo "urgente" > u.txt && git add . && git commit -m "fix urgente"
git checkout feature-stash
git stash pop
git stash list  # debe estar vacío
```

## Respuesta 2
```bash
git stash push -m "cambios frontend"
git checkout -b otra-rama
echo "backend" > b.txt && git stash push -m "cambios backend"
git stash push -m "config temporal"
git stash list
git stash apply stash@{1}
```

## Respuesta 3
```bash
echo "linea1\nlinea2\nlinea3" > archivo.txt
# modificar linea1 y linea3
git stash -p
# responder: y para linea1, n para linea3
git stash pop
# solo linea1 se restaura
```

## Respuesta 4
```bash
echo "cambio en main" > c.txt && git add c.txt
git stash push -m "cambio pendiente"
git stash branch nueva-rama stash@{0}
git log --oneline  # cambios aplicados en nueva-rama
```

## Respuesta 5
```bash
echo "trackeado" > t.txt && git add t.txt && git commit -m "base"
echo "modificado" >> t.txt && echo "nuevo" > u.txt
git stash -u
git status  # limpio
git stash pop
git status  # ambos archivos recuperados
```

