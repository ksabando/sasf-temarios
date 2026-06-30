---
sidebar_label: "Clase"
---

﻿# Clase 11 -” Docker Swarm

## 1. Que es Docker Swarm?
Orquestador nativo de Docker para clusters de contenedores.

## 2. Conceptos Clave
- Manager node: Controla el cluster (estado, scheduling)
- Worker node: Ejecuta contenedores
- Raft consensus: Algoritmo de consenso para managers
- Service: Declaracion de estado deseado

## 3. Inicializar Swarm
`
# Manager
docker swarm init --advertise-addr 192.168.1.10

# Worker
docker swarm join --token SWMTKN-1-... 192.168.1.10:2377
`

## 4. Nodos
docker node ls                  # listar nodos
docker node promote node1       # worker â†’ manager
docker node demote manager1     # manager â†’ worker
docker node update --availability drain node1

## 5. Lock del Swarm
docker swarm init --autolock
docker swarm unlock-key

## 6. Alta Disponibilidad
- 3 o 5 managers para tolerancia a fallos
- Quorum: (N/2)+1 managers deben estar activos
- Con 3 managers, tolera 1 fallo
