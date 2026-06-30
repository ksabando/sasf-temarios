---
sidebar_label: "Soluciones"
---

# Soluciones M12 — Servicios, Stacks y Secrets en Swarm

## Ejercicio 1: Crear un servicio replicado
**Solución esperada**:
```bash
docker service create --name web --replicas 3 -p 80:80 nginx:alpine
# 3 réplicas de nginx corriendo en el cluster
docker service ps web   # Ver distribución de réplicas entre nodos
```

**Posibles mejoras**:
- Agregar healthcheck al servicio para que Swarm monitoree la salud y reinicie réplicas unhealthy: `--health-cmd "curl -f http://localhost:80 || exit 1" --health-interval 30s`.
- Configurar constraints de placement para control de distribución: `--constraint node.labels.env==prod` y etiquetar nodos con `docker node update --label-add env=prod`.
- Especificar recursos límites para evitar que una réplica consuma todo el nodo: `--limit-cpu 0.5 --limit-memory 256m --reserve-cpu 0.25 --reserve-memory 128m`.

---

## Ejercicio 2: Escalar un servicio
**Solución esperada**:
```bash
docker service scale web=5
# Ahora 5 réplicas en lugar de 3
docker service ps web   # Ver las 5 réplicas distribuidas
```

**Posibles mejoras**:
- Monitorear el progreso del scaling: `docker service inspect web | jq '.[].Spec.Mode.Replicated.Replicas'` para verificar que el estado deseado coincide con la cantidad actual.
- Usar `docker service update --replicas=5 web` como alternativa a `scale` cuando también querés cambiar otros parámetros en el mismo comando.
- Verificar que los nodos tienen capacidad suficiente antes de escalar con `docker node inspect <node> | jq '.[].Description.Resources'`.

---

## Ejercicio 3: Rolling update
**Solución esperada**:
```bash
docker service update --image nginx:1.25-alpine web --update-delay 10s --update-parallelism 1
# Actualiza réplicas una a una, con 10 segundos entre cada batch
docker service ps web   # Ver réplicas con la nueva imagen
```

**Posibles mejoras**:
- Configurar `--update-failure-action rollback` para que si alguna réplica falla con la nueva versión, Swarm revierta automáticamente a la versión anterior: `docker service update --update-failure-action rollback`.
- Monitorear el progreso del update con `docker service inspect web | jq '.[].UpdateStatus'` que muestra el estado actual del rolling update.
- Probar rollback manual: `docker service rollback web` para volver a la configuración anterior si se detectan problemas pos-deploy.

---

## Ejercicio 4: Deploy de un stack
**Solución esperada**:
```bash
docker stack deploy -c docker-compose.yml mystack
# Crea servicios, redes y secretos definidos en el compose file
docker stack services mystack   # Listar servicios del stack
docker stack ps mystack         # Ver réplicas de cada servicio
```

**Posibles mejoras**:
- Usar `docker stack deploy --prune` para eliminar servicios que ya no están definidos en el compose file pero existen en el stack (limpieza de recursos huérfanos).
- Versionar el compose file en git y usar GitOps: cada cambio en el compose file dispara `docker stack deploy` automáticamente desde CI/CD.
- Separar configuración por entorno: `docker stack deploy -c docker-compose.yml -c docker-compose.prod.yml mystack` para aplicar overrides de producción.

---

## Ejercicio 5: Secrets en Swarm
**Solución esperada**:
```bash
echo "SuperSecretPass123" | docker secret create db_password -
docker service create --name db --secret db_password postgres:16-alpine
# Dentro del contenedor: cat /run/secrets/db_password
```

**Posibles mejoras**:
- Rotar secrets periódicamente: `echo "NewPass456" | docker secret create db_password_v2 -`, luego `docker service update --secret-rm db_password --secret-add db_password_v2 db`.
- Limitar permisos del archivo de secret: `--secret source=db_password,target=/run/secrets/db_password,mode=0400` para que solo el owner (root) pueda leerlo.
- Verificar que los secrets de un servicio no son visibles desde otros servicios o desde `docker inspect` del contenedor.
- Usar `docker secret inspect db_password` para ver metadatos (fecha de creación, ID), pero NO muestra el contenido del secret.
