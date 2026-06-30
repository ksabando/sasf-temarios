---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 03

1. ¿Cuál es la diferencia entre `git init` y `git clone`?
   R: `git init` crea un repositorio vacío local; `git clone` copia un repositorio remoto existente con todo su historial.

2. ¿Qué hace `git add` exactamente?
   R: Agrega los cambios actuales del working directory al staging area (index), preparándolos para el próximo commit.

3. ¿Cómo se puede revertir un archivo del staging sin perder los cambios?
   R: `git restore --staged archivo.txt` o `git reset HEAD archivo.txt`.

4. ¿Qué diferencia hay entre `git diff` y `git status`?
   R: `git status` muestra qué archivos cambiaron y su estado; `git diff` muestra el contenido exacto de las diferencias.

5. ¿Qué hace `git commit -a`?
   R: Agrega automáticamente al staging todos los archivos trackeados (no los untracked) y realiza el commit en un solo paso.

6. ¿Qué flag de `git log` muestra una representación gráfica de las ramas?
   R: `--graph`.

7. ¿Cómo se elimina un archivo del repositorio pero se mantiene en el disco local?
   R: `git rm --cached archivo.txt`.

8. ¿Qué efecto tiene `git commit --amend`?
   R: Modifica el último commit (su mensaje o contenido), creando un nuevo hash SHA-1.

9. ¿Qué muestra `git diff --staged`?
   R: La diferencia entre el staging area y el último commit (HEAD).

10. ¿Cómo renombrar un archivo en Git?
    R: `git mv nombre_actual nombre_nuevo`.

