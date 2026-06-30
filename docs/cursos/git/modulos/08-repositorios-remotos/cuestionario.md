---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 08

1. ¿Qué es un remoto en Git?
   R: Una versión del repositorio alojada en otro lugar, identificada por un nombre (ej. `origin`).

2. ¿Qué muestra `git remote -v`?
   R: Las URLs de fetch y push de cada remoto configurado.

3. ¿Cuál es la diferencia entre `git fetch` y `git pull`?
   R: `fetch` solo descarga objetos; `pull` hace fetch + merge automático.

4. ¿Qué hace `git push -u origin main`?
   R: Sube la rama `main` y establece la relación de seguimiento upstream.

5. ¿Cuál es la diferencia entre `--force` y `--force-with-lease`?
   R: `--force` sobrescribe sin verificar; `--force-with-lease` verifica que no haya cambios desconocidos.

6. ¿Qué puerto usa el protocolo SSH?
   R: Puerto 22.

7. ¿Qué hace `git remote prune origin`?
   R: Elimina referencias locales a ramas remotas que ya no existen en el servidor.

8. ¿Qué comando muestra detalles de un remoto como ramas tracked?
   R: `git remote show origin`.

9. ¿Qué es `origin`?
   R: El nombre convencional del repositorio remoto principal.

10. ¿Por qué es preferible HTTPS sobre Git (git://) para escritura?
    R: HTTPS requiere autenticación; git:// es solo lectura sin autenticación.

