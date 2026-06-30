---
sidebar_label: "Ejercicio"
---

# Ejercicios — Redes en Docker

## Ejercicio 1: Bridge por defecto
Crea 2 contenedores en la red bridge default. Intenta ping por IP y por nombre.

## Ejercicio 2: Red personalizada
Crea red "app-net". Conecta 2 contenedores. Haz ping por nombre de contenedor.

## Ejercicio 3: Publicar puertos
Ejecuta nginx con -p 8080:80. Verifica en navegador.

## Ejercicio 4: Conectar contenedor en ejecución
Crea un contenedor sin red. Conéctalo a "app-net" con docker network connect.

## Ejercicio 5: Aislar redes
Crea 2 redes diferentes. Pon 1 contenedor en cada una. Verifica que no pueden comunicarse.
