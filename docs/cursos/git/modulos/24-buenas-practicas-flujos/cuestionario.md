---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 24

1. ¿Qué tipos de commits define Conventional Commits?
   R: feat, fix, chore, docs, refactor, style, test, ci, perf, build, revert.

2. ¿Qué hace commitlint?
   R: Valida que los mensajes de commit sigan el formato Conventional Commits.

3. ¿Cómo se integra commitlint con husky?
   R: Husky ejecuta commitlint en el hook `commit-msg` antes de permitir el commit.

4. ¿Para qué sirve `.gitattributes`?
   R: Define atributos por patrón de archivo: tipo (text/binary), normalización EOL, filtros.

5. ¿Qué diferencia hay entre `text eol=lf` y `binary` en .gitattributes?
   R: `text eol=lf` normaliza saltos de línea a LF; `binary` desactiva cualquier transformación.

6. ¿Qué hace `git maintenance start`?
   R: Activa tareas periódicas de optimización del repositorio en segundo plano.

7. ¿Cuándo usarías `git gc --aggressive`?
   R: Para optimizar repositorios grandes después de operaciones masivas (rebase, filter-repo).

8. ¿Qué verifica `git fsck`?
   R: La integridad de los objetos de Git (commits, trees, blobs) y detecta dangling objects.

9. ¿Cómo exportas una snapshot del repositorio sin historial?
   R: Con `git archive --format=zip --output=archivo.zip HEAD`.

10. ¿Qué hace `git filter-repo --path secreto.txt --invert-paths`?
    R: Elimina el archivo `secreto.txt` de todo el historial de commits del repositorio.

