---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 17

1. ¿Dónde se almacenan los hooks de Git?
   R: En la carpeta `.git/hooks/` del repositorio.

2. ¿Qué hook se ejecuta antes de crear un commit?
   R: `pre-commit`.

3. ¿Qué hook se usa para validar el formato del mensaje del commit?
   R: `commit-msg`.

4. ¿Qué hook se ejecuta antes de hacer push?
   R: `pre-push`.

5. ¿Qué herramienta moderna gestiona hooks desde package.json?
   R: Husky.

6. ¿Qué hace lint-staged?
   R: Ejecuta linters solo sobre los archivos staged.

7. ¿Cómo se comparten hooks con el equipo?
   R: Creando una carpeta `.githooks/` y configurando `git config core.hooksPath .githooks`.

8. ¿Es necesario que los hooks sean ejecutables?
   R: Sí, deben tener permisos de ejecución (`chmod +x`).

9. ¿Qué hook permite pre-llenar el mensaje del commit automáticamente?
   R: `prepare-commit-msg`.

10. ¿Qué comando agrega un hook con Husky?
    R: `npx husky add .husky/pre-commit "comando"`.

