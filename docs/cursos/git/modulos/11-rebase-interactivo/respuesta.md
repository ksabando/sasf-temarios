---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 11

## Respuesta 1
```bash
git checkout -b feature
echo "cambio1" > a.txt && git add . && git commit -m "feature commit 1"
echo "cambio2" >> a.txt && git add . && git commit -m "feature commit 2"
git checkout main
echo "main cambio" > b.txt && git add . && git commit -m "main commit"
git checkout feature
git rebase main
git log --oneline --graph  # historia lineal sin merge commit
```

## Respuesta 2
```bash
# hacer 4 commits
echo "1" > f1.txt && git add . && git commit -m "primero"
echo "2" > f2.txt && git add . && git commit -m "segundo"
echo "3" > f3.txt && git add . && git commit -m "tercero"
echo "4" > f4.txt && git add . && git commit -m "cuarto"
git rebase -i HEAD~4
# en editor: pick primero, squash segundo, squash tercero, squash cuarto
# se genera un commit con los 3 squasheados
```

## Respuesta 3
```bash
git rebase -i HEAD~3
# cambiar "pick" por "reword" en el commit deseado
# al cerrar el editor, se abre otro para escribir el nuevo mensaje
git log --oneline -3  # verificar mensaje cambiado
```

## Respuesta 4
```bash
echo "A" > a.txt && git add . && git commit -m "Commit A"
echo "B" >> a.txt && git add . && git commit -m "Commit B"
echo "C" >> a.txt && git add . && git commit -m "Commit C"
git rebase -i HEAD~3
# reordenar líneas: pick Commit C, pick Commit A, pick Commit B
```

## Respuesta 5
```bash
git checkout -b feature-a
echo "a1" > a1.txt && git add . && git commit -m "a1"
git checkout main
git checkout -b feature-b
echo "b1" > b1.txt && git add . && git commit -m "b1"
echo "b2" > b2.txt && git add . && git commit -m "b2"
git rebase --onto feature-a feature-b~2 feature-b
# los 2 commits de feature-b ahora están sobre feature-a
```

