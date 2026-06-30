---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Crear .dockerignore

Crear `.dockerignore` que excluya:
- `node_modules`
- `dist`
- `.git` y `.gitignore`
- Archivos `*.md`
- `.env.local` y `.env.development`

---

## Ejercicio 3: Crear docker-compose.yml

Crear `docker-compose.yml` con dos servicios:

**frontend:**
- Build desde el Dockerfile actual
- Puerto `80:80`
- Variable de entorno `VITE_API_URL=http://backend:8080/api`
- Depende de `backend`

**backend:**
- Imagen `spring-backend:latest` (asumir que existe en `./backend/Dockerfile`)
- Puerto `8080:8080`
- Variable `SPRING_PROFILES_ACTIVE=prod`

---

## Ejercicio 4: docker compose up --build

```bash
docker compose up --build
```

Verificar:
- Que el frontend sirva en `http://localhost`
- Que el backend responda en `http://localhost:8080/api`
- Que las peticiones del frontend lleguen al backend

Si no hay backend real, crear un `docker-compose` funcional solo con el frontend.

---

## Ejercicio 5: Crear .github/workflows/deploy.yml

Crear el workflow de CI/CD completo:

```yaml
name: TaskFlow CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    # npm run lint
  test:
    # npm run test
    needs: lint
  build:
    # npm run build
    needs: test
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    # Usar amondnet/vercel-action
```

Requisitos:
- Los jobs se ejecutan secuencialmente: lint → test → build → deploy
- `deploy` solo corre en push a `main`
- Usar `actions/checkout@v4` y `actions/setup-node@v4` con cache
- `npm ci` para instalar dependencias
