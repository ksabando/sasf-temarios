---
sidebar_label: "Clase"
---

# Clase 01 - Introducción al Control de Versiones y Git

## 1. ¿Qué es el Control de Versiones?

El control de versiones es un sistema que registra los cambios realizados en uno o varios archivos a lo largo del tiempo, permitiendo recuperar versiones específicas más adelante.

### Sistemas Locales
- Base de datos simple que guarda parches en el disco
- Ejemplo: RCS (Revision Control System)
- Limitación: solo un desarrollador, sin colaboración

### Sistemas Centralizados (CVCS)
- Servidor central con todos los archivos versionados
- Ejemplos: CVS, Subversion (SVN), Perforce, TFS
- Ventaja: control granular de permisos
- Desventaja: punto único de falla

### Sistemas Distribuidos (DVCS)
- Cada clon es una copia completa del repositorio
- Ejemplos: Git, Mercurial, Darcs
- Ventaja: trabajo offline, múltiples copias de respaldo

## 2. Historia de Git

- 2002-2005: Proyecto BitKeeper para kernel Linux
- Abril 2005: BitKeeper revoca licencia gratuita
- Linus Torvalds crea Git en 10 días (abril 2005)
- Objetivos: rapidez, diseño simple, branching no lineal, distribuido, manejo de grandes proyectos
- Julio 2005: Junio Hamano toma el mantenimiento

## 3. Git vs SVN/TFS/Mercurial

| Característica | Git | SVN/TFS | Mercurial |
|---|---|---|---|
| Arquitectura | Distribuido | Centralizado | Distribuido |
| Offline | Completo | Limitado | Completo |
| Branching | Ligero, económico | Pesado, directorios | Ligero |
| Checksum | SHA-1 | No | SHA-1 |
| Staging area | Sí | No | No |

## 4. Arquitectura Distribuida

- Cada repositorio local tiene toda la historia
- Operaciones locales: commit, diff, log, merge (sin red)
- Solo push/pull/fetch requieren red
- Múltiples remotos posibles (origin, upstream, etc.)

## 5. Los Tres Estados de Git

```
Working Directory  →  Staging Area  →  Repositorio (.git)
   (modified)         (staged)          (committed)
```

1. **Working Directory**: Árbol de trabajo, archivos modificados
2. **Staging Area (Index)**: Área de preparación para el próximo commit
3. **Repositorio (.git)**: Base de datos de objetos con toda la historia

## 6. Objetos SHA-1

Git almacena todo mediante un hash SHA-1 (40 caracteres hex).

| Tipo | Descripción |
|---|---|
| **Blob** | Contenido de un archivo |
| **Tree** | Directorio (contiene blobs y otros trees) |
| **Commit** | Apunta a un tree, autor, mensaje, padres |
| **Tag** | Etiqueta a un commit específico |

## 7. Flujo Básico

```
git init          # Inicializar repositorio
git add archivo   # Agregar al staging
git commit -m "msg"  # Confirmar cambios
```

## 8. Checksum y Seguridad

- Todo se verifica mediante checksum SHA-1
- Imposible modificar un objeto sin que Git lo detecte
- Git solo agrega datos (casi nunca los elimina)

## 9. Ventajas de Git

- Velocidad excepcional en operaciones locales
- Branching y merging económicos
- Trabajo sin conexión a internet
- Integridad de datos garantizada
- Comunidad masiva y ecosistema

## 10. Ecosistema Git

| Plataforma | Descripción |
|---|---|
| **GitHub** | Mayor plataforma, PRs, Actions, Issues |
| **GitLab** | Open source, CI/CD integrado, self-hosted |
| **Bitbucket** | Integración con Jira, equipos pequeños |
