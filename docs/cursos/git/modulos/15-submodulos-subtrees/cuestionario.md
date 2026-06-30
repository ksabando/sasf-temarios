---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 15

1. ¿Qué es un submódulo en Git?
   R: Es un repositorio Git dentro de otro repositorio, manteniendo su propia historia independiente.

2. ¿Qué archivo se crea al agregar un submódulo?
   R: .gitmodules, que guarda la configuración de cada submódulo (path y url).

3. ¿Cómo se clona un repositorio incluyendo todos sus submódulos?
   R: git clone --recurse-submodules <url>.

4. ¿Cómo se actualiza un submódulo a su último commit remoto?
   R: git submodule update --remote.

5. ¿Qué hace git submodule foreach?
   R: Ejecuta un comando en cada submódulo del proyecto.

6. ¿Cuál es la principal diferencia entre un submódulo y un subtree?
   R: El submódulo referencia un commit externo (requiere fetch); el subtree copia el código dentro del repositorio.

7. ¿Qué comando agrega un repositorio externo usando subtree?
   R: git subtree add --prefix=<dir> <url> <rama> --squash.

8. ¿Qué ventaja tiene subtree sobre submódulo?
   R: No requiere configuración externa, el código está directamente en el repositorio y es modificable sin pasos extras.

9. ¿Qué flag de git subtree permite integrar la historia completa del repositorio externo?
   R: --squash comprime la historia; sin él se integra toda la historia del repositorio externo.

10. Menciona una alternativa a submódulos y subtrees.
    R: Monorepos (un solo repo), o usar un gestor de paquetes como npm, pip, o Cargo workspaces.

