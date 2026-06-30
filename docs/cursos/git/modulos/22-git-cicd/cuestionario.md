---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 22

1. ¿Qué hace `actions/checkout@v4` en GitHub Actions?
   R: Clona el repositorio en el runner para que los pasos siguientes puedan acceder al código.

2. ¿Para qué sirve `git fetch --depth=1` en CI?
   R: Realiza un clon superficial (solo el último commit) para acelerar la ejecución del pipeline.

3. ¿Cómo se definen las etapas en GitLab CI?
   R: Con la palabra clave `stages:` en `.gitlab-ci.yml`, listando los nombres de etapa.

4. ¿Qué son los artefactos en GitLab CI?
   R: Archivos generados en un job (ej. `dist/`) que se pasan a jobs posteriores o se descargan.

5. ¿Cómo se genera un changelog automático?
   R: Con herramientas como `conventional-changelog` o `semantic-release` que parsean commits convencionales.

6. ¿Qué muestra `git describe --tags`?
   R: El tag más reciente, el número de commits adicionales y el hash abreviado.

7. ¿Cuál es la ventaja de trunk-based development en CI/CD?
   R: Ramas cortas y merges frecuentes a main, con CI ejecutándose continuamente.

8. ¿Cómo se crea un tag automático desde GitHub Actions?
   R: Usando `git tag vX.Y.Z` y `git push origin vX.Y.Z` en un paso del workflow.

9. ¿Qué evento de GitHub Actions se usa para Pull Requests?
   R: `pull_request:` con las ramas objetivo especificadas.

10. ¿Qué es semantic-release?
    R: Una herramienta que automatiza versionado y publicación basada en commits convencionales.

