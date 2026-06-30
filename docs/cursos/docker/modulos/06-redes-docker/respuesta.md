---
sidebar_label: "Soluciones"
---

# Soluciones M06 — Redes en Docker

## Ejercicio 1: DNS en red bridge default
**Solución esperada**:
En la red bridge default, la comunicación por nombre NO funciona (no hay DNS interno). Solo funciona por IP:
```bash
docker run -d --name web1 nginx:alpine
docker run --rm -it --name web2 alpine ping web1  # FALLA
docker exec web2 ping <IP_de_web1>                # FUNCIONA
```

**Posibles mejoras**:
- Crear una red bridge personalizada y re-ejecutar ambos contenedores en ella para verificar que el DNS funciona: `docker network create mynet && docker run -d --name web1 --network mynet nginx:alpine`
- Usar `docker exec web1 cat /etc/resolv.conf` para ver la configuración DNS que Docker inyecta en el contenedor (nameserver 127.0.0.11 en redes personalizadas).
- Para debugging DNS, usar `docker run --rm -it --network mynet nicolaka/netshoot dig web1` para ver exactamente la resolución DNS y la respuesta.

---

## Ejercicio 2: Comunicación en red personalizada
**Solución esperada**:
```bash
docker network create app-net
docker run -d --name app1 --network app-net nginx:alpine
docker run --rm -it --name app2 --network app-net alpine ping app1
# ping app2 funciona por DNS en red personalizada
```

**Posibles mejoras**:
- Agregar `--network-alias api` a varios contenedores y verificar que el DNS devuelve múltiples IPs con round-robin, implementando balanceo de carga básico.
- Usar `--dns` y `--dns-search` para configurar servers DNS específicos y dominios de búsqueda: `--dns 8.8.8.8 --dns-search mycompany.local`.
- Verificar la tabla de enrutamiento dentro del contenedor: `docker exec app1 ip route` para entender cómo se configura el gateway y las rutas.

---

## Ejercicio 3: Mapeo de puertos
**Solución esperada**:
```bash
docker run -d --name web -p 8080:80 nginx:alpine
# Navegador en http://localhost:8080 muestra nginx
```

**Posibles mejoras**:
- Publicar en una interfaz específica en lugar de todas: `-p 127.0.0.1:8080:80` para que nginx solo sea accesible desde localhost, no desde la red externa.
- Usar `docker port web` para verificar rápidamente los mapeos activos sin parsear `docker ps`.
- Inspeccionar las reglas de iptables generadas: `sudo iptables -t nat -L DOCKER -n` para ver exactamente la regla DNAT que redirige 8080 → 80 del contenedor.

---

## Ejercicio 4: Conectar contenedor en ejecución a otra red
**Solución esperada**:
```bash
docker network connect app-net web1
# web1 ahora tiene interfaces en bridge default y en app-net
docker exec web1 ip addr  # Muestra ambas interfaces
```

**Posibles mejoras**:
- Conectar un contenedor de debugging (`nicolaka/netshoot`) a la misma red para inspeccionar tráfico con `tcpdump` sin afectar el contenedor original.
- Usar `docker network disconnect` para remover una red de un contenedor en ejecución si ya no necesita acceso a ella.
- Verificar que el contenedor puede alcanzar recursos en ambas redes simultáneamente (ej. hacer ping a contenedores en ambas redes).

---

## Ejercicio 5: Aislamiento entre redes
**Solución esperada**:
Contenedores en redes diferentes no pueden comunicarse entre sí a menos que haya un contenedor con interfaces en ambas redes actuando como router:
```bash
docker network create net-a
docker network create net-b
docker run -d --name app --network net-a nginx:alpine
docker run --rm -it --network net-b alpine ping app  # NO funciona
# Conectar contenedor a ambas redes para actuar como bridge:
docker network connect net-b app
# Ahora app tiene conectividad en ambas redes
```

**Posibles mejoras**:
- Usar `--internal` al crear la red de base de datos para que los contenedores en ella no tengan acceso a internet: `docker network create --internal db-net`.
- Implementar el patrón de segmentación: app en `frontend-net` (con acceso a internet) y `backend-net` (solo comunicación interna), base de datos solo en `backend-net`.
- Verificar aislamiento con `docker exec cont1 ping <IP_cont2>` y `docker exec cont1 wget -O- http://google.com` para confirmar que no hay conectividad entre redes distintas ni hacia internet en redes internal.
