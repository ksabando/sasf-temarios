---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 03

## Respuesta 1
```bash
git clone https://github.com/octocat/Hello-World.git
cd Hello-World
git log --oneline
```

## Respuesta 2
```bash
mkdir proyecto
cd proyecto && git init
echo "<h1>Hola</h1>" > index.html
echo "body {}" > style.css
echo "console.log('ok')" > app.js
git add . && git commit -m "Primer commit"
```

## Respuesta 3
```bash
echo "// nuevo código" >> app.js
git diff                     # Muestra cambios sin staging
git add app.js
git diff --staged            # Muestra cambios en staging
```

## Respuesta 4
```bash
git rm style.css
git mv index.html inicio.html
git status   # Muestra: deleted: style.css, renamed: index.html -> inicio.html
git commit -m "Elimina style.css, renombra index.html"
```

## Respuesta 5
```bash
git log --oneline
# abc1234 Segundo commit
# def5678 Primer commit

git log --oneline --graph --all
# * abc1234 Segundo commit
# * def5678 Primer commit

git log --stat
# Muestra archivos modificados en cada commit

git log -2
# Revisarltimos 2 commits
```

## Respuesta 6
```bash
git commit -m "msg erroneo"
git commit --amend -m "Mensaje corregido"
git log --oneline
# El hash del commit cambió (amend crea un nuevo commit)
```

