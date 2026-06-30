---
sidebar_label: "Soluciones"
---

# Soluciones M22 — Docker y CI/CD

## Ejercicio 1: Dockerfile multi-stage

**Solución esperada**:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY public ./public
COPY src ./src

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 256;

    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Posibles mejoras**:
- Agregar `brotli` además de `gzip` para mejor compresión en navegadores modernos.
- Agregar `gzip_vary on` para compatibilidad con proxies de caché.
- Incluir `security.txt` y headers de seguridad adicionales como `Referrer-Policy` y `Permissions-Policy`.

---

## Ejercicio 2: .dockerignore

**Solución esperada**:

```
node_modules
dist
.git
.gitignore
*.md
.env.local
.env.development
.env.test
```

**Posibles mejoras**:
- Agregar `coverage/`, `.nyc_output/`, `test-results/` para excluir artefactos de testing.
- Agregar `Dockerfile*`, `docker-compose*.yml` para evitar copiar configuraciones de Docker dentro de la imagen.
- Excluir también `.vscode/`, `.idea/`, y directorios de configuración de IDE.

---

## Ejercicio 3: docker-compose.yml

**Solución esperada**:

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

Si no hay backend real, versión solo frontend:

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://api.taskflow.com
```

**Posibles mejoras**:
- Agregar `restart: unless-stopped` para que los contenedores se reinicien automáticamente después de un crash.
- Configurar `networks` para aislar el frontend y backend en una red interna de Docker.
- Agregar un servicio `nginx` separado como reverse proxy y un servicio `certbot` para SSL automático.

---

## Ejercicio 4: docker compose up --build

**Solución esperada**:

```bash
# Construir y levantar
docker compose up --build -d

# Verificar contenedores corriendo
docker compose ps

# Ver logs del frontend
docker compose logs -f frontend

# Probar que funciona
curl http://localhost

# Detener
docker compose down
```

**Posibles mejoras**:
- Agregar `docker compose build --no-cache` para builds limpios cuando se sospecha de caché corrupto.
- Usar `docker compose --profile production up` para separar configuraciones de dev/prod.
- Agregar healthchecks en `docker-compose.yml` para que `depends_on` espere a que el backend esté realmente listo (no solo el contenedor iniciado).

---

## Ejercicio 5: .github/workflows/deploy.yml

**Solución esperada**:

```yaml
name: TaskFlow CI/CD

on:
  push:
    branches: [main]
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

**Posibles mejoras**:
- Agregar un job de `audit` que corra `npm audit` para detectar vulnerabilidades en dependencias.
- Subir el reporte de coverage a Codecov o Coveralls para tracking histórico.
- Agregar notificaciones a Slack/Discord en caso de fallo del pipeline con `slackapi/slack-github-action`.
