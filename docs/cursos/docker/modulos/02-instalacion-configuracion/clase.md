---
sidebar_label: "Clase"
---

﻿# Clase 02 -” Instalacion y Configuracion de Docker

## 1. Instalacion por Sistema Operativo

### Windows (Docker Desktop)
- Requisito: WSL 2 (Windows Subsystem for Linux)
- Descargar de docker.com/products/docker-desktop
- Habilitar WSL 2 backend en settings

### macOS
- Docker Desktop (interfaz grafica)
- Alternativa: Colima (open-source, ligero)

### Linux (Ubuntu/Debian)
sudo apt update
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker

## 2. Verificacion
docker --version
docker info
docker run hello-world

## 3. Configuracion del Daemon
Archivo: /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "storage-driver": "overlay2"
}

## 4. Directorios Importantes
- /var/lib/docker/ -” datos de Docker (imagenes, contenedores, volumenes)
- ~/.docker/ -” configuracion del usuario
- /etc/docker/ -” configuracion del daemon

## 5. Docker Context
docker context permite gestionar multiples entornos Docker.
