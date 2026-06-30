---
sidebar_label: "Clase"
---

# Cherry-pick y Bisect

## git cherry-pick

Aplica un commit específico de otra rama al branch actual:

```bash
git cherry-pick a1b2c3d           # aplica un commit específico
git cherry-pick A..B              # aplica todos los commits entre A (excluido) y B
git cherry-pick --continue        # continuar tras resolver conflicto
git cherry-pick --abort           # cancelar cherry-pick
```

Útil para:
- Llevar un hotfix de `main` a una rama de release
- Extraer una funcionalidad específica sin fusionar toda una rama

## cherry-pick con conflictos

Cuando hay conflictos, Git detiene el proceso:
1. Resolver conflictos manualmente
2. `git add` los archivos resueltos
3. `git cherry-pick --continue`
4. O `git cherry-pick --abort` para cancelar

## git bisect

Búsqueda binaria para encontrar el commit que introdujo un bug:

```bash
git bisect start
git bisect bad                    # commit actual tiene el bug
git bisect good v1.0              # versión donde funcionaba
# Git marca un commit intermedio; probar y marcar:
git bisect good                   # si funciona
git bisect bad                    # si tiene el bug
# Repetir hasta encontrar el commit culpable
git bisect reset                  # finalizar y volver al estado original
```

### git bisect run

Automatiza la búsqueda con un script:

```bash
git bisect start HEAD v1.0
git bisect run npm test           # ejecuta tests automáticamente
```

## git log -S (pickaxe)

Busca commits que introdujeron o eliminaron una cadena específica:

```bash
git log -S "funcionBuscada" --oneline
git log -S "password" -- *.js    # buscar solo en archivos JS
```

## git blame avanzado

Muestra quién modificó cada línea y en qué commit:

```bash
git blame archivo.txt
git blame -w archivo.txt          # ignora cambios de whitespace
git blame L50..L80 archivo.txt    # solo líneas 50-80
git blame -L 50,+30 archivo.txt   # 30 líneas desde línea 50
git blame a1b2c3d..HEAD archivo.txt  # solo revisiones en rango
```

## Casos de uso

| Propósito | Comando |
|-----------|---------|
| Aplicar un fix específico | `git cherry-pick <hash>` |
| Encontrar bug introductorio | `git bisect` |
| Buscar cambios de una función | `git log -S "funcion"` |
| Saber quién modificó una línea | `git blame archivo` |
