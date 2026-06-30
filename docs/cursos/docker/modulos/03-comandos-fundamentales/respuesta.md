---
sidebar_label: "Soluciones"
---

# Soluciones M03 — Comandos Fundamentales

## Ejercicio 1: Contenedor Nginx en background
**Solución esperada**:
```bash
docker run -d --name web1 -p 8080:80 nginx:alpine
# Acceder a http://localhost:8080 para ver la página de bienvenida de nginx
```

**Posibles mejoras**:
- Agregar `--restart unless-stopped` para que el contenedor se reinicie automáticamente si el daemon Docker se reinicia o el proceso nginx falla.
- Usar `--memory=256m --cpus=0.5` para limitar recursos y evitar que el contenedor consuma todo el host en caso de fuga de memoria.
- Verificar que el puerto está escuchando correctamente con `curl -I http://localhost:8080` en lugar de abrir el navegador, lo cual es más scripteable y rápido.

---

## Ejercicio 2: Logs en tiempo real
**Solución esperada**:
```bash
docker logs -f web1
# Cada request HTTP a nginx se muestra en tiempo real
```
Los logs muestran cada request HTTP al servidor nginx con IP del cliente, timestamp, método HTTP, path, y código de respuesta.

**Posibles mejoras**:
- Usar `docker logs --tail 50 -f web1` para ver las últimas 50 líneas y luego seguir en tiempo real, evitando volcar logs históricos extensos.
- Agregar `--timestamps` (`-t`) para ver exactamente cuándo ocurrió cada evento: `docker logs -t --tail 20 web1`.
- Configurar logging driver con rotación en `/etc/docker/daemon.json` para evitar que el archivo de logs de nginx crezca indefinidamente.

---

## Ejercicio 3: Modificar contenido dentro del contenedor
**Solución esperada**:
```bash
docker exec -it web1 sh
echo "<h1>Test</h1>" > /usr/share/nginx/html/test.html
exit
# Acceder a http://localhost:8080/test.html
```

**Posibles mejoras**:
- En lugar de `docker exec`, usar un bind mount para desarrollo y modificar archivos desde el host: `docker run -d -p 8080:80 -v $(pwd)/html:/usr/share/nginx/html nginx:alpine`. Esto permite editar con el IDE local y ver cambios en tiempo real sin entrar al contenedor.
- Recordar que las modificaciones hechas con `docker exec` se pierden al eliminar el contenedor (capa de escritura). Para cambios permanentes, deben ir en la imagen o en un volumen.
- Usar `docker cp` para copiar archivos desde/hacia el contenedor sin abrir una shell interactiva: `echo "<h1>Test</h1>" > test.html && docker cp test.html web1:/usr/share/nginx/html/`.

---

## Ejercicio 4: Inspeccionar red del contenedor
**Solución esperada**:
```bash
docker inspect web1 --format '{{.NetworkSettings.IPAddress}}'
# 172.17.0.2
```
El contenedor obtiene una IP de la red bridge default (rango 172.17.0.0/16).

**Posibles mejoras**:
- Usar `docker inspect web1 | jq '.[0].NetworkSettings'` para ver el JSON completo y entender la estructura de redes, gateways, y MAC address de cada interfaz.
- Crear una red personalizada con `docker network create --subnet=10.0.0.0/24 mynet` y conectar el contenedor a ella para tener control sobre el direccionamiento IP.
- Usar `docker exec web1 ip addr` para ver las interfaces de red desde dentro del contenedor y comparar con la vista desde el host.

---

## Ejercicio 5: Monitoreo de recursos
**Solución esperada**:
```bash
docker stats
# Muestra métricas en tiempo real: CPU %, MEM USAGE / LIMIT, MEM %, NET I/O, BLOCK I/O
# Ctrl+C para salir
```

**Posibles mejoras**:
- Usar `docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"` para una instantánea única en lugar de streaming continuo, ideal para scripts de monitoreo.
- Configurar Prometheus + cAdvisor para monitoreo histórico y alertas, ya que `docker stats` solo muestra datos en tiempo real sin persistencia.
- Agregar `--all` para incluir contenedores detenidos en el reporte y detectar aquellos que están consumiendo recursos sin estar activos.

---

## Ejercicio 6: Limpieza del contenedor
**Solución esperada**:
```bash
docker stop web1
docker rm web1
# O en un solo comando:
docker rm -f web1
```

**Posibles mejoras**:
- Usar `docker stop --time=30 web1` para dar más tiempo de grace period si la aplicación necesita cerrar conexiones largas (por defecto son 10 segundos).
- Verificar que no quedan volúmenes huérfanos con `docker volume ls` y limpiarlos con `docker volume prune` para liberar espacio en disco.
- Para entornos de desarrollo, usar siempre `docker run --rm` al iniciar contenedores efímeros para que se limpien automáticamente al detenerse y no acumular basura.
