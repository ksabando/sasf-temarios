---
sidebar_label: "Clase"
---

# Clase 04 - Staging, Commit y Ciclo de Vida de Archivos

## 1. Ciclo de Vida de los Archivos

```
Untracked (No trackeado)
     │
     ▼ (git add)
  Staged (Preparado)
     │
     ▼ (git commit)
 Unmodified (Sin modificar)
     │
     ▼ (modificar archivo)
  Modified (Modificado)
     │
     ▼ (git add)
  Staged (Preparado) → ciclo continúa
```

## 2. Estados en Detalle

| Estado | Descripción |
|---|---|
| **Untracked** | Archivo nuevo que Git no sigue |
| **Staged** | Archivo agregado al staging listo para commit |
| **Modified** | Archivo trackeado con cambios sin staging |
| **Unmodified** | Archivo trackeado sin cambios desde el último commit |

## 3. Staging Interactivo

```bash
git add -p        # Agregar por fragmentos (hunks)
git add -i        # Modo interactivo completo
```

Opciones de `git add -p`:
- `y` - agregar este hunk
- `n` - no agregar este hunk
- `s` - dividir hunk en partes más pequeñas
- `e` - editar manualmente el hunk
- `q` - salir

## 4. git commit --amend

Permite modificar el último commit:
```bash
git commit --amend                    # Cambia el mensaje (abre editor)
git commit --amend -m "Nuevo mensaje" # Cambia mensaje en línea
git commit --amend --no-edit          # Agrega archivos sin cambiar mensaje
```

⚠ **Precaución**: No usar `--amend` en commits que ya fueron subidos al remoto si hay otros colaboradores.

## 5. .gitignore

Archivo que lista patrones que Git debe ignorar:

```
# Directorios
node_modules/
dist/
build/

# Archivos
*.log
.env
.DS_Store

# Negación (no ignorar)
!important.log
```

### .gitkeep
Archivo vacío para trackear directorios vacíos (Git no trackea directorios, solo archivos).

## 6. Buenas Prácticas para Mensajes de Commit

```
Formato recomendado (50/72):
- Línea de asunto ≤ 50 caracteres
- Cuerpo envuelto a 72 caracteres

Ejemplo:
feat: agregar autenticación OAuth

- Implementa flujo completo OAuth 2.0
- Agrega middleware de verificación de token
- Actualiza documentación de API
```

## 7. Comandos Adicionales

```bash
git commit -v        # Muestra el diff en el editor al commitear
git shortlog         # Resumen de commits agrupados por autor
git shortlog -sn     # Igual pero solo cantidad (ranking)
git count-objects    # Muestra cantidad de objetos en .git
```
