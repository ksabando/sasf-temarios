---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 02

## Ejercicio 1: Verificar instalación
Ejecuta `git --version` y verifica la versión instalada. Asegúrate de que sea 2.20 o superior. Comprueba también la ruta del ejecutable.

## Ejercicio 2: Configurar nombre y email
Configura tu nombre de usuario y correo electrónico a nivel global con `git config --global`. Luego verifica la configuración con `git config --list`.

## Ejercicio 3: Crear alias útiles
Configura los siguientes alias globales:
- `lg` = `log --oneline --graph --all --decorate`
- `s` = `status --short`
- `df` = `diff --word-diff`
Prueba cada alias en un repositorio existente.

## Ejercicio 4: Generar clave SSH y agregarla a GitHub
Genera un par de claves SSH con `ssh-keygen -t ed25519`. Agrega la clave pública a tu cuenta de GitHub. Verifica la conexión con `ssh -T git@github.com`.

## Ejercicio 5: Configurar autocrlf en Windows
Configura `core.autocrlf` como `true` a nivel global. Explica en un comentario dentro del archivo de configuración global (~/.gitconfig) por qué esta configuración es importante en equipos mixtos Windows/Mac.
