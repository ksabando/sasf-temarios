---
sidebar_label: "Soluciones"
---

# Soluciones M04 — Imágenes y Dockerfiles

## Ejercicio 1: Analizar capas de una imagen
**Solución esperada**:
```bash
docker history alpine
# Muestra cada capa: FROM scratch, ADD rootfs, CMD
IMAGE          CREATED         CREATED BY                                      SIZE
e66264b98777   3 weeks ago     CMD ["/bin/sh"]                                 0B
<missing>      3 weeks ago     ADD alpine-minirootfs-3.20.0-x86_64.tar.gz /    7.79MB
```

**Posibles mejoras**:
- Usar `docker history --no-trunc alpine` para ver los comandos completos sin truncar y entender exactamente qué hace cada capa.
- Usar `dive alpine` (herramienta externa) para analizar interactivamente cada capa, su tamaño, y qué archivos agregó/modificó/eliminó.
- Comparar `docker history alpine` con `docker history ubuntu` para visualizar la diferencia de complejidad y tamaño entre una imagen minimalista y una completa.

---

## Ejercicio 2: Crear un Dockerfile simple
**Solución esperada**:
```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
EXPOSE 80
```

**Posibles mejoras**:
- Agregar `HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:80/ || exit 1` para que Docker pueda monitorear si nginx está realmente sirviendo requests.
- Usar `COPY --chown=nginx:nginx index.html /usr/share/nginx/html/` para que los archivos tengan el propietario correcto en lugar de root.
- Agregar `.dockerignore` con entradas como `.git`, `node_modules`, `*.md` para evitar enviar archivos innecesarios al build context.

---

## Ejercicio 3: Build y run de la imagen
**Solución esperada**:
```bash
docker build -t my-nginx .
docker run -d -p 8080:80 my-nginx
```

**Posibles mejoras**:
- Usar BuildKit para builds más rápidos y con mejor cache: `DOCKER_BUILDKIT=1 docker build -t my-nginx .`
- Agregar un tag con versión semántica: `docker build -t my-nginx:1.0.0 -t my-nginx:latest .` para tener tanto una versión específica como latest.
- Usar `docker run -d --restart unless-stopped --name my-nginx -p 8080:80 my-nginx` para que el contenedor sobreviva a reinicios del daemon.

---

## Ejercicio 4: Verificar cache de build
**Solución esperada**:
La segunda build usa cache para las primeras capas si no cambiaron. Docker muestra `---> Using cache` para cada paso cacheado.

```bash
docker build -t my-nginx .
# La segunda vez: ---> Using cache en los pasos que no cambiaron
```

**Posibles mejoras**:
- Usar `--build-arg BUILDKIT_INLINE_CACHE=1` y `--cache-from` para compartir cache entre diferentes entornos de CI/CD, acelerando builds en pipelines.
- Agregar un `--build-arg CACHEBUST=$(date +%s)` antes de pasos que querés forzar a re-ejecutar sin invalidar todo el cache.
- Entender la estrategia de orden de capas: poner COPY del código fuente lo más tarde posible en el Dockerfile, después de RUN de dependencias pesadas, para maximizar la reutilización del cache.

---

## Ejercicio 5: .dockerignore y limpieza de build
**Solución esperada**:
```dockerignore
.git
*.md
node_modules
Dockerfile
docker-compose.yml
.env
```

`.dockerignore` evita que archivos innecesarios se copien. Verificar con:
```bash
docker build --no-cache -t my-nginx .
```

**Posibles mejoras**:
- Agregar entradas para archivos de configuración local y secretos: `.env`, `*.pem`, `*.key`, `credentials.json`.
- Usar `!` (negación) para incluir archivos específicos que de otra forma serían excluidos por un patrón anterior: `!nginx.conf` después de `*.conf`.
- Verificar el efecto de `.dockerignore` creando un contenedor temporal: `docker run --rm -it my-nginx sh` y listando qué archivos realmente se copiaron a la imagen.
