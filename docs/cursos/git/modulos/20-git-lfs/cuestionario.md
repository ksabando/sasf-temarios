---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 20

1. ¿Qué problema resuelve Git LFS?
   R: Manejar archivos grandes sin inflar el repositorio Git, reemplazándolos con punteros.

2. ¿Cómo se instala Git LFS en un repositorio?
   R: Ejecutando `git lfs install` en el repositorio.

3. ¿Qué comando configura qué archivos debe gestionar LFS?
   R: `git lfs track "<patron>"`.

4. ¿Qué archivo se genera al usar `git lfs track`?
   R: `.gitattributes` en la raíz del repositorio.

5. ¿Cómo se listan los archivos actualmente gestionados por LFS?
   R: `git lfs ls-files`.

6. ¿Qué comando descarga el contenido real de los archivos LFS?
   R: `git lfs pull`.

7. ¿Qué comando migra archivos del historial de Git a LFS?
   R: `git lfs migrate import --include="<patron>" --everything`.

8. ¿Cuál es el límite de almacenamiento LFS en GitHub gratuito?
   R: 2 GB por repositorio.

9. ¿Es recomendable usar LFS para archivos de texto pequeños?
   R: No, LFS debe usarse solo para archivos binarios grandes.

10. ¿Qué alternativa existe a Git LFS?
    R: git-annex, almacenamiento en S3/GCS o Artifactory.

