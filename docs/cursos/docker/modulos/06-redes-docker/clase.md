---
sidebar_label: "Clase"
---

﻿# Clase 06 -” Redes en Docker

## 1. Tipos de Red
- **bridge:** Red por defecto, aislada en el host
- **host:** Comparte la red del host (sin aislamiento)
- **none:** Sin red
- **overlay:** Multi-host (Swarm)
- **macvlan:** Asigna MAC address propia

## 2. Bridge Network
docker network create --driver bridge mynet
docker run --network mynet --name app1 nginx
docker run --network mynet --name app2 nginx
app1 puede resolver app2 por nombre DNS

## 3. Publicar Puertos
docker run -p 8080:80 nginx    # host:container
docker run -P nginx            # puerto aleatorio

## 4. DNS Interno
Docker tiene DNS interno. Los contenedores en la misma red se resuelven por nombre.
No funciona en la red bridge por defecto.

## 5. Host Network
docker run --network host nginx
Usa la IP del host, sin NAT. Solo Linux.

## 6. Macvlan
docker network create -d macvlan --subnet=192.168.1.0/24 --gateway=192.168.1.1 -o parent=eth0 macvlan-net
