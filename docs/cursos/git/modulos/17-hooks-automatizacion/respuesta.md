---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 17

## Respuesta 1
```bash
# .git/hooks/pre-commit
#!/bin/sh
if git diff --cached | grep -E "(console\.log|debugger|TODO)"; then
  echo "Error: Se encontraron console.log, debugger o TODO en los cambios."
  exit 1
fi
```
```bash
chmod +x .git/hooks/pre-commit
```

## Respuesta 2
```bash
# .git/hooks/commit-msg
#!/bin/sh
if ! grep -qE "^(feat|fix|chore|docs|style|refactor|perf|test)(\(.+\))?: .{1,}" "$1"; then
  echo "Error: El mensaje debe seguir Conventional Commits."
  exit 1
fi
```
```bash
chmod +x .git/hooks/commit-msg
```

## Respuesta 3
```bash
npm init -y
npx husky init
npx husky add .husky/pre-commit "npm test"
git add .husky/pre-commit
```

## Respuesta 4
```bash
npm install --save-dev lint-staged
```
En `package.json`:
```json
"lint-staged": {
  "*.{js,ts}": ["eslint --fix", "prettier --write"]
}
```
En `.husky/pre-commit`: `npx lint-staged`

## Respuesta 5
```bash
mkdir .githooks
cp .git/hooks/pre-commit .githooks/
cp .git/hooks/commit-msg .githooks/
git config core.hooksPath .githooks
git add .githooks/
```

