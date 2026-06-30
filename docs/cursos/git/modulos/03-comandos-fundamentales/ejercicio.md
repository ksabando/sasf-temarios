---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 03

## Ejercicio 1: Clonar un repositorio
Clona un repositorio público desde GitHub (por ejemplo, `https://github.com/octocat/Hello-World`). Verifica que se haya creado la carpeta y que `git log` muestre el historial.

## Ejercicio 2: Inicializar y agregar archivos
Crea un repositorio nuevo, agrega 3 archivos (`index.html`, `style.css`, `app.js`) y realiza el primer commit. Luego agrega más contenido a cada archivo y haz un segundo commit.

## Ejercicio 3: Usar git diff
Modifica un archivo existente sin agregarlo al staging. Ejecuta `git diff` para ver los cambios. Luego agrega al staging y ejecuta `git diff --staged` para ver la diferencia preparada.

## Ejercicio 4: Eliminar y renombrar archivos
Usa `git rm` para eliminar un archivo del repositorio y `git mv` para renombrar otro. Verifica los cambios con `git status` y haz commit.

## Ejercicio 5: Explorar git log
Crea al menos 5 commits y luego explora las siguientes variantes de `git log`:
- `git log --oneline`
- `git log --oneline --graph --all`
- `git log --stat`
- `git log -2`

## Ejercicio 6: Enmendar el último commit
Realiza un commit con un mensaje incorrecto. Usa `git commit --amend -m "Mensaje corregido"` para cambiar el mensaje. Verifica el cambio con `git log`.
