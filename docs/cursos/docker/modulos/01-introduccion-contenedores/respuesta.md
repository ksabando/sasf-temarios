---
sidebar_label: "Soluciones"
---

# Soluciones M01 — Introducción a Contenedores

## Ejercicio 1: Verificación de instalación de Docker
**Solución esperada**:
```bash
docker --version
# Docker version 26.x.x, build ...

docker info
# Muestra información detallada del daemon, número de contenedores, imágenes, storage driver, etc.
```

**Posibles mejoras**:
- Usar `docker version --format '{{.Server.Version}}'` para obtener solo la versión del daemon en scripts de CI.
- Verificar que el storage driver sea `overlay2` (más eficiente que devicemapper o aufs) revisando la salida de `docker info | grep "Storage Driver"`.
- Configurar el `Cgroup Driver` como `systemd` en `/etc/docker/daemon.json` para mejor integración con sistemas que usan systemd.

---

## Ejercicio 2: Ejecutar hello-world
**Solución esperada**:
```bash
docker run hello-world
```
Docker busca la imagen hello-world localmente, no la encuentra, la descarga de Docker Hub, crea un contenedor y ejecuta el mensaje de salida.

```
Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

**Posibles mejoras**:
- Analizar la imagen hello-world con `docker inspect hello-world` para entender que usa `FROM scratch` como base (imagen vacía, sin sistema operativo).
- Usar `docker image history hello-world` para ver las capas de la imagen y entender que es un único binario copiado sobre scratch.
- Probar `docker run --rm hello-world` para que el contenedor se elimine automáticamente al terminar, evitando contenedores detenidos acumulados.

---

## Ejercicio 3: Explorar un contenedor Ubuntu
**Solución esperada**:
```bash
docker run -it --name ubuntu-test ubuntu bash
cat /etc/os-release    # Muestra información de Ubuntu
ps aux                  # Muestra solo los procesos del contenedor (PID 1 = bash)
exit                    # Sale del contenedor y lo detiene
```

**Posibles mejoras**:
- Agregar `--rm` al comando para eliminar el contenedor al salir y no acumular contenedores detenidos: `docker run --rm -it ubuntu bash`.
- Usar `docker run --rm -it alpine sh` en lugar de ubuntu para una experiencia más rápida (Alpine descarga ~5 MB vs ~80 MB de Ubuntu).
- Dentro del contenedor, ejecutar `ls /proc` y comparar con `ls /proc` en el host para observar el aislamiento proporcionado por los namespaces.

---

## Ejercicio 4: Contenedor Nginx en background
**Solución esperada**:
```bash
docker run -d --name my-nginx -p 8080:80 nginx
docker logs my-nginx     # Muestra los logs de acceso
docker inspect my-nginx   # Devuelve JSON con toda la configuración del contenedor
```

nginx corre en background en el puerto 8080 del host y redirige al puerto 80 del contenedor.

**Posibles mejoras**:
- Usar `nginx:alpine` en lugar de `nginx:latest` para reducir el tamaño de la imagen de ~190 MB a ~42 MB y disminuir la superficie de ataque.
- Agregar reinicio automático con `--restart unless-stopped` para que el contenedor sobreviva a reinicios del daemon Docker.
- Inspeccionar el mapping de puertos con `docker port my-nginx` para verificar rápidamente qué puertos están expuestos.

---

## Ejercicio 5: Tabla comparativa contenedores vs VMs
**Solución esperada**:

| Característica | Contenedor | VM |
|---|---|---|
| Tiempo de arranque | ms | min |
| Tamaño típico | MB | GB |
| Aislamiento | Namespaces/cgroups | Hypervisor |
| Rendimiento I/O | Nativo (~100%) | Con overhead (~90-95%) |
| Portabilidad | Alta (imagen OCI) | Media (depende del hypervisor) |
| SO invitado | Comparte kernel host | Kernel propio |
| Densidad por host | Cientos | Decenas |

**Posibles mejoras**:
- Agregar una columna de "Caso de uso" para clarificar cuándo usar cada tecnología (contenedores para microservicios, VMs para cargas de trabajo que requieren kernel específico o aislamiento fuerte).
- Incluir el concepto de "VM de propósito específico" como Firecracker (usado por AWS Lambda/Fargate) que combina seguridad de VM con velocidad de contenedor.
- Mencionar el overhead de red en VMs vs el modo `--net=host` en contenedores que elimina la virtualización de red.
