---
sidebar_label: "Cuestionario"
---

# Cuestionario M22 — Docker y CI/CD para React

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es Kubernetes (K8s) y cómo se compara con Docker Compose para orquestar una app React + Spring Boot? ¿Cuándo necesitás K8s en lugar de docker-compose?

**Respuesta**: Docker Compose orquesta contenedores en UNA sola máquina (ideal para desarrollo, staging, apps pequeñas). Kubernetes orquesta contenedores en un CLUSTER de múltiples máquinas con auto-scaling, rolling updates, service discovery, y self-healing. Para TaskFlow: Docker Compose es suficiente (desarrollo + staging). Kubernetes sería necesario si: (1) necesitás escalar horizontalmente (>3 instancias del backend), (2) necesitás zero-downtime deployments con rolling updates y health checks, (3) tenés múltiples microservicios que necesitan service mesh, (4) necesitás auto-scaling basado en CPU/memoria.

**Por qué**: K8s es overkill para la mayoría de proyectos frontend. Docker Compose + un VPS (o Vercel para frontend + Railway/Heroku para backend) es suficiente hasta que tengas cientos de usuarios concurrentes. La complejidad operativa de K8s es alta (aprender pods, services, deployments, ingress, configmaps, secrets, helm charts). Para TaskFlow, docker-compose es la herramienta correcta para desarrollo local multi-contenedor. Para producción, Vercel (frontend) + un servicio gestionado para Spring Boot es más simple que K8s. Fuente: kubernetes.io, "Docker Compose vs Kubernetes" en la doc oficial de Docker, y "When to use Kubernetes" en el blog de Google Cloud.

---

### 2. [Investigar] ¿Qué es Cloudflare Pages y cómo se compara con Vercel para deploy de SPAs React? Cloudflare Pages tiene edge network global y precios más bajos. ¿Qué ventajas y limitaciones tiene?

**Respuesta**: Cloudflare Pages ofrece deploy automático desde Git, CDN global (~300 puntos), functions para SSR (Cloudflare Workers), y un generoso free tier (builds ilimitados, 500 builds/mes). Comparado con Vercel: (1) Cloudflare es más barato en escala (ancho de banda ilimitado vs 100GB en Vercel Pro), (2) Cloudflare Workers usan V8 isolates (más rápidos en cold start que Vercel Serverless), (3) Vercel tiene mejor DX para Next.js (ISR, middleware, analytics), (4) Vercel tiene preview deployments más pulidos. Para una SPA Vite + React como TaskFlow, Cloudflare Pages es una excelente alternativa a Vercel.

**Por qué**: Cloudflare Pages usa `wrangler.toml` para configuración y detecta automáticamente Vite (build command: `npm run build`, output: `dist`). La ventaja principal sobre Vercel es el ancho de banda ilimitado y los Workers para añadir backend ligero (API routes, redirects, auth middleware) sin deployar un servidor Node separado. La limitación: Workers tienen tiempo de ejecución máximo de 30s (CPU) y no soportan WebSockets bien (para apps con tiempo real). Fuente: pages.cloudflare.com, "Vercel vs Cloudflare Pages" en múltiples comparativas, y la guía "Deploy Vite to Cloudflare Pages".

---

### 3. [Investigar] ¿Qué es ArgoCD y GitOps para React? Investigá cómo el paradigma GitOps (usando ArgoCD o Flux) cambia el deploy de aplicaciones React comparado con el enfoque push tradicional (Vercel, GitHub Actions deploy).

**Respuesta**: GitOps (con ArgoCD) invierte el modelo de deploy: en lugar de que CI "empuje" el build a producción (push), un operador en el cluster Kubernetes monitorea constantemente el repositorio Git y sincroniza el estado del cluster con lo declarado en Git (pull). Si alguien cambia manualmente algo en producción, ArgoCD lo revierte al estado de Git. Para React, GitOps implica: CI genera Docker image → push a registry → actualiza un repo de config con el nuevo tag → ArgoCD detecta el cambio → actualiza el deployment en K8s. Esto da auditabilidad completa y rollback via git revert.

**Por qué**: GitOps es más relevante para equipos grandes con múltiples servicios y entornos. Para TaskFlow (SPA simple), GitOps es overkill. Pero es importante entenderlo como alternativa enterprise. La ventaja principal: el estado deseado del sistema está en Git (single source of truth), cualquier cambio en producción sin pasar por Git se revierte automáticamente, y el historial de Git es el historial de deploys. Fuente: argoproj.github.io, "GitOps Principles" en opengitops.dev, y "GitOps for Frontend" en el blog de Codefresh.

---

### 4. [Investigar] ¿Qué es nginx vs Caddy vs simple HTTP server para servir una SPA React? Investigá las diferencias en features y tamaño de imagen Docker.

