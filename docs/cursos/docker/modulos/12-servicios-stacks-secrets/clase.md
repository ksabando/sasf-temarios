---
sidebar_label: "Clase"
---

﻿# Clase 12 -” Servicios, Stacks y Secrets en Swarm

## 1. Servicios en Swarm
docker service create --name web --replicas 3 -p 80:80 nginx:alpine
docker service ls
docker service ps web
docker service scale web=5
docker service update --image nginx:1.25 web --update-delay 10s
docker service rollback web

## 2. Modos de Servicio
- replicated: N replicas (default)
- global: 1 replica por nodo

## 3. Stacks
Deploy desde compose file:
docker stack deploy -c docker-compose.yml mystack
docker stack ls
docker stack ps mystack
docker stack rm mystack

## 4. Secrets en Swarm
echo "mi_password_segura" | docker secret create db_password -
docker service create --secret db_password --name db postgres:16
docker secret ls
