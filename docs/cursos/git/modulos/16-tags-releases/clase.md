---
sidebar_label: "Clase"
---

# Tags y Releases

## ¿Qué son los Tags?

Los tags (etiquetas) en Git son referencias estáticas que apuntan a un commit específico. Se utilizan principalmente para marcar versiones de lanzamiento (v1.0, v2.3, etc.).

## Tipos de Tags

### Lightweight Tags
Son simplemente un puntero a un commit. No contienen metadatos adicionales.

```bash
git tag v1.0.0
git tag                          # Listar todos los tags
```

### Annotated Tags
Almacenan metadatos: autor, fecha, mensaje y pueden firmarse con GPG.

```bash
git tag -a v1.0.0 -m "Versión estable 1.0.0"
git show v1.0.0                  # Muestra el tag y el commit asociado
```

## Publicar Tags en Remoto

```bash
git push origin v1.0.0           # Publicar un tag específico
git push --tags                  # Publicar todos los tags locales
```

## Eliminar Tags

```bash
git tag -d v1.0.0                # Eliminar tag local
git push origin --delete v1.0.0  # Eliminar tag remoto
```

## Semver (Semantic Versioning)

Formato: `MAJOR.MINOR.PATCH`

- **MAJOR**: Cambios incompatibles con versiones anteriores.
- **MINOR**: Nuevas funcionalidades compatibles hacia atrás.
- **PATCH**: Correcciones de bugs compatibles hacia atrás.

Ejemplos: `v1.0.0`, `v2.1.3`, `v0.9.0-beta`.

## GitHub Releases

Desde la interfaz de GitHub se pueden crear **Releases** asociadas a un tag. Una Release incluye:
- Notas de la versión (changelog).
- Archivos binarios adjuntos (assets).
- Enlace directo de descarga.

## Signed Tags (Firma GPG)

```bash
git tag -s v1.0.0 -m "Versión firmada"
```

Requiere tener una clave GPG configurada. Verifica con:

```bash
git tag -v v1.0.0
```

## Buenas Prácticas

- Usar **annotated tags** para releases importantes.
- Seguir **Semver** estrictamente.
- Publicar los tags inmediatamente después del merge a main.
- Firmar los tags en proyectos públicos o críticos.
- Incluir changelog en las Releases de GitHub.