**Respuesta**: nginx (alpine, ~5MB base): servidor web completo, probado en producción, alta concurrencia, gzip/brotli, headers de seguridad, reverse proxy, rate limiting. Caddy (alpine, ~40MB base): HTTPS automático con Let's Encrypt, configuración más simple (Caddyfile vs nginx.conf), HTTP/3 nativo, pero menos probado en escala extrema. Simple HTTP server (serve, http-server, Node serve): más liviano en setup pero sin gzip, sin headers de seguridad, sin reverse proxy, no apto para producción. Para TaskFlow, nginx es la opción correcta: imagen pequeña, probado, configuración simple, todos los features necesarios.

**Por qué**: nginx es el estándar para servir SPAs. Su configuración (`try_files $uri /index.html`) es simple y conocida. Caddy es más moderno pero su imagen es más grande y la comunidad es más pequeña. Un simple `npx serve dist` (imagen Node: 300MB+) es inaceptable para producción (imagen pesada, sin optimizaciones de caching, sin headers de seguridad). La imagen `nginx:alpine` final con `dist/` copiada pesa ~20MB — ideal para desplegar rápido y con mínima superficie de ataque. Fuente: nginx.com, caddyserver.com, y las mejores prácticas de Docker para Node.js.

---

### 5. [Conectar] La clase muestra Docker layer caching con `COPY package*.json ./` antes de `RUN npm ci`. Conectá esto con el concepto de "BuildKit cache mounts" y "Docker layer invalidation". ¿Cómo optimizar aún más el build de una app React con dependencias grandes?

**Respuesta**: BuildKit (habilitado con `DOCKER_BUILDKIT=1`) ofrece cache mounts que persisten entre builds:

```dockerfile
RUN --mount=type=cache,target=/root/.npm npm ci
```

Esto cachea `~/.npm` (donde npm guarda paquetes descargados) entre builds, acelerando `npm ci` incluso si `package-lock.json` cambió. También podés usar `--mount=type=cache,target=/app/node_modules` para cachear node_modules entre builds (con cuidado de no incluir módulos nativos de otra plataforma). Además, `npm ci --prefer-offline` usa el cache local primero. Esto puede reducir `npm ci` de 2 minutos a 10 segundos.

**Por qué**: Sin cache mounts, cada cambio en `package.json` (incluso agregar una dependencia) invalida la capa de `npm ci` y descarga TODO de nuevo. Con cache mounts, las dependencias no cambiadas se reutilizan del build anterior. BuildKit también soporta `--mount=type=secret` para pasar tokens de npm privados sin hardcodearlos en la imagen. Fuente: docs.docker.com/build/buildkit, "Docker BuildKit cache mounts" en el blog de Docker, y "Optimizing Docker builds for Node.js" por Bret Fisher.

---

### 6. [Conectar] La clase usa `VITE_API_URL` en build time. Conectá esto con el patrón "runtime configuration" para SPAs Dockerizadas. ¿Cómo permitir que la misma imagen Docker se despliegue en staging y producción con diferentes URLs de API sin re-buildear?

**Respuesta**: Una estrategia es inyectar configuración en runtime via un endpoint `/config.json` o un script que escribe `window.__CONFIG__`:

1. Crear `public/config.json` con valores default
2. En nginx, agregar un script inline que haga `fetch('/config.json')` y exponga en `window.__CONFIG__`
3. Al iniciar el contenedor, montar un `config.json` específico del entorno via Docker volume o Kubernetes ConfigMap:

```bash
docker run -v $(pwd)/config.prod.json:/usr/share/nginx/html/config.json my-app
```

Alternativa: entrypoint script que usa `envsubst` para reemplazar placeholders en un archivo JS de configuración con variables de entorno pasadas a docker run.

**Por qué**: Vite inlinea `import.meta.env.VITE_*` en build time, por lo que no podés cambiarlas después del `npm run build`. La estrategia de runtime config resuelve esto: el build es genérico, y la configuración específica del entorno se inyecta al iniciar el contenedor. Esto permite "build once, deploy many" — uso de la misma imagen Docker en staging y producción con diferentes configuraciones. Fuente: "Runtime environment variables for SPAs" en múltiples blogs, la documentación de create-react-app sobre runtime env vars, y patrones de Docker para SPAs.

---

### 7. [Conectar] La clase usa GitHub Actions con Vercel. Conectá esto con el concepto de "Preview Deployments". ¿Cómo configurarías preview deployments por PR en Vercel o Cloudflare Pages para testear cambios antes de mergear?

**Respuesta**: Vercel automáticamente crea preview deployments para cada PR (si conectás el repo de GitHub). Cada PR recibe una URL única (ej: `taskflow-git-feature-xyz.vercel.app`) con el build de esa rama. Podés configurar en GitHub Actions que un comment en el PR publique la URL del preview. En Cloudflare Pages, la configuración es similar: habilitás "branch preview" y cada rama recibe `branch-name.project.pages.dev`. Estos deployments permiten testear visualmente cambios antes de mergear sin deployar localmente.

