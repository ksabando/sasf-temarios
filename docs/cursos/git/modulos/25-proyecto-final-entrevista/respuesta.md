---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 25

## Respuesta 1
```bash
git init
echo -e "node_modules/\n.env\ndist/" > .gitignore
echo -e "*.sh text eol=lf\n*.bat text eol=crlf\n*.png binary\n*.jpg binary" > .gitattributes
git add . && git commit -m "chore: init con gitignore y gitattributes"
```

## Respuesta 2
```bash
git checkout -b develop main
git checkout -b feat-login develop && echo "login" > login.txt && git add . && git commit -m "feat: login"
git checkout develop && git merge feat-login
git checkout -b feat-api develop && echo "api" > api.txt && git add . && git commit -m "feat: api"
git checkout develop && git merge feat-api
git checkout -b feat-ui develop && echo "ui" > ui.txt && git add . && git commit -m "feat: ui"
git checkout develop && git merge feat-ui
git checkout -b release/v1.0 develop
```

## Respuesta 3
```bash
echo -e "línea1\n...línea10" > index.html && git add . && git commit -m "main"
git checkout -b feature-a && sed -i 's/línea1/modificado por A/' index.html && git add . && git commit -m "feat: cambios A"
git checkout main && git checkout -b feature-b && sed -i 's/línea5/modificado por B/' index.html && git add . && git commit -m "feat: cambios B"
git checkout main && git merge feature-a && git merge feature-b
# Resolver conflictos manualmente en index.html
git add index.html && git commit -m "fix: resolver conflicto triple"
```

## Respuesta 4
```bash
echo "1" > f.txt && git add . && git commit -m "primero"
echo "2" >> f.txt && git add . && git commit -m "segundo"
echo "3" >> f.txt && git add . && git commit -m "tercero"
echo "4" >> f.txt && git add . && git commit -m "cuarto"
echo "5" >> f.txt && git add . && git commit -m "quinto"
git rebase -i HEAD~5
# pick primero, squash segundo, squash tercero, fixup cuarto, reword quinto
# Resultado: feat: primero, feat: tercero (con squash), feat: quinto
```

## Respuesta 5
```bash
echo "a" > a.txt && echo "b" > b.txt && echo "c" > c.txt && git add .
git stash push -m "stash parcial" -- a.txt b.txt
git checkout -b otra-rama && git stash pop
git checkout main && git checkout c.txt
```

## Respuesta 6
```bash
echo "hotfix urgente" > fix.txt && git add . && git commit -m "fix: hotfix urgente"
git log --oneline -1  # Obtener hash
git checkout release/v1.0
git cherry-pick <HASH>
```

## Respuesta 7
```bash
npx husky init
echo 'npm run lint && npm run test' > .husky/pre-commit
# Si lint o test fallan, el hook retorna exit code != 0 y aborta el commit
```

## Respuesta 8
```yaml
# .github/workflows/ci.yml
name: CI
on: push
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install && npm test
      - run: |
          TAG=v$(node -p "require('./package.json').version")
          git tag $TAG && git push origin $TAG
```

## Respuesta 9
```bash
gpg --full-generate-key
gpg --list-secret-keys --keyid-format LONG  # obtener KEY-ID
git config --global user.signingkey KEY-ID
git config --global commit.gpgsign true
echo "a" > a.txt && git add . && git commit -m "feat: commit 1 firmado"
echo "b" > b.txt && git add . && git commit -m "feat: commit 2 firmado"
git log --show-signature
```

## Respuesta 10
```bash
# Crear archivo grande y commit normal
dd if=/dev/urandom of=grande.bin bs=1M count=6
git add grande.bin && git commit -m "add archivo grande"
# Configurar LFS
git lfs track "*.bin"
git add .gitattributes && git commit -m "chore: config LFS para .bin"
# Migrar archivo existente a LFS
git lfs migrate import --include="*.bin" --everything
git log --oneline  # Historial ahora tiene punteros LFS
```

