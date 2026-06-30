---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 05

1. ¿Qué hace `git blame archivo.txt`?
   R: Muestra para cada línea del archivo el commit, autor y fecha de la última modificación.

2. ¿Qué hace el flag `-S` (pickaxe) en `git log`?
   R: Busca commits que introduzcan o eliminen una cadena de texto específica en el código.

3. ¿Cuál es la diferencia entre `git reflog` y `git log`?
   R: `git log` muestra el historial de commits; `git reflog` muestra el historial de movimientos de HEAD (incluyendo resets, checkouts, rebases), incluso commits que ya no están en el historial.

4. ¿Qué formato tiene la salida de `git describe`?
   R: `tag-commits-g-hash`, por ejemplo `v1.0-3-gabc1234` (tag más cercano, commits después del tag, prefijo g, hash corto).

5. ¿Qué flag de `git log` muestra una representación gráfica de las ramas?
   R: `--graph`.

6. ¿Cómo se filtran commits por autor en git log?
   R: `git log --author="Nombre"`.

7. ¿Qué hace `git log --all`?
   R: Muestra commits de todas las ramas, no solo de la actual.

8. ¿Cómo se muestran commits de los últimos 7 días?
   R: `git log --since="7 days ago"`.

9. ¿Qué significa la salida `v2.0-5-g1a2b3c4` de `git describe`?
   R: El tag v2.0 es el más cercano, hay 5 commits desde ese tag, y el hash corto del commit actual es 1a2b3c4.

10. ¿Cómo se usa `git log --grep`?
    R: `git log --grep="patrón"` busca commits cuyo mensaje coincida con el patrón.

