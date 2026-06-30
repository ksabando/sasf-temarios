---
sidebar_label: "Ejercicio"
---

# Ejercicios — Módulo 01

## Ejercicio 1: Verificar instalación
Ejecuta docker --version y docker info. Anota las versiones del cliente y servidor.

## Ejercicio 2: Hello World
Ejecuta docker run hello-world. Explica qué sucede paso a paso.

## Ejercicio 3: Contenedor interactivo
Ejecuta docker run -it ubuntu bash. Dentro del contenedor:
- Ejecuta cat /etc/os-release
- Ejecuta ps aux
- Ejecuta exit

## Ejercicio 4: Contenedor en background
Ejecuta docker run -d --name my-nginx -p 8080:80 nginx:alpine.
- Accede a http://localhost:8080
- Ejecuta docker logs my-nginx
- Ejecuta docker inspect my-nginx

## Ejercicio 5: Diferencias con VM
Crea una tabla comparativa de 5 diferencias entre contenedores y máquinas virtuales. Incluye: tiempo de arranque, tamaño, aislamiento, rendimiento y portabilidad.
