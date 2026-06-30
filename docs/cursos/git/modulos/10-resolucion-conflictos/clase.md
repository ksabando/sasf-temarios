---
sidebar_label: "Clase"
---

# Clase - Módulo 10: Resolución de Conflictos

## ¿Qué causa un conflicto?

Un conflicto ocurre cuando dos ramas modifican la misma línea del mismo archivo, o cuando un archivo es eliminado en una rama y modificado en otra.

## Marcadores de conflicto

Cuando Git no puede fusionar automáticamente, inserta marcadores en el archivo:

```
<<<<<<< HEAD
código de la rama actual
=======
código de la rama que se fusiona
>>>>>>> feature/rama
```

## Resolución manual

1. Editar el archivo para quedarse con el código deseado.
2. Eliminar los marcadores (`<<<<<<<`, `=======`, `>>>>>>>`).
3. `git add <archivo>`
4. `git commit` (o `git merge --continue`)

## git mergetool

Herramientas visuales para resolver conflictos:

```bash
git mergetool
```

Configuración de herramientas comunes:
- **VS Code**: `git config merge.tool vscode`
- **kdiff3**: `git config merge.tool kdiff3`
- **vimdiff**: `git config merge.tool vimdiff`

## git merge --abort

Cancela el merge en curso y restaura el estado anterior al merge.

## Estrategias de merge

- **ours**: Usa siempre la versión de la rama actual.
- **theirs**: Usa siempre la versión de la rama entrante.
- **recursive**: Estrategia por defecto para merges 3-way.

```bash
git merge -X ours feature/rama
git merge -X theirs feature/rama
```

## git checkout --ours / --theirs

Para archivos en conflicto, escoge directamente una versión:

```bash
git checkout --ours archivo.txt
git checkout --theirs archivo.txt
git add archivo.txt
```

## git rerere (Reuse Recorded Resolution)

Git recuerda cómo resolviste un conflicto y lo reaplica automáticamente:

```bash
git config --global rerere.enabled true
```

Útil para largos rebases o merges repetitivos.

## Conflictos en rebase

Durante `git rebase`, los conflictos se resuelven igual, pero se continúa con:

```bash
git rebase --continue   # después de resolver
git rebase --skip       # saltar este commit
git rebase --abort      # cancelar el rebase
```

## Prevención de conflictos

- Comunicación en el equipo sobre qué archivos se modifican.
- Pull frecuente (`git pull --rebase`).
- Ramas de vida corta.
- Archivos pequeños y bien definidos.
