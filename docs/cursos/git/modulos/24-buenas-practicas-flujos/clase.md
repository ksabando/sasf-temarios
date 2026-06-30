---
sidebar_label: "Clase"
---

# Buenas Prácticas y Flujos de Trabajo

## Introducción
Adoptar convenciones y herramientas de calidad asegura consistencia en equipos grandes. Este módulo cubre commits convencionales, validación automática, mantenimiento y reescritura segura.

## Conventional Commits
Formato estandarizado para mensajes de commit:

```
tipo(alcance): descripción breve
- feat: nueva funcionalidad
- fix: corrección de bug
- chore: tareas de mantenimiento
- docs: cambios en documentación
- refactor: refactorización sin cambio funcional
```

### Commitizen
Asistente interactivo para escribir commits convencionales:

```bash
npm install -g commitizen
git cz  # Reemplaza git commit
```

### Commitlint + Husky
Validación automática de commits:

```bash
npm install -D @commitlint/cli @commitlint/config-conventional husky
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
```

## .gitattributes
Controla cómo Git maneja archivos:

```
*.txt text eol=lf
*.png binary
*.sh text eol=lf
*.bat text eol=crlf
```

## Mantenimiento del Repositorio

### git maintenance
Auto-optimización programada (Git 2.30+):

```bash
git maintenance start
```

### git gc
Limpieza manual de objetos huérfanos y compresión:

```bash
git gc --aggressive --prune=now
```

### git repack
Reempaqueta objetos para optimizar rendimiento:

```bash
git repack -a -d --depth=250 --window=250
```

### git fsck
Verifica la integridad de la base de datos de objetos:

```bash
git fsck --full
```

## Exportación y Reescritura

### git archive
Exporta una snapshot del repositorio sin historial:

```bash
git archive --format=zip --output=proyecto.zip HEAD
```

### git filter-repo
Reescritura masiva del historial (reemplaza filter-branch):

```bash
# Cambiar autor
git filter-repo --email-callback 'return b"nuevo@email.com"'
# Eliminar archivo de todo el historial
git filter-repo --path archivo-secreto.txt --invert-paths
```
