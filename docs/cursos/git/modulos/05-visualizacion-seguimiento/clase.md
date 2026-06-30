---
sidebar_label: "Clase"
---

# Clase 05 - Visualización y Seguimiento

## 1. git log - Formato Personalizado

```bash
git log --oneline                     # Hash corto + mensaje
git log --oneline --graph             # Con gráfico de ramas
git log --oneline --graph --all       # Todas las ramas
git log --oneline --decorate          # Muestra etiquetas (tags, HEAD)
git log --oneline --all --graph --decorate  # Combinación completa
```

### Opciones de Filtrado

```bash
git log --since="2 weeks ago"         # Desde hace 2 semanas
git log --until="2024-06-01"          # Hasta fecha específica
git log --author="Juan"               # Por autor
git log --committer="Maria"           # Por committer
git log --grep="fix:"                 # Busca en mensajes de commit
git log -S "console.log"              # Pickaxe: busca cambios que introducen/eliminan el string
git log -G "regex"                    # Pickaxe con regex
```

## 2. git show

Muestra detalles de un objeto (commit, tag, tree):
```bash
git show hash                     # Muestra commit completo
git show HEAD                     # Último commit
git show hash:archivo.txt         # Contenido del archivo en ese commit
git show --stat hash              # Solo estadísticas
```

## 3. git blame

Muestra quién modificó cada línea de un archivo y en qué commit:
```bash
git blame archivo.txt
git blame -L 10,20 archivo.txt    # Solo líneas 10-20
git blame -w archivo.txt          # Ignora cambios whitespace
```

## 4. git describe

Crea un nombre legible para un commit basado en tags:
```bash
git describe                      # v1.2.3-5-gabc1234
git describe --tags               # Usa tags ligeros
git describe --abbrev=0           # Solo el tag más cercano
```

**Formato de salida**: `tag-commits-g-hash`
- tag: tag más cercano
- commits: cantidad de commits desde el tag
- g: "git"
- hash: hash corto del commit

## 5. git reflog

Registro de referencias (operaciones locales):
```bash
git reflog                    # Historial de movimientos de HEAD
git reflog --all              # Todas las referencias
git reflog show HEAD          # Equivalente a git reflog
```

El reflog registra cada operación que mueve HEAD, útil para recuperar commits "perdidos".

## 6. git diff entre Rangos

```bash
git diff main..feature        # Cambios en feature desde que divergió de main
git diff main...feature       # Cambios exclusivos de feature (no en main)
git diff --stat hash1..hash2  # Estadísticas de archivos cambiados
```

## 7. Formato Personalizado en git log

```bash
git log --pretty=format:"%h - %an, %ar : %s"
# %h = hash corto
# %an = author name
# %ae = author email
# %ar = fecha relativa
# %s  = subject (mensaje)
# %d  = decoraciones
```

## 8. Resumen

| Comando | Propósito |
|---|---|
| `git log --graph` | Visualizar ramas |
| `git log -S "texto"` | Buscar cambios que introducen texto |
| `git blame` | Quién modificó cada línea |
| `git describe` | Nombre legible para commit |
| `git reflog` | Operaciones locales de HEAD |
| `git show` | Detalles de cualquier objeto |
