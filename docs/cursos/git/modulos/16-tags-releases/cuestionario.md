---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 16

1. ¿Qué comando lista todos los tags del repositorio?
   R: `git tag`.

2. ¿Cuál es la diferencia entre un lightweight tag y un annotated tag?
   R: Un lightweight tag es solo un puntero al commit; un annotated tag almacena metadatos (autor, fecha, mensaje) y puede firmarse.

3. ¿Qué bandera se usa para crear un annotated tag?
   R: `-a` (ej: `git tag -a v1.0 -m "mensaje"`).

4. ¿Cómo se publica un solo tag en el repositorio remoto?
   R: `git push origin <nombre-del-tag>`.

5. ¿Cómo se publican todos los tags locales al remoto?
   R: `git push --tags`.

6. ¿Qué comando elimina un tag local?
   R: `git tag -d <nombre>`.

7. ¿Cómo se elimina un tag del repositorio remoto?
   R: `git push origin --delete <nombre>`.

8. ¿Qué significan MAJOR, MINOR y PATCH en Semver?
   R: MAJOR = cambios incompatibles, MINOR = nuevas funcionalidades compatibles, PATCH = correcciones de bugs.

9. ¿Qué comando crea un tag firmado con GPG?
   R: `git tag -s v1.0 -m "mensaje"`.

10. ¿Dónde se pueden adjuntar archivos binarios a un tag en GitHub?
    R: En la sección Releases, al crear una Release asociada a un tag.

