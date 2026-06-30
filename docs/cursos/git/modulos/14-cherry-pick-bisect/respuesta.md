---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 14

## Respuesta 1
```bash
git checkout -b hotfix
echo "fix" > fix.txt && git add . && git commit -m "corrección bug crítico"
git log --oneline -1  # obtener hash
git checkout main
git cherry-pick <hash>  # aplicar solo el fix
```

## Respuesta 2
```bash
git checkout -b feature
echo "1" > c1.txt && git add . && git commit -m "commit 1"
echo "2" > c2.txt && git add . && git commit -m "commit 2"
echo "3" > c3.txt && git add . && git commit -m "commit 3"
echo "4" > c4.txt && git add . && git commit -m "commit 4"
git log --oneline  # identificar hashes
git checkout main
git cherry-pick <hash-commit1>..<hash-commit4>  # aplica 2,3,4
```

## Respuesta 3
```bash
echo "ok" > app.txt && git add . && git commit -m "base ok"
echo "ok2" >> app.txt && git add . && git commit -m "feature ok"
echo "BUG" >> app.txt && git add . && git commit -m "introduce bug"
echo "mas" >> app.txt && git add . && git commit -m "cambio extra"
git bisect start HEAD HEAD~3
# git marca commit entre medio; revisar si tiene "BUG"
git bisect bad / git bisect good (repetir hasta encontrar)
git bisect reset
```

## Respuesta 4
```bash
git log -S "TODO" --oneline  # busca commits que tocaron "TODO"
git log -S "function" --oneline -- "*.js"  # solo en JS
git show <hash>  # ver el commit completo
```

## Respuesta 5
```bash
git blame -w app.txt              # ignora whitespace
git blame -L 10,20 app.txt        # solo líneas 10 a 20
git blame -L 5,+15 app.txt        # 15 líneas desde línea 5
```

