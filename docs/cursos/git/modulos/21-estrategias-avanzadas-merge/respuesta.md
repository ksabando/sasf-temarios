---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 21

## Respuesta 1
```bash
git checkout -b experimental main
echo "cambio no deseado" > archivo.txt && git add . && git commit -m "experimental"
git checkout main
git merge -s ours experimental
git diff experimental  # No hay diferencias porque se ignoró el contenido
```

## Respuesta 2
```bash
echo "línea original" > conflicto.txt && git add . && git commit -m "main"
git checkout -b feature
echo "línea modificada por feature" > conflicto.txt && git add . && git commit -m "feature"
git checkout main
git merge -X theirs feature
```

## Respuesta 3
```bash
git checkout -b feat-a main && echo "a" > a.txt && git add . && git commit -m "feat a"
git checkout main && git checkout -b feat-b main && echo "b" > b.txt && git add . && git commit -m "feat b"
git checkout main && git checkout -b feat-c main && echo "c" > c.txt && git add . && git commit -m "feat c"
git checkout main
git merge -s octopus feat-a feat-b feat-c
```

## Respuesta 4
```bash
git checkout -b feature main
echo "1" > f.txt && git add . && git commit -m "1"
echo "2" >> f.txt && git add . && git commit -m "2"
echo "3" >> f.txt && git add . && git commit -m "3"
git checkout main
git merge --squash feature
git commit -m "feat: squash de feature"
git log --oneline  # Solo 1 commit; con merge regular serían 4
```

## Respuesta 5
```bash
echo "datos" > datos.txt && git add . && git commit -m "main"
git checkout -b feature
git mv datos.txt info.txt && git commit -m "rename datos.txt -> info.txt"
git checkout main
echo "modificación" >> datos.txt && git add . && git commit -m "mod datos"
git merge feature  # Git muestra CONFLICT (rename/rename)
# Resolver: decidir mantener rename y fusión manual
git add . && git commit -m "resolver rename conflict"
```

