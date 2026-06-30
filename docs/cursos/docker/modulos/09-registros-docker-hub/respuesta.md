---
sidebar_label: "Soluciones"
---

# Soluciones M09 — Registros de Imágenes y Docker Hub

## Ejercicio 1: Taggear y subir imagen a Docker Hub
**Solución esperada**:
```bash
docker tag alpine:latest usuario/alpine:test
docker push usuario/alpine:test
```

**Posibles mejoras**:
- Usar tags semánticos con versión: `docker tag alpine:latest usuario/alpine:1.0.0 && docker push usuario/alpine:1.0.0`. Luego también pushear como `latest` para mantener el tag flotante.
- Verificar el manifest antes de hacer push con `docker manifest inspect usuario/alpine:test` (después del push) para confirmar que la imagen se subió correctamente con las capas esperadas.
- Autenticarse con token de acceso personal (PAT) en lugar de contraseña: `echo "$DOCKER_PAT" | docker login -u usuario --password-stdin`.

---

## Ejercicio 2: Registry local con registry:2
**Solución esperada**:
```bash
docker run -d -p 5000:5000 --name registry registry:2
docker tag alpine:latest localhost:5000/alpine:test
docker push localhost:5000/alpine:test
```

**Posibles mejoras**:
- Configurar almacenamiento persistente para el registry: `docker run -d -p 5000:5000 -v registry-data:/var/lib/registry --name registry registry:2`. Sin volumen, los datos se pierden al eliminar el contenedor.
- Configurar autenticación con htpasswd para evitar que cualquiera pueda hacer push: crear archivo `.htpasswd` con `docker run --rm --entrypoint htpasswd httpd:2 -Bbn user password > htpasswd` y pasar las variables de entorno `REGISTRY_AUTH=htpasswd`, `REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd`.
- Para HTTPS en producción, montar certificados TLS: `-v /certs:/certs` con `REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt` y `REGISTRY_HTTP_TLS_KEY=/certs/domain.key`.

---

## Ejercicio 3: Pull y verificación de imagen local
**Solución esperada**:
```bash
docker rmi localhost:5000/alpine:test   # Eliminar imagen local
docker pull localhost:5000/alpine:test  # Volver a descargar del registry local
```

**Posibles mejoras**:
- Verificar la integridad de la imagen descargada comparando el digest: `docker inspect --format='{{index .RepoDigests 0}}' localhost:5000/alpine:test` antes y después del pull.
- Listar todas las imágenes en el registry local con la API: `curl http://localhost:5000/v2/_catalog` y `curl http://localhost:5000/v2/alpine/tags/list`.
- Configurar `"insecure-registries": ["localhost:5000"]` en `/etc/docker/daemon.json` y reiniciar Docker si hay problemas con HTTPS (solo para desarrollo local).

---

## Ejercicio 4: Autenticación con ghcr.io
**Solución esperada**:
```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u usuario --password-stdin
docker tag alpine:latest ghcr.io/usuario/alpine:test
docker push ghcr.io/usuario/alpine:test
```

**Posibles mejoras**:
- Usar un GitHub Personal Access Token (PAT) con scope mínimo necesario (`write:packages` para push, `read:packages` para pull) en lugar de un token con todos los permisos.
- Configurar el repositorio GitHub para que el paquete sea público o privado según necesidad: desde Settings > Packages en GitHub.
- En GitHub Actions, usar el `GITHUB_TOKEN` automático en lugar de un PAT manual: `docker login ghcr.io -u ${{ github.actor }} --password-stdin <<< "${{ secrets.GITHUB_TOKEN }}"`.

---

## Ejercicio 5: Build multi-arquitectura con buildx
**Solución esperada**:
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t usuario/miapp:latest --push .
```

**Posibles mejoras**:
- Verificar que la imagen es realmente multi-arch: `docker buildx imagetools inspect usuario/miapp:latest` para ver los manifests por plataforma.
- Usar un builder dedicado con soporte multi-plataforma: `docker buildx create --name multiarch --use` y luego `docker buildx build --builder multiarch --platform linux/amd64,linux/arm64`.
- Aprovechar cache entre builds multi-arch agregando `--cache-to type=registry,ref=usuario/miapp:cache --cache-from type=registry,ref=usuario/miapp:cache`.
