---
sidebar_label: "Soluciones"
---

# Soluciones M15 — Docker en Producción y Recursos

## Ejercicio 1: Limitar memoria
**Solución esperada**:
```bash
docker run -d --memory=256m --name limited-nginx nginx:alpine
docker stats limited-nginx
# Muestra 256 MB de límite máximo en la columna MEM USAGE / LIMIT
```

**Posibles mejoras**:
- Agregar `--memory-swap=256m` para deshabilitar swap (mismo valor que memory) y forzar que el contenedor use solo RAM física, lo que previene degradación de rendimiento por swapping.
- Establecer `--memory-reservation=128m` como soft limit para que el kernel pueda reclamar memoria bajo presión: el contenedor puede usar hasta 256m pero el kernel intenta mantenerlo en 128m.
- Monitorear OOM kills: `docker inspect limited-nginx | grep OOMKilled`. Si el contenedor es matado por OOM killer, el campo será `true` y el exit code será 137.

---

## Ejercicio 2: Limitar CPU
**Solución esperada**:
```bash
docker run -d --cpus=0.5 --name limited-cpu nginx:alpine
# Limita a 0.5 CPUs (50% de 1 core)
docker stats limited-cpu
# Verifica que el CPU % no supera ~50%
```

**Posibles mejoras**:
- Usar `--cpuset-cpus=0-1` para limitar a cores específicos (afinidad de CPU), útil para aplicaciones con licenciamiento por core o para NUMA-aware workloads.
- Combinar `--cpus=1.5` con `--cpu-shares=2048` para establecer un límite duro de 1.5 cores y alta prioridad cuando haya contención.
- Verificar el throttle de CPU: `docker inspect limited-cpu | grep -A 5 CpuStats` para ver `throttling_data` que indica si el contenedor fue throttled (se le negó tiempo de CPU por exceder su quota).

---

## Ejercicio 3: Restart policy
**Solución esperada**:
```bash
docker run -d --restart always --name auto-restart nginx:alpine
# Al matar el proceso principal (kill <PID>), Docker lo reinicia automáticamente
docker inspect auto-restart | grep -i restart
# "RestartCount": 1
```

**Posibles mejoras**:
- Usar `--restart on-failure:5` en lugar de `always` para tareas que deben reintentar ante errores pero no reiniciarse infinitamente si hay un bug que causa crash inmediato (restart loop).
- Para servicios de producción, usar `--restart unless-stopped` para que sobrevivan a reinicios del daemon pero respeten paradas manuales del administrador.
- Monitorear restart loops: si `RestartCount` crece rápidamente en poco tiempo, el contenedor está en un crash loop y necesita intervención.

---

## Ejercicio 4: Limpieza con docker system prune
**Solución esperada**:
```bash
docker system prune -a
# Elimina todos los contenedores detenidos, redes no usadas,
# imágenes no referenciadas por ningún contenedor, y build cache
docker system df    # Verificar espacio liberado
```

Libera espacio de contenedores, imágenes, redes y build cache no usados.

**Posibles mejoras**:
- Usar `docker system prune --filter "until=24h"` para eliminar solo objetos con más de 24 horas, preservando lo recién usado para rollback rápido.
- Antes de ejecutar prune, verificar qué se eliminará: `docker system df -v` muestra el detalle y permite identificar imágenes o volúmenes que no deberían eliminarse.
- NO usar `--volumes` a menos que estés absolutamente seguro: `docker system prune -a --volumes` elimina volúmenes no usados que pueden contener datos importantes.

---

## Ejercicio 5: Graceful shutdown
**Solución esperada**:
```bash
docker stop --time=30 web
# Envía SIGTERM, espera 30 segundos, luego SIGKILL si no terminó
```
El contenedor atrapa SIGTERM, realiza cleanup (cerrar conexiones, guardar buffers) y sale gracefulmente con exit code 0.

**Posibles mejoras**:
- Implementar un handler de SIGTERM en la aplicación: en Node.js `process.on('SIGTERM', gracefulShutdown)`, en Python `signal.signal(signal.SIGTERM, handler)`, en Go capturar `syscall.SIGTERM` con un channel.
- Usar `--init` o `tini` como PID 1 si la aplicación no fue diseñada para manejar señales correctamente: `docker run --init` asegura que las señales se propaguen al proceso de aplicación.
- Configurar un pre-stop hook en orquestadores: en Kubernetes, `terminationGracePeriodSeconds` y `preStop` hooks permiten ejecutar comandos de limpieza antes de SIGTERM.
