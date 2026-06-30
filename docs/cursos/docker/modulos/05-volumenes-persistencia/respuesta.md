---
sidebar_label: "Soluciones"
---

# Soluciones M05 — Volúmenes y Persistencia

## Ejercicio 1: Crear y usar un volumen
**Solución esperada**:
```bash
docker volume create myapp-data
docker run --rm -it -v myapp-data:/data alpine sh -c "echo 'Hola' > /data/test.txt"
```

El archivo `test.txt` con "Hola" se persiste en el volumen `myapp-data`.

**Posibles mejoras**:
- Verificar el contenido del volumen desde el host: `docker run --rm -it -v myapp-data:/data alpine cat /data/test.txt` en lugar de inspeccionar el archivo desde el filesystem del host.
- Usar `--mount type=volume,source=myapp-data,target=/data` en lugar de `-v` para sintaxis más explícita y auto-documentada, especialmente en scripts.
- Agregar labels al volumen para identificarlo: `docker volume create --label app=myapp --label env=dev myapp-data`, y luego filtrar con `docker volume ls --filter label=app=myapp`.

---

## Ejercicio 2: Verificar persistencia
**Solución esperada**:
```bash
docker run --rm -it -v myapp-data:/data alpine cat /data/test.txt
# Muestra "Hola"
```
El dato persiste aunque el contenedor original ya no existe.

**Posibles mejoras**:
- Inspeccionar los metadatos del volumen con `docker volume inspect myapp-data` para ver el mountpoint real en el host, la fecha de creación, y el driver utilizado.
- Verificar el espacio usado por el volumen con `docker system df -v | grep myapp-data` para monitorear el crecimiento del volumen.
- Configurar una política de backup del volumen usando un script de cron o systemd timer que ejecute periódicamente un contenedor de backup sin detener los servicios.

---

## Ejercicio 3: Bind mount para desarrollo
**Solución esperada**:
```bash
docker run -d -p 8080:80 -v C:\html:/usr/share/nginx/html nginx:alpine
# Cambiar index.html local y refrescar navegador para ver cambios en tiempo real
```

**Posibles mejoras**:
- Usar path relativo en lugar de absoluto para mejor portabilidad: `-v ${PWD}/html:/usr/share/nginx/html:ro` — el `:ro` (read-only) evita que el contenedor modifique los archivos del host.
- Para desarrollo con WSL 2, almacenar los archivos dentro del filesystem de WSL 2 (`/home/user/project`) en lugar de `/mnt/c/` para obtener un rendimiento de I/O mucho mejor (evitar el overhead del protocolo 9p).
- Agregar un container de `nginx` con `nginx -s reload` en un loop para desarrollo con hot reload real, o usar herramientas como `browser-sync` para el frontend.

---

## Ejercicio 4: Compartir volumen entre contenedores
**Solución esperada**:
```bash
docker run -d --name cont1 -v shared-data:/data nginx:alpine
docker run --rm -it --name cont2 -v shared-data:/data alpine sh
# Ambos contenedores ven los mismos archivos en /data
```

**Posibles mejoras**:
- Usar `docker run --volumes-from cont1` en lugar de especificar el mismo volumen manualmente — esto monta todos los volúmenes de `cont1` en el nuevo contenedor, útil para patrones sidecar donde un contenedor de logging o backup accede a los datos del principal.
- Verificar la consistencia de los datos entre contenedores creando un archivo en uno y leyéndolo en el otro, validando que no hay problemas de race condition.
- Para producción, considerar si necesitás realmente volumen compartido entre contenedores en lugar de usar un servicio de red (API, base de datos) como canal de comunicación — el filesystem compartido como mecanismo de IPC es un antipatrón.

---

## Ejercicio 5: Backup de un volumen
**Solución esperada**:
```bash
docker run --rm \
  -v myapp-data:/source \
  -v C:\backup:/backup \
  alpine tar czf /backup/backup.tar.gz -C /source .
```

El backup se guarda en `C:\backup\backup.tar.gz`.

**Posibles mejoras**:
- Usar `:ro` en el montaje del volumen de origen para evitar modificaciones accidentales durante el backup: `-v myapp-data:/source:ro`.
- Agregar timestamp al nombre del backup para versionado: `tar czf /backup/backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /source .`
- Para bases de datos, ejecutar primero un dump lógico: `docker exec postgres pg_dump -U user db > backup.sql` y luego respaldar el archivo de dump, garantizando consistencia a nivel de aplicación y no solo de filesystem.
- Automatizar backups con un script y cron/systemd timer, con retención (eliminar backups mayores a 7 días) y verificación periódica de restore.
