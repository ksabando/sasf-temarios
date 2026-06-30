---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 21

1. ¿Cuál es la estrategia de merge por defecto antes de Git 2.33?
   R: Recursive (`-s recursive`).

2. ¿Qué hace `git merge -X theirs`?
   R: En conflictos, acepta automáticamente los cambios de la rama que se fusiona.

3. ¿Cuándo usarías `git merge -s ours`?
   R: Cuando quieres registrar la fusión pero conservar íntegro el contenido de la rama actual.

4. ¿Cuántas ramas soporta `git merge -s octopus`?
   R: Tres o más ramas simultáneamente (no soporta conflictos).

5. ¿Qué ventaja tiene la estrategia `ort` sobre `recursive`?
   R: Es más rápida, consume menos memoria y maneja mejor renombres.

6. ¿Qué diferencia hay entre `git merge --squash` y un merge normal?
   R: Squash merge no trae el historial de la rama origen; crea un único commit con todos los cambios.

7. ¿Cómo se resuelve un conflicto en un archivo binario?
   R: No se puede fusionar automáticamente; se elige `--ours` o `--theirs` manualmente.

8. ¿Para qué sirve `git merge --no-commit`?
   R: Fusiona los cambios en el working directory pero no crea el commit, permitiendo modificaciones previas.

9. ¿Qué hace `git merge-file`?
   R: Fusiona tres versiones de un archivo individual sin necesidad de ramas.

10. ¿Cómo maneja Git los conflictos por renombre?
    R: Git intenta detectar automáticamente el rename; si falla, se marca como conflicto rename/rename o rename/delete.

