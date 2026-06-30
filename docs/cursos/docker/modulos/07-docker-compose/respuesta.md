---
sidebar_label: "Soluciones"
---

# Soluciones M07 — Docker Compose

## Ejercicio 1: Levantar servicios con Compose
**Solución esperada**:
```bash
docker compose up -d
# Levanta todos los servicios definidos en docker-compose.yml en background
docker compose ps    # Verificar que ambos servicios están corriendo
```

**Posibles mejoras**:
- Agregar healthchecks a los servicios para verificar que no solo están "up" sino realmente funcionando: `HEALTHCHECK --interval=10s CMD curl -f http://localhost:80 || exit 1`.
- Usar `docker compose up -d --wait` para que el comando espere hasta que todos los servicios reporten estado healthy antes de devolver el control, ideal para scripts de CI/CD.
- Definir `restart: unless-stopped` en cada servicio para que sobrevivan a reinicios del daemon Docker.

---

## Ejercicio 2: Ver logs combinados
**Solución esperada**:
```bash
docker compose logs -f
# Muestra logs de todos los servicios combinados con prefijos: web | ..., db | ...
```

**Posibles mejoras**:
- Filtrar logs por servicio específico: `docker compose logs -f web` para ver solo los logs del servicio web, útil cuando tenés muchos servicios y necesitás enfocarte en uno.
- Usar `docker compose logs --tail 50 --timestamps web` para ver últimas 50 líneas con timestamps, facilitando correlación temporal al debuggear.
- Configurar log rotation a nivel de Compose usando el campo `logging:` en cada servicio con `driver: json-file` y `options: max-size: "10m", max-file: "3"`.

---

## Ejercicio 3: Ejecutar comandos en servicios
**Solución esperada**:
```bash
docker compose exec db psql -U postgres
# \l lista las bases de datos dentro de PostgreSQL
```

**Posibles mejoras**:
- Usar `docker compose run` para comandos one-off que no requieren el servicio corriendo: `docker compose run --rm db psql -U postgres -c "SELECT version();"`.
- Crear un servicio auxiliar en el compose file (`admin` o `cli`) que herede la configuración del servicio principal pero tenga un comando diferente, para tareas administrativas recurrentes.
- Agregar `profiles:` (`profiles: ["admin"]`) a servicios que no se necesitan en el `up` normal y solo se ejecutan bajo demanda con `docker compose --profile admin run ...`.

---

## Ejercicio 4: Dependencias entre servicios
**Solución esperada**:
Con depends_on, el servicio `app` espera que `db` esté disponible antes de iniciarse:
```yaml
services:
  app:
    depends_on:
      - db
  db:
    image: postgres:16-alpine
```

**Posibles mejoras**:
- Agregar `condition: service_healthy` y HEALTHCHECK en el servicio db para garantizar que la BD esté aceptando conexiones antes de arrancar la app:
```yaml
    depends_on:
      db:
        condition: service_healthy
```
- Implementar retry logic en la aplicación (ej. `wait-for-it.sh` o `dockerize`) como capa adicional de resiliencia, ya que depends_on con condition solo cubre el inicio inicial pero no reconexiones posteriores.
- Usar `restart: on-failure` en los servicios con `depends_on` para que si un servicio dependiente falla al arrancar (porque la BD no llegó a estar ready), se reintente automáticamente.

---

## Ejercicio 5: Escalar un servicio
**Solución esperada**:
```bash
docker compose up -d --scale web=3
# 3 contenedores web ejecutándose
docker compose ps   # Verificar las 3 réplicas con nombres web-1, web-2, web-3
```

**Posibles mejoras**:
- Usar un balanceador de carga (nginx, traefik) como servicio adicional en el compose file que proxyee a las múltiples réplicas del servicio web usando el DNS round-robin de Docker.
- Agregar `--scale` en combinación con `deploy.replicas` para control consistente entre desarrollo y producción (aunque `deploy` es específico de Swarm, documenta la intención).
- Tener cuidado con puertos publicados al escalar: solo el primer contenedor puede bindear el puerto del host. Para múltiples réplicas con puertos, usar un reverse proxy o modo `host` de red con asignación dinámica de puertos.
