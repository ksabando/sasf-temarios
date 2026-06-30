---
sidebar_label: "Clase"
---

# Hooks y Automatización Local

## ¿Qué son los Hooks de Git?

Los hooks son scripts que se ejecutan automáticamente cuando ocurren ciertos eventos en Git. Viven en el directorio `.git/hooks/` del repositorio.

## Directorio .git/hooks

Contiene scripts de ejemplo con extensión `.sample`. Para activar un hook, se elimina el sufijo `.sample` y se hace ejecutable el archivo.

```bash
ls .git/hooks/
```

## Principales Hooks del Lado Cliente

### pre-commit
Se ejecuta antes de crear el commit. Sirve para validar código, ejecutar linters o impedir commits con errores.

```bash
#!/bin/sh
# .git/hooks/pre-commit
echo "Ejecutando validaciones..."
```

### prepare-commit-msg
Permite pre-llenar el mensaje del commit automáticamente.

### commit-msg
Valida el formato del mensaje del commit. Ej: verificar que siga Conventional Commits.

### pre-push
Se ejecuta antes de hacer push. Ideal para correr tests.

### post-commit
Se ejecuta después del commit. Útil para notificaciones.

## Husky

Husky es una herramienta moderna para gestionar hooks de Git desde `package.json`.

```bash
npx husky init
npx husky add .husky/pre-commit "npm test"
```

## lint-staged

Ejecuta linters solo sobre los archivos que están staged, acelerando el feedback.

```bash
npx lint-staged
```

Configuración en `package.json`:

```json
"lint-staged": {
  "*.js": "eslint --fix"
}
```

## Compartir Hooks

Los hooks en `.git/hooks/` no se comparten con `git push`. Para compartirlos, se almacenan en una carpeta del proyecto (ej: `.githooks/`) y se configura:

```bash
git config core.hooksPath .githooks
```

## Buenas Prácticas

- Hooks rápidos y ligeros.
- No bloquear el flujo sin mensajes claros.
- Usar Husky + lint-staged para equipos JS.
- Compartir hooks via `.githooks/` en el repositorio.
