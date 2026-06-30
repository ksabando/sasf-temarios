---
sidebar_label: "Clase"
---

# Estrategias Avanzadas de Merge

## Introducción
Git ofrece múltiples estrategias de merge para diferentes escenarios. Comprender cuándo usar cada una es clave para mantener un historial limpio.

## Estrategias de Merge

### Recursive (`-s recursive`)
Estrategia por defecto para fusionar dos ramas. Opera realizando un merge recursivo detectando renombres y movimientos.

```bash
git merge -s recursive feature-branch
```

### Opciones de recursive: `-X theirs` y `-X ours`
Controlan qué versión prevalece en conflictos:
- `-X theirs`: ante conflicto, usa los cambios de la rama entrante.
- `-X ours`: ante conflicto, conserva los cambios de la rama actual.

```bash
git merge -s recursive -X theirs feature-branch
git merge -s recursive -X ours feature-branch
```

### Ours (`-s ours`)
Mantiene el contenido de la rama actual pero registra la fusión como si se hubiera integrado la otra. Útil para "absorber" una rama sin incorporar sus cambios.

```bash
git merge -s ours feature-branch
```

### Octopus (`-s octopus`)
Permite fusionar más de dos ramas simultáneamente. Ideal para integraciones rápidas sin conflictos.

```bash
git merge -s octopus branch-a branch-b branch-c
```

### Subtree (`-s subtree`)
Fusiona un proyecto externo dentro de un subdirectorio con prefijo específico.

```bash
git merge -s subtree external-project/main
```

## Ort Strategy (Nuevo default desde Git 2.33)
Ort (Ostensibly Recursive Traversal) reemplazó a recursive como estrategia por defecto. Es más rápido, maneja mejor renombres y consume menos memoria.

## Merge sin Historial ni Commit

### Squash merge
Fusiona cambios como un solo commit sin historial de la rama origen.

```bash
git merge --squash feature-branch
git commit -m "feat: integrar feature en un commit"
```

### No-commit merge
Fusiona pero no crea el commit automáticamente, permitiendo modificar antes de confirmar.

```bash
git merge --no-commit feature-branch
```

## Conflictos Complejos

### Archivos binarios
No se pueden fusionar automáticamente. Git marca conflicto y se debe elegir una versión manualmente.

```bash
git checkout --ours archivo.bin
git checkout --theirs archivo.bin
```

### Renombres
Cuando un archivo se renombra en una rama y se modifica en otra, Git intenta detectar el rename threshold. Si falla, se puede ajustar con `merge.renameLimit`.

## git merge-file
Fusiona archivos individuales sin necesidad de ramas. Útil para scripts y automatización.

```bash
git merge-file archivo_base archivo_local archivo_remoto
```
