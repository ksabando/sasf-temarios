---
sidebar_label: "Clase"
---

# Clase - Módulo 08: Repositorios Remotos

## ¿Qué es un remoto?

Un remoto es una versión del repositorio alojada en otro lugar (GitHub, GitLab, servidor propio). Se accede mediante un nombre simbólico, normalmente `origin`.

## Configurar un remoto

```bash
git remote add origin https://github.com/usuario/repo.git
```

- `origin` es el nombre convencional del remoto principal.
- Un repositorio puede tener múltiples remotos.

## git remote

- `git remote -v` — Lista los remotos con sus URLs (fetch y push).
- `git remote show origin` — Muestra información detallada del remoto (ramas tracked, URLs, etc.).

## git push

- `git push origin main` — Sube commits locales al remoto.
- `git push -u origin main` — Sube y establece upstream (seguimiento). La próxima vez basta con `git push`.
- `git push --force` — Sobrescribe el historial remoto (peligroso).
- `git push --force-with-lease` — Fuerza solo si el remoto no tiene cambios que no conozcas (más seguro).

## git pull vs git fetch

- `git fetch origin` — Descarga objetos y referencias del remoto sin fusionar. Seguro, no modifica el working directory.
- `git pull origin main` — Fetch + merge automático en la rama activa.
- `git pull --rebase` — Fetch + rebase en lugar de merge.

## git remote prune

- `git remote prune origin` — Elimina referencias a ramas remotas que ya no existen en el servidor.
- `git fetch --prune` — Fetch + prune automático.

## Protocolos

| Protocolo | Autenticación | Puerto |
|---|---|---|
| HTTPS | Token / usuario+contraseña | 443 |
| SSH | Clave pública/privada | 22 |
| Git (git://) | Sin autenticación (solo lectura) | 9418 |

HTTPS es el más común; SSH es preferido por su comodidad con claves.

## Buenas prácticas

- Siempre usar `--force-with-lease` en lugar de `--force`.
- Hacer `git fetch` antes de `git pull` para inspeccionar cambios.
- Prunear ramas remotas eliminadas periódicamente.
