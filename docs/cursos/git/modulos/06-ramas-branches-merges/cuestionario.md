---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 06

1. ¿Qué es una rama en Git?
   R: Un puntero móvil a un commit específico.

2. ¿Qué hace `git branch -d` y en qué se diferencia de `-D`?
   R: `-d` elimina solo si la rama ya fue fusionada; `-D` fuerza la eliminación sin fusionar.

3. ¿Cuándo ocurre un merge fast-forward?
   R: Cuando la rama destino no tiene commits nuevos desde que se creó la rama fuente.

4. ¿Qué es un merge 3-way?
   R: Fusiona dos ramas divergentes creando un nuevo commit con dos padres.

5. ¿Qué hace `git merge --no-ff`?
   R: Fuerza un merge 3-way incluso si es posible hacer fast-forward.

6. ¿Cómo se lista una rama remota como `origin/main`?
   R: Con `git branch -a`.

7. ¿Qué información muestra `git branch -vv`?
   R: Muestra cada rama local con su rama de seguimiento upstream y el estado relativo.

8. ¿Cuál es la diferencia entre `git checkout` y `git switch`?
   R: `switch` es específico para cambiar de rama, mientras que `checkout` también restaura archivos.

9. ¿Qué indica el asterisco en `git branch`?
   R: Indica la rama actualmente activa (HEAD).

10. ¿Por qué usar `--no-ff` en equipos?
    R: Para preservar la historia de ramas temáticas y facilitar la revisión.

