---
sidebar_label: "Soluciones"
---

# Soluciones M11 — Docker Swarm

## Ejercicio 1: Inicializar Swarm
**Solución esperada**:
```bash
docker swarm init
# Swarm initialized: current node (abc123def456) is now a manager.
# To add a worker to this swarm, run:
# docker swarm join --token SWMTKN-1-xxx... 192.168.1.10:2377
```

El comando muestra el token y la IP para que los workers se unan al cluster.

**Posibles mejoras**:
- Especificar `--advertise-addr` explícitamente si el host tiene múltiples interfaces: `docker swarm init --advertise-addr 192.168.1.10` para asegurar que los workers usen la IP correcta.
- Habilitar autolock para producción: `docker swarm init --autolock` y guardar la unlock key en un gestor de secretos. Sin autolock, el Raft log no está cifrado en disco.
- Verificar el estado del Swarm después de init: `docker info | grep -A 10 Swarm` y `docker node ls` para confirmar que el nodo manager está activo.

---

## Ejercicio 2: Verificar líder y managers
**Solución esperada**:
```bash
docker node ls
# ID        HOSTNAME   STATUS   AVAILABILITY   MANAGER STATUS
# abc *     node-1     Ready    Active         Leader
```
El nodo aparece como Leader (marcado con `*` si es el nodo actual). Los followers aparecen como Reachable.

**Posibles mejoras**:
- Inspeccionar el estado Raft: `docker system info --format '{{.Swarm.ControlAvailable}}'` devuelve `true` si el nodo actual es manager.
- Configurar monitoreo de la cantidad de managers: `docker node ls --format '{{.ManagerStatus}}' | grep -c 'Leader\|Reachable'` para verificar que hay quorum.
- Simular falla de un manager para entender el comportamiento de failover: detener un manager follower y verificar que el cluster sigue operativo con los managers restantes.

---

## Ejercicio 3: Agregar workers con dind
**Solución esperada**:
```bash
# Crear contenedor worker
docker run -d --privileged --name worker1 docker:dind
# Obtener token de worker
docker swarm join-token worker
# Ejecutar join en el worker
docker exec worker1 docker swarm join --token SWMTKN-1-xxx... <manager-ip>:2377
```

**Posibles mejoras**:
- Usar un script de automatización que cree múltiples workers y los una al cluster, verificando que cada uno aparece en `docker node ls` con estado Ready.
- Asegurar conectividad de red entre dind containers: crear una red Docker y conectar tanto el manager como los workers a ella para que se comuniquen.
- Para desarrollo local avanzado, usar `kind` (Kubernetes in Docker) o `k3d` para simular clusters multi-nodo con menor complejidad que dind.

---

## Ejercicio 4: Drain de un nodo
**Solución esperada**:
```bash
docker node update --availability drain <node-id>
```
Drain mueve todas las tareas del nodo a otros nodos disponibles (con availability `active`). El nodo queda en estado `Drain` y no recibe nuevas tareas.

**Posibles mejoras**:
- Verificar la migración de tareas: `docker service ps <service>` muestra las tareas migrándose del nodo drenado a otros nodos con estado `Shutdown` en el original y `Running` en el destino.
- Después del mantenimiento, reactivar el nodo con `docker node update --availability active <node-id>` y verificar que comienza a recibir nuevas tareas (aunque las ya movidas no regresan automáticamente — requiere rebalance manual o rerun del servicio).
- Usar drain para rolling updates de infraestructura: drenar cada nodo uno por uno, actualizar el sistema operativo o Docker, activarlo de nuevo, y pasar al siguiente nodo.

---

## Ejercicio 5: Autolock
**Solución esperada**:
```bash
docker swarm init --autolock
# Muestra la unlock key (guardarla de forma segura)
# Después de reiniciar un manager:
docker swarm unlock
# Ingresar la unlock key para desbloquear el Raft log
```
Con autolock, al reiniciar un manager se requiere `docker swarm unlock` para que el manager participe en Raft.

**Posibles mejoras**:
- Rotar la unlock key periódicamente: `docker swarm unlock-key --rotate` genera una nueva clave y re-cifra el Raft log. La nueva clave debe guardarse en el vault.
- Verificar el estado de autolock: `docker system info | grep Auto-Lock` muestra `true` si está habilitado.
- Implementar un proceso de recuperación documentado: dónde está la unlock key, quién tiene acceso, y cómo desbloquear managers después de un reinicio planificado o inesperado.
