---
sidebar_label: "Soluciones"
---

# Soluciones M12 — Portals, Refs y Manipulación del DOM

## Modal.tsx

**Solución esperada**:

```tsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
```

**Posibles mejoras**:
- Agregar `aria-modal="true"`, `role="dialog"`, `aria-labelledby` y `aria-describedby` para accesibilidad con lectores de pantalla.
- Usar `useEffect` para deshabilitar el scroll del body (`document.body.style.overflow = 'hidden'`) mientras el modal está abierto, y restaurarlo en cleanup.
- Crear un elemento div dedicado para portales (`document.getElementById('portal-root')`) en lugar de `document.body` para evitar conflictos con estilos globales.

---

## ConfirmDialog.tsx

**Solución esperada**:

```tsx
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn-danger" onClick={onConfirm}>Eliminar</button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
```

**Posibles mejoras**:
- Enfocar automáticamente el botón "Cancelar" al abrir el diálogo usando `useRef` + `useEffect` para facilitar navegación por teclado.
- Agregar `aria-describedby` que apunte al mensaje de confirmación, y `aria-labelledby` al título.
- Usar un enum o constantes para los textos de los botones y permitir sobrescribirlos via props (`confirmLabel`, `cancelLabel`).

---

## Input.tsx

**Solución esperada**:

```tsx
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        ref={ref}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
```

**Posibles mejoras**:
- Usar `useImperativeHandle` para exponer métodos `focus()`, `select()` y `clear()` en lugar de depender de que el padre acceda directamente al DOM.
- Agregar un `id` generado con `useId()` y asociar el `<label>` con `htmlFor` para accesibilidad.
- Incluir `aria-invalid={!!error}` y `aria-describedby` vinculado al mensaje de error.

---

## Tooltip.tsx

**Solución esperada**:

```tsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  delay?: number;
}

function Tooltip({ text, children, delay = 300 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => setVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX + 10, y: e.clientY + 10 });
  };

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      {visible && createPortal(
        <div className="tooltip" style={{ left: position.x, top: position.y }}>
          {text}
        </div>,
        document.body
      )}
    </span>
  );
}

export default Tooltip;
```

**Posibles mejoras**:
- Usar `getBoundingClientRect()` + posición del scroll para posicionar el tooltip relativo al trigger en lugar de usar `clientX/clientY`.
- Agregar `role="tooltip"` y asociar con `aria-describedby` en el trigger para accesibilidad.
- Implementar lógica de "flip" para evitar que el tooltip se salga del viewport (posicionarlo arriba si no hay espacio abajo).

---

## Uso en TaskCard con ConfirmDialog

**Solución esperada**:

```tsx
import { useState } from 'react';
import ConfirmDialog from '../ui/ConfirmDialog';
import Tooltip from '../ui/Tooltip';

interface TaskCardProps {
  task: { id: number; title: string; description: string; status: string };
  onDelete: (id: number) => void;
}

function TaskCard({ task, onDelete }: TaskCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(task.id);
    setShowConfirm(false);
  };

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <Tooltip text={task.description}>
        <p className="task-description">
          {task.description.length > 50
            ? task.description.slice(0, 50) + '...'
            : task.description}
        </p>
      </Tooltip>
      <span className={`task-status status-${task.status}`}>{task.status}</span>
      <button className="btn-delete" onClick={() => setShowConfirm(true)}>
        Eliminar
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Eliminar tarea"
        message={`¿Estás seguro de eliminar "${task.title}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

export default TaskCard;
```

**Posibles mejoras**:
- Agregar un `useRef` para enfocar el botón de eliminar en la TaskCard después de cerrar el ConfirmDialog sin confirmar, restaurando el foco al elemento que abrió el diálogo.
- Usar `useCallback` para `handleDelete` y los handlers de `onCancel`/`onConfirm` para evitar recrear funciones en cada render.
- Implementar un hook `useConfirm` que encapsule el estado del diálogo y exponga `showConfirm`, `hideConfirm` y el componente ConfirmDialog.
