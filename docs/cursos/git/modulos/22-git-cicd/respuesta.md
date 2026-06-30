---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 22

## Respuesta 1
```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm test
```

## Respuesta 2
```yaml
# Agregar job de tag después del build
  tag:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          VERSION=$(node -p "require('./package.json').version")
          git tag v$VERSION
          git push origin v$VERSION
```

## Respuesta 3
```yaml
stages: [build, test, deploy]
build-job:
  stage: build
  script: [npm install, npm run build]
  artifacts:
    paths: [dist/]
test-job:
  stage: test
  script: [npm test]
deploy-job:
  stage: deploy
  script: [echo "Deploying..."]
  only: [main]
```

## Respuesta 4
```bash
git log --oneline v1.0.0..v2.0.0 --no-merges > changelog.txt
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

## Respuesta 5
```bash
git tag v1.0.0 && git tag v1.1.0 && git tag v2.0.0
echo "nuevo commit" > x.txt && git add . && git commit -m "post-tag"
git describe --tags        # v2.0.0-1-g<sha>
git describe --tags --abbrev=0  # v2.0.0
```

