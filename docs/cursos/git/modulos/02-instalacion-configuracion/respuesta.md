---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 02

## Respuesta 1
```bash
git --version
# git version 2.45.2.windows.1

where git  # Windows
# C:\Program Files\Git\bin\git.exe
```

## Respuesta 2
```bash
git config --global user.name "Juan Perez"
git config --global user.email "juan@example.com"
git config --list
```
`git config --list` muestra todas las variables configuradas y sus valores.

## Respuesta 3
```bash
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.s "status --short"
git config --global alias.df "diff --word-diff"

# Uso:
git lg
git s
git df
```

## Respuesta 4
```bash
ssh-keygen -t ed25519 -C "juan@example.com"
# Se genera: ~/.ssh/id_ed25519 (privada) y ~/.ssh/id_ed25519.pub (pública)

cat ~/.ssh/id_ed25519.pub
# Copiar el contenido a GitHub: Settings → SSH and GPG keys

ssh -T git@github.com
# Debe responder: "Hi juanperez! You've successfully authenticated..."
```

## Respuesta 5
```bash
git config --global core.autocrlf true
```
En Windows, `core.autocrlf true` convierte LF a CRLF al hacer checkout y CRLF a LF al hacer commit. Esto evita que archivos se marquen como modificados por diferencias en los saltos de línea entre Windows (CRLF) y Unix/Linux/macOS (LF), manteniendo la consistencia en equipos mixtos.

