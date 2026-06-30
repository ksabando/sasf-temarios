---
sidebar_label: "Clase"
---

# Git LFS (Large File Storage)

## ¿Qué es Git LFS?

Git LFS reemplaza archivos grandes (binarios, imágenes, audios) con punteros ligeros en el repositorio, mientras almacena el contenido real en un servidor remoto externo.

## Instalación

```bash
git lfs install     # Configura Git LFS globalmente
```

## Comandos Principales

### Trackear Patrones de Archivos

```bash
git lfs track "*.psd"
git lfs track "*.zip" "*.tar.gz"
```

Esto modifica el archivo `.gitattributes` automáticamente.

### Ver Archivos Trackeados

```bash
git lfs ls-files                 # Archivos actualmente gestionados por LFS
git lfs status                   # Estado de archivos LFS pendientes
```

### Descargar Archivos LFS

```bash
git lfs pull                     # Descarga archivos LFS del remoto
git lfs fetch --all              # Descarga todos los archivos LFS
```

## Migrar Historial Existente a LFS

Para migrar archivos que ya están en el historial de Git:

```bash
git lfs migrate import --include="*.psd" --everything
```

Esto reescribe el historial reemplazando los archivos coincidentes con punteros LFS.

## Límites por Plataforma

| Plataforma | Límite |
|------------|--------|
| GitHub     | 2 GB por repo (gratuito) |
| GitLab     | Depende del plan |
| Bitbucket  | 2 GB por repo |

## Alternativas

- **git-annex**: Similar pero más flexible (manejo de archivos sin centralizar).
- **S3 / GCS**: Almacenamiento directo en la nube con scripts propios.
- **Artifactory**: Gestión de artefactos binarios con integración Git.

## Buenas Prácticas

- Trackear solo lo necesario (no usar LFS para archivos pequeños de texto).
- Incluir `.gitattributes` en el repositorio.
- Usar `git lfs migrate` con cuidado (reescribe historial).
- Monitorear el uso de ancho de banda y almacenamiento remoto.
