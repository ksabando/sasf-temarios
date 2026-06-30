---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 24

## Respuesta 1
```bash
npm init -y
npm install -D @commitlint/cli @commitlint/config-conventional husky
npx husky init
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
git commit -m "chore: configurar commitlint"  # Pasa
git commit -m "mensaje sin tipo"  # Falla con error de commitlint
```

## Respuesta 2
```bash
echo "*.sh text eol=lf" > .gitattributes
echo "*.bat text eol=crlf" >> .gitattributes
echo "*.png binary" >> .gitattributes
echo "*.txt text" >> .gitattributes
```

## Respuesta 3
```bash
git gc --aggressive --prune=now
# Limpia objetos sueltos, comprime packs
git fsck --full
# Verifica integridad: sin errores = repositorio sano
```

## Respuesta 4
```bash
git archive --format=zip --output=repo.zip HEAD
git archive --format=tar.gz --output=repo.tar.gz HEAD
ls -lh repo.zip repo.tar.gz
```

## Respuesta 5
```bash
echo "contraseña=12345" > secreto.txt
git add . && git commit -m "agregar secreto"
echo "otro secreto" >> secreto.txt && git add . && git commit -m "modificar secreto"
git filter-repo --path secreto.txt --invert-paths
# secreto.txt ya no aparece en ningún commit del historial
```

