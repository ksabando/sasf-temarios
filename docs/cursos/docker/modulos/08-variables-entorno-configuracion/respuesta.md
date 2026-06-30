---
sidebar_label: "Soluciones"
---

# Soluciones M08 — Variables de Entorno y Configuración

## Ejercicio 1: Pasar variable con -e
**Solución esperada**:
```bash
docker run --rm -e MENSAJE=Hola alpine sh -c 'echo $MENSAJE'
# Salida: Hola
```

**Posibles mejoras**:
- Usar `--env-file` para pasar múltiples variables desde un archivo en lugar de múltiples flags `-e`, que se vuelven difíciles de leer con 5+ variables: `docker run --rm --env-file config.env alpine sh`.
- Verificar que la variable realmente se está pasando con `docker run --rm -e MENSAJE=Hola alpine env | grep MENSAJE`, que lista todas las variables de entorno del contenedor.
- Recordar que `-e` sobreescribe ENV del Dockerfile. Si necesitás que el valor del Dockerfile no sea sobreescribible, usá ARG en lugar de ENV durante el build.

---

## Ejercicio 2: Usar --env-file
**Solución esperada**:
```bash
echo 'DB_USER=admin' > .env
echo 'DB_PASSWORD=secret' >> .env
docker run --rm --env-file .env alpine sh -c 'echo $DB_USER'
# Salida: admin
```

**Posibles mejoras**:
- Agregar validación de variables requeridas: `docker run --rm --env-file .env alpine sh -c '[ -z "$DB_USER" ] && echo "DB_USER not set" || echo $DB_USER'` para fallar temprano si falta una variable crítica.
- Usar `--env-file` múltiples veces para combinar configuración base con overrides por entorno: `--env-file base.env --env-file prod.env` donde el segundo sobreescribe al primero.
- Mantener archivos `.env` fuera de git (agregar a `.gitignore`) para no versionar credenciales, y compartir un archivo `.env.example` con valores de ejemplo.

---

## Ejercicio 3: Variables en Compose (.env)
**Solución esperada**:
El archivo `.env` se lee automáticamente por Docker Compose para interpolar variables en el YAML:
```yaml
# docker-compose.yml
services:
  app:
    image: myapp:${VERSION:-latest}
    environment:
      - DB_USER=${DB_USER}
```

**Posibles mejoras**:
- Usar `docker compose config` después de configurar el `.env` para ver el YAML efectivo con todas las variables interpoladas, validando que la configuración resultante es correcta.
- Crear múltiples archivos de entorno: `.env.dev`, `.env.prod` y cargarlos con `docker compose --env-file .env.prod up`, manteniendo un solo compose file para todos los entornos.
- Usar sintaxis de default y required: `${DB_HOST:-localhost}` para un default, `${DB_PASSWORD:?DB_PASSWORD is required}` para forzar que la variable esté definida.

---

## Ejercicio 4: Build args
**Solución esperada**:
```bash
docker build --build-arg VERSION=2.0 -t myapp .
# En el Dockerfile:
# ARG VERSION
# RUN echo "Building version $VERSION"
```

**Posibles mejoras**:
- No pasar secretos como build args porque quedan en el historial de la imagen (`docker history`). Para secretos de build, usar BuildKit secrets: `docker build --secret id=token,src=token.txt -t myapp .` con `RUN --mount=type=secret,id=token`.
- Definir valores por defecto en el Dockerfile: `ARG VERSION=1.0` para que el build funcione sin `--build-arg`, pero permitir sobrescribirlo cuando sea necesario.
- Combinar ARG con ENV cuando el valor de build debe persistir en runtime: `ARG VERSION \n ENV APP_VERSION=$VERSION`.

---

## Ejercicio 5: Secrets en Swarm/Compose
**Solución esperada**:
Los secrets se montan en `/run/secrets/` dentro del contenedor como archivos de solo lectura:
```bash
echo "mysecretpassword" | docker secret create db_password -
docker service create --name db --secret db_password postgres
# Dentro del contenedor: cat /run/secrets/db_password
```

**Posibles mejoras**:
- En Compose (sin Swarm), simular secrets usando el campo `secrets:` con archivos locales, asegurando que los archivos de secret no estén en git: agregar `*.secret` al `.gitignore`.
- Rotar secrets periódicamente: `docker secret rm db_password && docker secret create db_password new-file && docker service update --secret-rm db_password --secret-add db_password db`.
- Para monitoreo, verificar que los secrets existen antes de que la aplicación intente leerlos, evitando crashes por archivos faltantes en `/run/secrets/`.