**Por qué**: Los preview deployments son una práctica estándar en equipos modernos. Reemplazan el flujo de "testear localmente y esperar que funcione en producción". Un revisor de PR puede abrir la URL del preview, interactuar con la app, y verificar visualmente cambios de UI. También podés correr E2E tests (Playwright/Cypress) contra la URL del preview en CI. Vercel y Cloudflare Pages ofrecen esto nativamente sin configuración adicional. Fuente: vercel.com/docs/deployments/preview, Cloudflare Pages docs sobre preview deployments, y "Preview Deployments with GitHub Actions" en el blog de Vercel.

---

### 8. [Cuestionar] ¿Es Docker realmente necesario para una SPA React? Algunos argumentan que con Vercel/Netlify/Cloudflare Pages, Docker para frontend es sobre-ingeniería. ¿Cuándo justifica Docker para una SPA?

**Respuesta**: Docker NO es necesario para una SPA si usás plataformas como Vercel o Cloudflare Pages (que abstraen el build y el serve). Docker justifica cuando: (1) necesitás consistencia total entre desarrollo y producción (mismo entorno), (2) desplegás en infraestructura propia (VPS, on-premise), (3) tu app tiene dependencias de sistema complejas (no es el caso de SPAs puras), (4) necesitás coordinar frontend + backend + DB en desarrollo local (docker-compose), (5) tu empresa tiene políticas de deploy que requieren contenedores. Para el frontend solo, Vercel es más simple que Docker. Para el sistema completo (frontend + Spring Boot + DB), Docker Compose es invaluable.

**Por qué**: Plataformas serverless-frontend (Vercel, Netlify) abstraen Docker. No necesitás escribir Dockerfile, configurar nginx, ni manejar contenedores. Pero perdés control: no podés configurar nginx avanzado, no tenés logs del servidor, y dependés del vendor. La tendencia: para startups y proyectos chicos → Vercel/Cloudflare. Para empresas con infraestructura existente → Docker. Para TaskFlow (proyecto educativo), Docker es valioso para aprender y para coordinar con Spring Boot. Fuente: "Do you need Docker for a React app?" en múltiples blogs, discusiones en reddit.com/r/reactjs, y "Vercel vs Docker: When to use each".

---

### 9. [Cuestionar] ¿Vercel vs Netlify vs Cloudflare Pages vs self-hosted para SPAs React? ¿Qué plataforma elegir según el proyecto y el equipo?

**Respuesta**: Vercel: mejor DX global, mejor para Next.js y SPAs, preview deployments pulidos, analytics integrado. Netlify: similar a Vercel, mejor para JAMstack (static sites), forms integrados, serverless functions más simples. Cloudflare Pages: más barato a escala, mejor performance de edge (300+ ciudades), Workers para backend ligero. Self-hosted (VPS + nginx): control total, sin límites de plataforma, requiere operaciones. Para TaskFlow (educativo): Vercel es la opción más simple para deployar y compartir. Para producción: si el equipo es pequeño, Vercel. Si el producto escala y necesita control de costos, Cloudflare Pages.

**Por qué**: La decisión depende de: presupuesto (Vercel Pro $20/mes vs Cloudflare gratis/barato), familiaridad del equipo (Vercel es el default de la comunidad React), y requisitos técnicos (WebSockets, long-running tasks, server-side logic). Ninguna es "la mejor" — son trade-offs entre simplicidad, costo, y control. Fuente: comparativas en jamstack.org, "Vercel vs Netlify vs Cloudflare" en el blog de Bejamas, y experiencias de equipos en twitter.

---

### 10. [Cuestionar] ¿Deberíamos usar nginx o un simple serve de Node en producción para SPAs? La clase usa nginx. ¿Es nginx realmente necesario o un `npx serve dist` es suficiente?

**Respuesta**: nginx es NECESARIO para producción. `npx serve` (o `http-server`, o `serve`) no tiene: (1) gzip/brotli compresión (el bundle se transfiere sin comprimir, hasta 3x más grande), (2) headers de seguridad (CSP, X-Frame-Options, X-Content-Type-Options), (3) caching de assets con `Cache-Control: immutable`, (4) alta concurrencia (nginx maneja 10,000+ conexiones con event-driven architecture; Node serve se bloquea con muchas), (5) reverse proxy a backend (útil para evitar CORS), (6) rate limiting, (7) HTTP/2, (8) TLS termination. La imagen nginx:alpine son solo 5MB — no hay excusa para no usarla.

**Por qué**: Servir SPAs con Node (express.static o serve) es aceptable para desarrollo pero irresponsable para producción. nginx es el estándar de la industria para servir archivos estáticos: usa sendfile() syscall (zero-copy del sistema operativo), event loop no bloqueante en C, y ha sido battle-tested por décadas. La imagen nginx:alpine con tu `dist/` es ~15-20MB total — más pequeña que Node solo (120MB+). Fuente: nginx.com, "Why nginx for SPAs" en múltiples guías de producción, y benchmarks de nginx vs Node static serve.
