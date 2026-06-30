---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 18

## Respuesta 1
```bash
# hooks/pre-receive
#!/bin/sh
while read oldrev newrev refname; do
  git diff --stat "$oldrev".."$newrev" | awk '/\|/ {gsub(/[^0-9]/,"",$3); if ($3 > 10485760) exit 1}'
  if [ $? -ne 0 ]; then
    echo "Error: Archivo mayor a 10MB. Push rechazado."
    exit 1
  fi
done
```

## Respuesta 2
```bash
# hooks/update
#!/bin/sh
refname="$1"
oldrev="$2"
newrev="$3"
if [ "$refname" = "refs/heads/main" ]; then
  if ! git log --format=%B "$newrev" -1 | grep -q "#[0-9]\+"; then
    echo "Error: El commit debe referenciar un issue (#123)."
    exit 1
  fi
fi
```

## Respuesta 3
```bash
# hooks/post-receive
#!/bin/sh
while read oldrev newrev refname; do
  if [ "$refname" = "refs/heads/main" ]; then
    git --work-tree=/var/www/app checkout -f
    pm2 restart app
  fi
done
```

## Respuesta 4
```yaml
# .github/workflows/ci.yml
name: CI/CD
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST https://deploy.server.com/hook
```

## Respuesta 5
```yaml
# .gitlab-ci.yml
stages:
  - test
  - deploy
test:
  stage: test
  script: npm test
deploy:
  stage: deploy
  script: npm run deploy
  only:
    - main
```

