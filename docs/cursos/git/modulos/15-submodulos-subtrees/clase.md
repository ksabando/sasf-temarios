---
sidebar_label: "Clase"
---

# Submódulos y Subtrees

## Submódulos

Un submódulo es un repositorio Git dentro de otro repositorio. Permite mantener un proyecto externo como dependencia con su propia historia.

### Agregar un submódulo

```bash
git submodule add https://github.com/usuario/lib.git libs/lib
git commit -m "agregar submódulo lib"
```

Esto crea:
- `.gitmodules`: archivo de configuración de submódulos
- El directorio con el contenido del repositorio externo

### Inicializar y actualizar

```bash
git submodule init                    # inicializa submódulos del .gitmodules
git submodule update                  # clona/fetch al commit registrado
# O en un solo paso:
git submodule update --init --recursive
```

### Actualizar al último commit remoto

```bash
git submodule update --remote         # actualiza cada submódulo a su último commit
```

### Clonar un proyecto con submódulos

```bash
git clone --recurse-submodules https://github.com/usuario/proyecto.git
```

### git submodule foreach

Ejecuta un comando en cada submódulo:

```bash
git submodule foreach git checkout main
git submodule foreach git pull
```

## Subtrees

Un subtree integra un repositorio externo dentro de un subdirectorio, pero a diferencia de los submódulos, copia la historia y no requiere archivos de configuración externos.

```bash
git subtree add --prefix=libs/lib https://github.com/usuario/lib.git main --squash
```

### subtree pull y push

```bash
git subtree pull --prefix=libs/lib https://github.com/usuario/lib.git main
git subtree push --prefix=libs/lib https://github.com/usuario/lib.git main
```

## Submódulos vs Subtrees

| Aspecto | Submódulo | Subtree |
|---------|-----------|---------|
| Historia separada | ✅ | ✅ |
| Archivo de config | .gitmodules | No necesita |
| Clonar con deps | `--recurse-submodules` | Ya incluido en el clone |
| Modificar desde el padre | Complejo | Más simple |
| Visibilidad del código | Referencia a hash | Código copiado |
| Facilidad de uso | Mayor curva | Más directo |

## Alternativas

- **Monorepos**: Un solo repositorio con múltiples proyectos en carpetas separadas.
- **Package Manager Workspaces**: npm workspaces, yarn workspaces, pnpm workspaces para JavaScript; Cargo workspaces para Rust.
- **Dependencias de paquete**: Usar el gestor de paquetes del lenguaje (npm, pip, maven) en lugar de submódulos.

## Buenas prácticas

- Preferir submódulos cuando se necesita referenciar un commit exacto y no modificar la dependencia.
- Preferir subtree cuando se necesita modificar la dependencia desde el proyecto padre.
- Evitar anidar muchos niveles de submódulos.
- Documentar qué submódulos usa el proyecto en el README.
