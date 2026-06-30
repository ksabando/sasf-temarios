---
sidebar_label: "Clase"
---

# Deshacer Cambios

## Introducción

Git ofrece múltiples mecanismos para deshacer cambios en diferentes estados del ciclo de vida de un archivo. Es crucial elegir el comando correcto según el nivel de riesgo.

## git restore

Comando moderno para descartar cambios en el working directory:

```bash
git restore archivo.txt        # descarta cambios no staged
git restore --staged archivo.txt   # unstage (saca del área de staging)
git restore --source=HEAD~1 archivo.txt  # restaurar versión de un commit anterior
```

## git reset

Mueve el puntero HEAD y opcionalmente modifica el staging y el working directory:

| Modo | HEAD | Staging | Working Dir |
|------|------|---------|-------------|
| `--soft` | ✅ mueve | ✅ mantiene | ✅ mantiene |
| `--mixed` (default) | ✅ mueve | ❌ limpia | ✅ mantiene |
| `--hard` | ✅ mueve | ❌ limpia | ❌ limpia |

```bash
git reset --soft HEAD~1     # deshace commit, cambios quedan staged
git reset --mixed HEAD~1    # deshace commit, cambios quedan sin stage
git reset --hard HEAD~1     # deshace commit y descarta cambios (¡peligroso!)
```

## git revert

Crea un nuevo commit que deshace los cambios de un commit anterior. Es seguro porque no reescribe historia:

```bash
git revert HEAD             # deshace el último commit
git revert a1b2c3d          # deshace un commit específico
```

## git checkout -- (legacy)

Forma antigua de descartar cambios (reemplazada por `git restore`):

```bash
git checkout -- archivo.txt
```

## git clean -fd

Elimina archivos y directorios no trackeados:

```bash
git clean -fd               # -f: force, -d: directorios
git clean -n                # dry-run: muestra lo que se eliminaría
```

## git reflog — Diario de operaciones

`git reflog` registra todos los movimientos de HEAD (commits, resets, rebases, etc.). Es el "seguro de vida" para recuperar commits "perdidos":

```bash
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~1
# e4f5g6h HEAD@{1}: commit: mensaje importante
```

## Recuperación con reflog

```bash
git reflog                     # encontrar el hash perdido
git checkout -b rama-recov e4f5g6h  # crear rama desde el commit perdido
# o:
git reset --hard e4f5g6h       # restaurar HEAD directamente
```

## Resumen de uso

| Situación | Comando |
|-----------|---------|
| Descartar cambios en working dir | `git restore archivo` |
| Unstage un archivo | `git restore --staged archivo` |
| Deshacer último commit (manteniendo cambios) | `git reset --soft HEAD~1` |
| Deshacer commit y cambios staged | `git reset --mixed HEAD~1` |
| Deshacer todo (irreversible) | `git reset --hard HEAD~1` |
| Deshacer commit público | `git revert HEAD` |
| Eliminar untracked | `git clean -fd` |
| Recuperar commit perdido | `git reflog` + `git reset --hard hash` |
