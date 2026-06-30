---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 01

## Respuesta 1
`git --version` muestra algo como `git version 2.45.x`. `git help` abre el manual o muestra una lista de comandos comunes. Si aparece sin errores, Git está instalado correctamente.

## Respuesta 2
```bash
mkdir proyecto-git
cd proyecto-git
git init
ls -la .git
```
El directorio `.git` contiene: HEAD, config, description, hooks, info, objects, refs.

## Respuesta 3
```bash
echo "Mi primer repositorio" > README.md
git add README.md
git commit -m "Primer commit"
```
`git log` debe mostrar el commit con hash SHA-1 asociado.

## Respuesta 4
- Untracked: `git status` muestra "Untracked files"
- Staged: `git add` → "Changes to be committed"
- Modified: modificar el archivo → "Changes not staged for commit"
- Committed: `git commit` → "nothing to commit, working tree clean"

## Respuesta 5
| Característica | Git | SVN |
|---|---|---|
| Arquitectura | Distribuido | Centralizado |
| Branching | Ligero (ramas como punteros) | Pesado (copia de directorios) |
| Trabajo offline | Completo | No permite commits sin servidor |
| Staging area | Sí (index) | No |
| Velocidad | Muy rápida (local) | Depende de red |
| Checksum | SHA-1 en todo | Sin checksum |

## Respuesta 6
```
.git/
```

