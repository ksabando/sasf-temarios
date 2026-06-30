---
sidebar_label: "Ejercicio"
---

﻿# Ejercicios -” Volumenes y Persistencia

## Ejercicio 1: Volume basico
Crea un volumen "myapp-data". Monta en un contenedor alpine y crea un archivo /data/test.txt.

## Ejercicio 2: Persistencia
Elimina el contenedor. Crea uno nuevo montando el mismo volumen. Verifica que test.txt existe.

## Ejercicio 3: Bind mount
Crea una carpeta html/ local. Montala como bind mount en nginx. Modifica HTML local, verifica cambios.

## Ejercicio 4: Compartir datos
Crea 2 contenedores que compartan el mismo volumen. Desde cada uno escribe un archivo.

## Ejercicio 5: Backup
Crea un backup del volumen myapp-data usando un contenedor temporal.
