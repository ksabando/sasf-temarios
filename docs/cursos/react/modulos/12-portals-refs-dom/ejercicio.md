---
sidebar_label: "Ejercicio"
---

# Ejercicios: Portals, Refs y DOM - TaskFlow

Projecto base: `taskflow/`

## Ejercicio 1: Modal con createPortal

Crear `src/components/ui/Modal.tsx`:

- Renderiza en `document.body` usando `createPortal`
- Props: `isOpen`, `onClose`, `title`, `children`
- Overlay oscuro que cierra al hacer clic fuera
- Prevenir cierre al hacer clic dentro del contenido
- Botón de cierre (X) en la esquina

## Ejercicio 2: ConfirmDialog para eliminar tarea

Crear `src/components/ui/ConfirmDialog.tsx`:

- Usa Modal internamente
- Props: `isOpen`, `onConfirm`, `onCancel`, `title`, `message`
- Botón "Eliminar" con estilo rojo (danger)
- Botón "Cancelar" para cerrar
- Integrar en TaskCard al hacer clic en eliminar

## Ejercicio 3: Auto-focus en input de búsqueda

En el header o dashboard:

- Input de búsqueda con `useRef`
- Al montar el componente, hacer focus automático con `useEffect`
- Atajo de teclado: Ctrl+K o / para enfocar el input

## Ejercicio 4: forwardRef en Input

Si no existe, crear `src/components/ui/Input.tsx` con `forwardRef`:

- `forwardRef<HTMLInputElement, InputProps>`
- Props: `label`, `error`, más todas las nativas de input
- Mostrar label y mensaje de error

## Ejercicio 5: Tooltip para descripciones largas

Crear `src/components/ui/Tooltip.tsx`:

- Aparece al hacer hover sobre la tarea
- Renderiza en portal para evitar overflow
- Sigue la posición del mouse
- Delay de 300ms antes de mostrarse
