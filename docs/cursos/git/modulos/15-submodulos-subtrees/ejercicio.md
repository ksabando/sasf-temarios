---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 15

## Ejercicio 1: Agregar un submódulo
En un repositorio local, agrega un submódulo apuntando a un repositorio público de GitHub (ej: https://github.com/octocat/Hello-World.git). Haz commit y verifica que se cree el archivo `.gitmodules`.

## Ejercicio 2: Clonar con submódulos
Crea un segundo clon del repositorio del ejercicio anterior usando `git clone --recurse-submodules`. Verifica que el contenido del submódulo esté presente.

## Ejercicio 3: Actualizar submódulo
En el repositorio del ejercicio 1, actualiza el submódulo a su último commit usando `git submodule update --remote`.

## Ejercicio 4: Agregar una librería con subtree
Usa `git subtree add` para agregar el repositorio de Hello-World en una carpeta `lib/hello`. Verifica que los archivos se integren sin archivo de configuración externo.

## Ejercicio 5: Comparar submodule vs subtree
Documenta en un archivo las diferencias que observas entre el resultado del ejercicio 1 (submódulo) y el ejercicio 4 (subtree) en términos de archivos creados, contenido visible y forma de actualización.
