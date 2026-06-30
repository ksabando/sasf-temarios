---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 11

1. ¿Cuál es la principal diferencia entre git merge y git rebase?
   R: merge crea un commit de fusión preservando la historia completa; rebase reescribe la historia de forma lineal sin merge commit.

2. ¿Qué comando inicia un rebase interactivo de los últimos 3 commits?
   R: git rebase -i HEAD~3.

3. ¿Qué operación de rebase -i fusiona commits combinando sus mensajes?
   R: squash.

4. ¿Qué operación fusiona commits pero descarta el mensaje del commit secundario?
   R: fixup.

5. ¿Qué flag permite cancelar un rebase en curso?
   R: git rebase --abort.

6. ¿Para qué sirve git rebase --onto?
   R: Para mover commits de una rama base a otra diferente, descartando la base original.

7. ¿Qué operación de rebase -i permite cambiar solo el mensaje del commit?
   R: reword.

8. ¿Es seguro hacer rebase en commits que ya están en el repositorio remoto compartido?
   R: No, porque reescribe la historia y puede causar conflictos a otros colaboradores.

9. ¿Qué operación detiene el rebase para modificar el contenido del commit?
   R: edit.

10. ¿Cómo se elimina un commit durante un rebase interactivo?
    R: Cambiando "pick" por "drop" en la línea del commit, o simplemente borrando la línea.

