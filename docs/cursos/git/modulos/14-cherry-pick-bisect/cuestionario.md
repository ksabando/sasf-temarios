---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 14

1. ¿Qué hace git cherry-pick?
   R: Aplica un commit específico de otra rama al branch actual.

2. ¿Cómo se cancela un cherry-pick con conflictos?
   R: git cherry-pick --abort.

3. ¿Qué comando realiza una búsqueda binaria para encontrar el commit que introdujo un bug?
   R: git bisect.

4. ¿Cómo se marca el commit actual como bueno en un bisect?
   R: git bisect good.

5. ¿Qué hace git bisect run?
   R: Automatiza la búsqueda ejecutando un script (ej: tests) en cada paso.

6. ¿Para qué sirve git log -S "cadena"?
   R: Busca commits que agregaron o eliminaron la cadena especificada (pickaxe).

7. ¿Qué flag de git blame ignora cambios de whitespace?
   R: -w.

8. ¿Cómo se especifica un rango de líneas en git blame?
   R: git blame -L inicio,fin archivo.txt.

9. ¿Cuándo es útil git cherry-pick en lugar de merge?
   R: Cuando solo se necesita un commit específico de otra rama, no toda la rama.

10. ¿Qué comando finaliza una sesión de git bisect?
    R: git bisect reset.

