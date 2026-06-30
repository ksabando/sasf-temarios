---
sidebar_label: "Ejercicio"
---

﻿# Ejercicios -” Instalacion y Configuracion

## Ejercicio 1: Instalacion
Instala Docker Desktop en tu sistema operativo. Verifica con docker --version.

## Ejercicio 2: Sin sudo (Linux)
Agrega tu usuario al grupo docker: sudo usermod -aG docker $USER.

## Ejercicio 3: Configurar daemon.json
Crea daemon.json con log-driver json-file, max-size 10m, storage-driver overlay2.

## Ejercicio 4: Docker context
Crea un contexto llamado "dev" que apunte a tcp://192.168.1.100:2375.

## Ejercicio 5: WSL 2 (Windows)
Verifica que WSL 2 esta configurado: wsl -l -v.
