---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 01

## Ejercicio 1: Verificar instalación
Ejecuta `git --version` y `git help`. Verifica que Git esté correctamente instalado y que el manual de ayuda se muestre sin errores.

## Ejercicio 2: Inicializar un repositorio
Crea una carpeta llamada `proyecto-git`, ejecuta `git init` y verifica que se haya creado el subdirectorio `.git`. Explora su contenido con `ls -la`.

## Ejercicio 3: Primer commit
Crea un archivo `README.md` con el texto "Mi primer repositorio", agrégalo al staging con `git add` y realiza un commit con `git commit -m "Primer commit"`.

## Ejercicio 4: Los tres estados
Crea un archivo `notas.txt`, modifícalo varias veces y en cada paso ejecuta `git status` para observar cómo cambia entre los estados: untracked → staged → modified → committed.

## Ejercicio 5: Comparar Git vs SVN
Investiga y completa una tabla comparativa con al menos 5 características donde Git y SVN se diferencian (arquitectura, branching, offline, staging, velocidad).

## Ejercicio 6: Explorar el directorio .git
Dentro del repositorio creado, navega al directorio `.git` y enumera su contenido. Identifica al menos 3 subdirectorios internos (objects, refs, HEAD, config) y explica brevemente su propósito.
