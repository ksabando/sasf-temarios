---
sidebar_label: "Ejercicio"
---

﻿# Ejercicios -” Docker Swarm

## Ejercicio 1: Inicializar Swarm
Inicia un swarm con 1 manager: docker swarm init.

## Ejercicio 2: Ver nodos
Ejecuta docker node ls. Identifica el rol del nodo.

## Ejercicio 3: Agregar worker (simulado)
Crea un segundo nodo con Docker-in-Docker (dind) y unelo al swarm.

## Ejercicio 4: Drain de nodo
Ejecuta docker node update --availability drain <nodo>.

## Ejercicio 5: Autolock
Inicia un nuevo swarm con --autolock. Verifica con docker swarm unlock-key.
