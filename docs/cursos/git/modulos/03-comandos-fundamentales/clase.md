---
sidebar_label: "Clase"
---

# Clase 03 - Comandos Fundamentales

## 1. git init y git clone

### git init
Inicializa un repositorio Git vacío en el directorio actual:
```bash
git init                    # Crea .git en el directorio actual
git init nombre-proyecto    # Crea carpeta + .git dentro
```

### git clone
Copia un repositorio remoto completo (con toda su historia):
```bash
git clone https://github.com/usuario/repo.git
git clone git@github.com:usuario/repo.git   # Via SSH
git clone --depth 1 repo.git                # Clonado superficial
```

## 2. git status

Muestra el estado actual del working directory y staging area:
```bash
git status        # Formato detallado
git status -s     # Formato corto (--short)
git status -b     # Muestra la rama además
```

## 3. git add

Agrega cambios al staging area (index):
```bash
git add archivo.txt        # Archivo específico
git add .                  # Todos los archivos del directorio actual
git add *.js               # Patrón glob
git add -p                 # Agregar por partes (interactivo)
git add -A                 # Todos los cambios (incluye eliminaciones)
```

## 4. git commit

Registra los cambios del staging en el historial:
```bash
git commit -m "Mensaje descriptivo"
git commit -a -m "Mensaje"         # Add + commit en un paso (solo archivos trackeados)
git commit --amend                 # Corrige el último commit
git commit --amend -m "Nuevo msg"  # Corrige mensaje del último commit
```

## 5. git log

Visualiza el historial de commits:
```bash
git log                     # Historial completo
git log --oneline           # Un commit por línea
git log --oneline --graph   # Con gráfico de ramas
git log --oneline --all     # Todas las ramas
git log -3                  # Últimos 3 commits
git log --author="nombre"   # Filtrar por autor
git log --since="2024-01-01" # Desde fecha
git log --grep="fix"        # Buscar en mensajes
git log --stat              # Estadísticas de archivos
```

## 6. git diff

Muestra diferencias entre versiones:
```bash
git diff                    # Working vs Staging
git diff --staged           # Staging vs HEAD (último commit)
git diff HEAD               # Working vs HEAD
git diff hash1 hash2        # Entre dos commits
git diff --word-diff        # Diferencias por palabra
```

## 7. git rm y git mv

### git rm
Elimina archivos del repositorio:
```bash
git rm archivo.txt          # Elimina del working tree y staging
git rm --cached archivo.txt # Solo del staging (mantiene el archivo local)
git rm -r carpeta/          # Eliminar directorio recursivamente
```

### git mv
Mueve o renombra archivos:
```bash
git mv antiguo.txt nuevo.txt   # Renombrar
git mv archivo.txt carpeta/    # Mover a subdirectorio
```

## 8. Flags Importantes

| Flag | Comando | Propósito |
|---|---|---|
| `-m` | commit | Mensaje de commit en línea |
| `-a` | commit | Add automático de archivos trackeados |
| `--amend` | commit | Modificar último commit |
| `--stat` | log | Muestra archivos modificados |
| `-p` | add | Agregar interactivamente por partes |
| `-s` | status | Formato corto |
| `--cached` | rm | Eliminar solo del staging |
