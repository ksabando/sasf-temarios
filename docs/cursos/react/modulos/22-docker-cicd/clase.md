---
sidebar_label: "Clase"
---

## 2. .dockerignore

Excluye archivos innecesarios del contexto de build:

```
node_modules
dist
.git
.gitignore
*.md
.env.local
.env.development
```

---

## 3. docker-compose con frontend + backend

`docker-compose.yml` orquesta múltiples contenedores:

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:8080/api

  backend:
    image: spring-backend:latest
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
```

### Comandos útiles

```bash
# Construir e iniciar
docker compose up --build

# Modo detached
docker compose up --build -d

# Ver logs
docker compose logs -f frontend

# Detener
docker compose down
```

---

## 4. GitHub Actions: CI/CD pipeline

Workflow con lint, test, build y deploy condicional.

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test -- --coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Secrets de GitHub necesarios
- `VERCEL_TOKEN` — token de API de Vercel
- `VERCEL_ORG_ID` — ID de la organización en Vercel
- `VERCEL_PROJECT_ID` — ID del proyecto en Vercel

---

## 5. Deploy a Vercel desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

O desde GitHub Actions como se muestra arriba.

---

## Resumen

| Componente | Propósito |
|------------|-----------|
| Dockerfile multi-stage | Build + nginx serve en imagen ~20MB |
| .dockerignore | Excluir node_modules, .git, etc. |
| docker-compose.yml | Orquestar frontend + backend |
| nginx.conf | SPA routing, gzip, security headers |
| .github/workflows/deploy.yml | Lint → Test → Build → Deploy |
| Vercel | Hosting con deploy automático |
