---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 10

1. ¿Qué causa un conflicto de merge?
   R: Dos ramas modifican la misma línea del mismo archivo, o una elimina y otra modifica.

2. ¿Qué significan los marcadores `<<<<<<<` y `>>>>>>>`?
   R: Delimitan las versiones en conflicto: `<<<<<<< HEAD` (actual) y `>>>>>>> rama` (entrante).

3. ¿Qué hace `git merge --abort`?
   R: Cancela el merge en curso y restaura el estado anterior.

4. ¿Qué hace `git mergetool`?
   R: Abre una herramienta visual configurada para resolver conflictos.

5. ¿Cuál es la diferencia entre `git checkout --ours` y `--theirs`?
   R: `--ours` usa la versión de la rama actual; `--theirs` usa la de la rama entrante.

6. ¿Qué hace `git rebase --skip`?
   R: Omite el commit actual durante un rebase con conflicto.

7. ¿Qué es git rerere?
   R: Reuse Recorded Resolution: Git recuerda resoluciones de conflictos y las reaplica.

8. ¿Cómo se activa rerere?
   R: Con `git config --global rerere.enabled true`.

9. ¿Qué estrategia de merge usa `-X ours`?
   R: En conflictos, siempre escoge la versión de la rama actual.

10. ¿Cómo prevenir conflictos frecuentes?
    R: Ramas cortas, comunicación en equipo, pulls frecuentes con rebase.

