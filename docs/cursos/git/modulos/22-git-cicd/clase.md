---
sidebar_label: "Clase"
---

# Git CI/CD

## Introducción
Integrar Git con pipelines de CI/CD permite automatizar builds, tests y despliegues. Los hooks en la nube (push, PR) disparan flujos de trabajo.

## GitHub Actions

### Eventos de activación
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### Workflow básico
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm test
```

### Shallow clone en CI
```bash
git fetch --depth=1  # Clona solo el último commit, acelera CI
```

## GitLab CI

### Estructura `.gitlab-ci.yml`
```yaml
stages:
  - build
  - test
  - deploy

build-job:
  stage: build
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/
```

## Automatización de Versiones

### Auto tagging desde CI
```bash
git tag v1.2.3
git push origin v1.2.3
```

### Changelog automático
Con `conventional-changelog` o `semantic-release` se generan release notes desde commits convencionales.

```bash
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

### `git log --oneline` para release notes
```bash
git log --oneline v1.0.0..HEAD --no-merges
```

### `git describe --tags` para versión automática
```bash
git describe --tags --abbrev=0  # Último tag
git describe --tags             # Tag + commits desde el tag
```

## Estrategias de Ramificación para CI/CD
- **Trunk-based**: ramas cortas, merge frecuente a main, CI constante.
- **Git Flow**: releases desde release branch, CI en develop y main.
- **GitHub Flow**: PR a main con CI obligatorio antes de merge.
