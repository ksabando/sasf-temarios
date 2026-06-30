---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 12

1. ¿Qué función cumple git stash?
   R: Guarda cambios no confirmados del working directory en una pila temporal para limpiar el directorio de trabajo.

2. ¿Cuál es la diferencia entre git stash pop y git stash apply?
   R: pop aplica los cambios y elimina el stash de la pila; apply aplica los cambios pero conserva el stash.

3. ¿Cómo se lista todos los stashes guardados?
   R: git stash list.

4. ¿Qué flag permite incluir archivos untracked en el stash?
   R: -u o --include-untracked.

5. ¿Qué comando elimina todos los stashes de la pila?
   R: git stash clear.

6. ¿Para qué sirve git stash -p?
   R: Para seleccionar interactivamente qué bloques de cambios guardar en el stash (stash parcial).

7. ¿Qué hace git stash branch nueva-rama?
   R: Crea una nueva rama desde el commit del stash y aplica los cambios automáticamente.

8. ¿Cómo se muestra el diff completo de un stash específico?
   R: git stash show -p stash@{0}.

9. ¿Qué archivos guarda git stash por defecto?
   R: Solo los archivos trackeados (modificados o staged).

10. ¿Por qué es recomendable usar un mensaje descriptivo con git stash push -m?
    R: Para identificar fácilmente cada stash en la lista cuando hay varios guardados.

