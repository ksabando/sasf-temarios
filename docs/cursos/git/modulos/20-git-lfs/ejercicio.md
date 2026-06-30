---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 20

## Ejercicio 1: Instalar y Configurar Git LFS
Instala Git LFS en tu sistema y ejecuta `git lfs install`. Verifica que esté habilitado.

## Ejercicio 2: Trackear Patrón de Archivos
Crea un repositorio, configura Git LFS para trackear archivos `*.psd` y `*.zip`. Verifica que `.gitattributes` se haya generado correctamente.

## Ejercicio 3: Agregar y Pushear Archivos LFS
Crea un archivo `.psd` simulado (archivo de texto normal), agrégalo al repositorio y haz push. Verifica con `git lfs ls-files` que esté siendo gestionado por LFS.

## Ejercicio 4: Clonar Repositorio con LFS
Clona un repositorio que contenga archivos LFS y ejecuta `git lfs pull` para descargar el contenido real.

## Ejercicio 5: migrar Historial a LFS
Crea un repositorio con varios commits que incluyan un archivo `.iso` simulado. Usa `git lfs migrate import` para migrar ese archivo a LFS retroactivamente.
