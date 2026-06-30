---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 13

## Respuesta 1
```bash
echo "version original" > archivo.txt && git add . && git commit -m "base"
echo "cambio no deseado" >> archivo.txt
git restore archivo.txt
cat archivo.txt  # debe mostrar "version original"
```

## Respuesta 2
```bash
echo "c1" > f1.txt && git add . && git commit -m "commit 1"
echo "c2" > f2.txt && git add . && git commit -m "commit 2"
git reset --soft HEAD~1    # HEAD retrocede, f2.txt queda staged
git reset --mixed HEAD~1   # HEAD retrocede, f1.txt queda unstaged
git reset --hard HEAD~1    # f1.txt eliminado, working dir limpio
```

## Respuesta 3
```bash
echo "a" > a.txt && git add . && git commit -m "commit A"
echo "b" > b.txt && git add . && git commit -m "commit B"
echo "c" > c.txt && git add . && git commit -m "commit C"
git revert HEAD~1  # deshace commit B, abre editor para mensaje
git log --oneline  # aparece un 4to commit revirtiendo B
```

## Respuesta 4
```bash
echo "1" > 1.txt && git add . && git commit -m "commit 1"
echo "2" > 2.txt && git add . && git commit -m "commit 2"
echo "3" > 3.txt && git add . && git commit -m "commit 3"
git reset --hard HEAD~2  # pierde commits 2 y 3
git reflog               # muestra hashes de 2 y 3
git checkout -b recuperado abc1234  # crear rama con hash del commit 3
```

## Respuesta 5
```bash
mkdir temp && echo "tmp" > temp/t.txt
echo "nuevo" > nuevo.txt
git clean -n  # muestra lo que se eliminaría
git clean -fd
git status    # untracked eliminados
```

