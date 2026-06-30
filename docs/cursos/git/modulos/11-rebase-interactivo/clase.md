---
sidebar_label: "Clase"
---

# Rebase Interactivo

## git rebase vs git merge

Ambas comandos integran cambios de una rama a otra, pero con diferencias clave:

- **git merge**: Crea un commit de fusión (merge commit) que preserva la historia completa de ambas ramas. La historia muestra explícitamente el punto donde las ramas convergieron.
- **git rebase**: Reescribe la historia moviendo los commits de una rama al final de otra, creando una historia lineal y limpia. No genera un merge commit.

```
git merge feature      # crea merge commit
git rebase main        # reescribe commits de feature sobre main
```

## git rebase -i (interactivo)

El flag `-i` abre un editor con una lista de commits para modificar:

```bash
git rebase -i HEAD~N   # últimos N commits
```

Cada commit tiene una operación asignada:

| Operación | Descripción |
|-----------|-------------|
| **pick** | Usa el commit tal cual |
| **reword** | Cambia el mensaje del commit |
| **edit** | Detiene el rebase para modificar el contenido |
| **squash** | Fusiona el commit con el anterior, combinando mensajes |
| **fixup** | Fusiona el commit con el anterior, descartando su mensaje |
| **drop** | Elimina el commit |

## Control del rebase

```bash
git rebase --continue   # continuar tras resolver conflicto
git rebase --skip       # saltar commit actual
git rebase --abort      # cancelar y volver al estado original
```

## squash y fixup

**squash**: fusiona varios commits en uno solo, conservando el mensaje para editarlo. Útil para limpiar commits pequeños antes de compartir.

```
pick a1b2c3 Primer commit
squash d4e5f6 Segundo commit  → se fusionan, se edita mensaje
```

**fixup**: igual que squash pero descarta el mensaje del commit secundario. Ideal para arreglos rápidos.

```
pick a1b2c3 Primer commit
fixup d4e5f6 Corrección menor  → se fusiona, mensaje del primero gana
```

## Reordenar commits

En el editor de rebase -i, simplemente se mueven las líneas de orden:

```
pick a1b2c3 Commit B
pick d4e5f6 Commit A
```

Al guardar, el orden histórico cambia.

## reword y edit

- **reword**: Permite cambiar solo el mensaje del commit. El editor se abre para escribir el nuevo mensaje.
- **edit**: Detiene el rebase para que se puedan hacer cambios en el contenido (git add + git commit --amend).

## git rebase --onto

Mueve una serie de commits de una rama base a otra diferente:

```bash
git rebase --onto main feature~3 feature
```

Esto toma los últimos 3 commits de `feature` y los coloca sobre `main`, descartando la base anterior. Muy útil para extraer cambios específicos.

## Buenas prácticas

- No hacer rebase en commits que ya están en el repositorio remoto y otros colaboradores usan.
- Preferir merge en ramas compartidas, rebase en ramas locales.
- Usar rebase -i antes de abrir un Pull Request para limpiar la historia.
