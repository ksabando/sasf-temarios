---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 13

1. ¿Qué comando moderno descarta cambios en el working directory?
   R: git restore archivo.txt.

2. ¿Cómo se quita un archivo del área de staging sin perder los cambios?
   R: git restore --staged archivo.txt.

3. ¿Qué hace git reset --soft HEAD~1?
   R: Mueve HEAD un commit atrás, pero mantiene los cambios en el área de staging.

4. ¿Cuál es la diferencia entre git reset --mixed y git reset --hard?
   R: --mixed limpia el staging pero mantiene los cambios en working dir; --hard limpia ambos y descarta todo.

5. ¿Por qué git revert es considerado seguro para ramas compartidas?
   R: Porque crea un nuevo commit que deshace el cambio, sin reescribir la historia existente.

6. ¿Qué comando elimina archivos y directorios no trackeados?
   R: git clean -fd.

7. ¿Para qué sirve git reflog?
   R: Es un diario de todas las operaciones de HEAD que permite recuperar commits "perdidos".

8. ¿Cómo se recupera un commit perdido después de un git reset --hard?
   R: Usando git reflog para encontrar el hash y luego git reset --hard <hash> o creando una rama.

9. ¿Qué flag de git clean muestra lo que se eliminaría sin ejecutarlo?
   R: git clean -n (dry-run).

10. ¿Cuál es la forma antigua (legacy) de descartar cambios en un archivo?
    R: git checkout -- archivo.txt.

