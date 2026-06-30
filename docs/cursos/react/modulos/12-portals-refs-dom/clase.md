---
sidebar_label: "Clase"
---

# Portals, Refs y Manipulación del DOM

## Estado Actual

Navegación funcionando. Las acciones (eliminar) no tienen confirmación visual.

## createPortal

Renderiza contenido React fuera del árbol DOM del componente padre, manteniendo el contexto de eventos.

```tsx
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    children,
    document.getElementById('modal-root')
  );
}
```

### ¿Por qué usar Portals?

- **Modales**: sin problemas de z-index ni overflow del padre
- **ConfirmDialog**: confirmación de acciones destructivas (eliminar tarea)
- **Tooltips**: posicionamiento sin depender del overflow del contenedor
- **Notificaciones globales**: renderizar en una zona específica fuera del layout

### Event Bubbling

Aunque el contenido se renderice en otro nodo DOM, los eventos burbujean siguiendo el árbol de componentes React, no el DOM.

```tsx
<div onClick={() => console.log('capturado')}>
  <Portal>
    <button>Click</button> {/* el clic burbujea al div de arriba */}
  </Portal>
</div>
```

## useRef

Referencia mutable que persiste entre renders sin causar re-render.

### Acceso a elementos DOM

```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

return <input ref={inputRef} />;
```

### Valores mutables (sin re-render)

```tsx
const intervalRef = useRef<number | null>(null);

const start = () => {
  intervalRef.current = setInterval(() => setCount(c => c + 1), 1000);
};

const stop = () => {
  clearInterval(intervalRef.current!);
};
```

### Casos de uso

- Auto-focus en inputs
- Integración con librerías externas
- Intervalos y timeouts
- Scroll imperativo
- Almacenar valores anteriores

## forwardRef

Pasa una ref de un componente padre a un elemento DOM hijo.

```tsx
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

Uso en el padre:

```tsx
const inputRef = useRef<HTMLInputElement>(null);
return <Input ref={inputRef} />;
```

## useImperativeHandle

Personaliza el valor que el padre recibe a través de la ref, exponiendo solo los métodos deseados.

```tsx
const VideoPlayer = forwardRef((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => ({
    play() { videoRef.current?.play(); },
    pause() { videoRef.current?.pause(); },
  }));

  return <video ref={videoRef} />;
});
```

## Resumen

- `createPortal`: renderiza fuera del árbol DOM, ideal para modales y confirmaciones
- `useRef`: referencia mutable a elementos DOM o valores que persisten entre renders
- `forwardRef`: pasa ref del padre a un elemento DOM hijo
- `useImperativeHandle`: expone métodos específicos del hijo al padre
- Los eventos React burbujean por el árbol de componentes, no por el DOM
