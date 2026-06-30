---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 04

1. ¿Cuáles son los cuatro estados del ciclo de vida de un archivo en Git?
   R: Untracked, Staged, Modified, Unmodified.

2. ¿Qué patrón usarías en .gitignore para ignorar todos los archivos .log?
   R: `*.log`.

3. ¿Por qué se considera peligroso usar `git commit --amend` en commits ya subidos?
   R: Porque modifica el historial, y si otros colaboradores ya tienen ese commit, habrá conflictos al sincronizar.

4. ¿Cuál es la diferencia entre staged y unstaged?
   R: Staged significa que el cambio está en el index listo para commit; unstaged significa que el working directory tiene cambios no preparados.

5. ¿Qué hace `git add -p`?
   R: Permite seleccionar interactivamente qué fragmentos (hunks) de un archivo agregar al staging, en lugar de agregar el archivo completo.

6. ¿Qué es un archivo .gitkeep?
   R: Un archivo vacío que se coloca en un directorio vacío para forzar a Git a trackearlo, ya que Git no trackea directorios vacíos.

7. ¿Qué comando muestra el resumen de commits agrupados por autor?
   R: `git shortlog`.

8. ¿Qué flag de `git commit` muestra el diff en el editor?
   R: `-v` (verbose).

9. ¿Cuál es la longitud recomendada para el asunto de un commit?
   R: 50 caracteres o menos.

10. ¿Cómo se ignora un archivo específico dentro de un directorio ignorado?
    R: Usando la negación: `!archivo_importante.log`.

