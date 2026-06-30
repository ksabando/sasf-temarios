---
sidebar_label: "Cuestionario"
---

# Cuestionario M12 — Portals, Refs y Manipulación del DOM

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] React 19 introdujo "ref as a prop" eliminando la necesidad de `forwardRef` en muchos casos. ¿Cómo funciona esto a nivel de reconciler y qué implicancias tiene para `useImperativeHandle`? ¿`forwardRef` queda completamente obsoleto?

**Respuesta**: En React 19, `ref` es tratada como una prop normal durante el render. Internamente, el reconciler extrae `ref` del objeto props antes de pasarlo al elemento DOM, igual que extrae `key`. Esto significa que `function Input({ ref, ...props })` funciona directamente sin `forwardRef`. Sin embargo, `forwardRef` NO queda obsoleto porque sigue siendo necesario para: (1) `useImperativeHandle` (que requiere la firma `(props, ref) =>` de `forwardRef`), (2) compatibilidad con React 18 y versiones anteriores, (3) casos donde necesitás un nombre de prop diferente para la ref (`innerRef`, `inputRef`), (4) HOCs que necesitan pasar refs hacia abajo y hacia arriba.

**Por qué**: El cambio simplifica los componentes que solo necesitan pasar una ref a un elemento DOM interno. Antes: `const Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} />)`. Ahora: `function Input({ ref, ...props }: Props & { ref?: Ref<HTMLInputElement> }) { return <input ref={ref} /> }`. La diferencia es que `forwardRef` crea un `ForwardRef` fiber (un tipo especial), mientras que el nuevo enfoque usa la prop `ref` normal. `useImperativeHandle` sigue requiriendo la API de `forwardRef` porque necesita un ref estable al que adjuntar el handle imperativo. Fuente: React 19 release notes, PR "ref as a prop" en github.com/facebook/react/pull/25922, y la documentación de `useImperativeHandle`.

---

### 2. [Investigar] ¿Qué es `flushSync` y para qué casos de uso avanzados con refs y el DOM es necesario? La clase usa `useEffect` para focus. ¿Cuándo necesitarías `flushSync` en lugar de esperar al próximo render?

**Respuesta**: `flushSync` fuerza a React a aplicar las actualizaciones de estado pendientes al DOM de forma SINCRÓNICA, sin esperar al batching automático. Es necesario cuando necesitás leer el DOM inmediatamente después de un state update (leer `scrollHeight`, aplicar `focus`, medir dimensiones). Por ejemplo, para hacer scroll al final de una lista después de agregar un item:

```ts
flushSync(() => {
  setMessages(prev => [...prev, newMessage])
})
listRef.current?.scrollTop = listRef.current?.scrollHeight
```

Sin `flushSync`, `setMessages` no se aplica al DOM hasta después del handler, por lo que `scrollHeight` sería el valor anterior.

**Por qué**: `flushSync` es un escape hatch que rompe el batching automático. React lo documenta como "use it sparingly" porque degrada performance (fuerza un commit sincrónico). Casos legítimos: (1) scroll management después de agregar/eliminar items, (2) focus management cuando usás state para determinar qué elemento debe recibir foco, (3) integración con librerías non-React que necesitan leer el DOM después de una actualización. Para auto-focus en inputs (el caso de la clase), `useEffect` es correcto porque el focus puede esperar al próximo paint — no hay flickering. Fuente: React docs sobre `flushSync`, "When to use flushSync" en el blog de React, y la documentación de `react-dom`.

---

### 3. [Investigar] ¿Qué son React Aria hooks (`useButton`, `useTextField`, `useDialog`) y cómo se comparan con `useRef` + `forwardRef` manual? ¿Por qué Adobe los creó y qué problema resuelven sobre simplemente usar refs?

**Respuesta**: React Aria (de Adobe, creadores de React Spectrum) es una colección de hooks que manejan comportamiento, accesibilidad, e interacciones de componentes UI, exponiendo props que se pasan a elementos DOM. A diferencia de usar `useRef` manualmente (donde manejás focus, keyboard, ARIA atributos vos mismo), React Aria hooks encapsulan toda la lógica de accesibilidad y comportamiento siguiendo las especificaciones WAI-ARIA. `useButton` maneja `onClick`, `onKeyDown` (Space/Enter), `role="button"`, `tabIndex`, `disabled`, `aria-label`, etc.

**Por qué**: Adobe creó React Aria porque implementar accesibilidad correctamente es extremadamente complejo (WAI-ARIA Authoring Practices tienen cientos de patrones). Un `Button` simple necesita manejar Space y Enter para activación, focus visible, deshabilitación correcta, y prevención de activación accidental. React Aria hooks encapsulan todo esto y retornan props que se spread sobre el elemento. Trabajan con cualquier librería de estilos (Tailwind, CSS Modules, styled-components) porque son "headless" — solo manejan lógica y comportamiento. Usan `useRef` internamente pero lo abstraen del desarrollador. Fuente: react-spectrum.adobe.com/react-aria, "Why React Aria" en el blog de Adobe, y la charla "Building Accessible Components" por Devon Govett.

---

### 4. [Investigar] ¿Qué es "Floating UI" (antes Popper) y cómo interactúa con Portals y refs para posicionar elementos flotantes (tooltips, popovers, dropdowns)? ¿Cómo maneja el scroll y el resize mejor que un Portal con `position: fixed`?

**Respuesta**: Floating UI es una librería de posicionamiento de elementos flotantes que reemplaza a Popper. Usa refs para medir el elemento de referencia (`useRef`) y el elemento flotante, y calcula la posición óptima usando algoritmos que consideran: colisiones con los bordes del viewport, espacio disponible, scroll del contenedor, y preferencias de ubicación. Trabaja con Portals (el elemento flotante puede estar en `document.body` via Portal) y actualiza la posición automáticamente en respuesta a scroll, resize, y cambios de layout (usando `ResizeObserver` + `scroll` listeners).

**Por qué**: Un tooltip con `position: fixed` y coordenadas estáticas se desalinea con el scroll. Floating UI usa `getBoundingClientRect()` del elemento trigger (via ref) en cada frame de scroll, recalcula la posición, y actualiza el estilo `position: fixed` del flotante. También maneja "flip" (si no hay espacio arriba, se muestra abajo), "shift" (mover para no salirse del viewport), y "autoUpdate" (limpiar listeners cuando el flotante se desmonta). Integrado con React: `useFloating` retorna `{ refs, floatingStyles }` donde `refs.setReference(inputRef)` y `refs.setFloating(tooltipRef)` conectan las refs. Fuente: floating-ui.com, "From Popper to Floating UI" en el blog de Floating UI, y ejemplos de integración con React.

---

### 5. [Conectar] La clase usa `createPortal` para modales. Conectá esto con la API `popover` nativa del navegador (atributo HTML `popover` y CSS `::backdrop`). ¿Cómo afecta la nueva API `popover` la necesidad de usar Portals para modales y tooltips?

**Respuesta**: La API `popover` (parte de HTML Living Standard, soportada en Chrome/Edge desde 2024, Firefox/Safari en 2025) permite crear elementos emergentes nativos sin JavaScript: `<div popover>Contenido</div>`. El navegador maneja: (1) posicionamiento en la capa superior (top layer, por encima de todo, sin z-index), (2) cierre con clic fuera o tecla Escape, (3) backdrop nativo (`::backdrop`), (4) focus trapping básico. Esto reduce la necesidad de Portals para casos simples (modales nativos, tooltips, dropdowns), pero no los reemplaza completamente porque: (1) no tenés control fino sobre el posicionamiento (necesitás Floating UI para tooltips anclados a elementos), (2) no podés renderizar contenido React condicional dentro del popover sin JavaScript, (3) la animación de entrada/salida es limitada comparada con Framer Motion.

**Por qué**: Para un modal de confirmación simple (como "¿Eliminar tarea?"), `popover` + `dialog[open]` (otro API nativo) podrían reemplazar el Portal + Modal React. Pero para modales con formularios, validación, y animaciones personalizadas, React + Portal + Framer Motion sigue siendo necesario. La tendencia es: APIs nativas para casos simples, React para casos complejos. `createPortal` sigue siendo necesario para renderizar React dentro de elementos popover nativos. Fuente: MDN "Popover API", "Dialog element" en web.dev, y "Popover API vs React Portals" en el blog de Chrome Developers.

---

### 6. [Conectar] La clase muestra `useRef` para acceso a elementos DOM. Conectá esto con el patrón "callback refs": ¿cuándo usar `useCallback` como ref en lugar de `useRef`, y qué ventajas tiene para casos como medir elementos o adjuntar listeners?

**Respuesta**: Un "callback ref" es una función pasada al prop `ref` en lugar de un objeto `useRef`. React llama a esta función con el elemento DOM cuando se monta (y con `null` cuando se desmonta):

```ts
const [height, setHeight] = useState(0)
const measuredRef = useCallback((node: HTMLDivElement | null) => {
  if (node) setHeight(node.getBoundingClientRect().height)
}, [])
return <div ref={measuredRef}>...</div>
```

Ventajas sobre `useRef`: (1) no necesitás `useEffect` para reaccionar al montaje (el callback se llama inmediatamente al adjuntar), (2) podés reaccionar a cuando el ref se desadjunta (`node === null`), (3) funciona correctamente con renderizado condicional (si el elemento aparece/desaparece, la callback se llama apropiadamente).

**Por qué**: `useRef` te da un objeto mutable que persiste, pero no te notifica cuando se adjunta/desadjunta. Para medir un elemento, con `useRef` necesitás: `useEffect(() => { if (ref.current) measure() }, [])`. Con callback ref, la medición ocurre en el momento del attachment, sin efecto adicional. Callback refs son especialmente útiles para "ref forwarding" dinámico (cuando el elemento al que apunta la ref cambia) y para integración con librerías que necesitan setup/teardown (como `ResizeObserver`). La desventaja: el callback se recrea en cada render si no está en `useCallback`, causando llamadas innecesarias. Fuente: React docs "Callback Refs", "Refs and the DOM" en react.dev, y "When to use callback refs" en el blog de Kent C. Dodds.

---

### 7. [Conectar] Investigá cómo `useId` (React 18) se relaciona con refs y la accesibilidad. ¿Por qué usar `useId()` para relacionar `aria-labelledby` con un elemento referenciado por ref es mejor que usar IDs hardcodeados o generados manualmente?

**Respuesta**: `useId()` genera IDs únicos y estables a través de renders y entre servidor/cliente (SSR). Para accesibilidad, necesitás relacionar un label con un input: `<label id={labelId}>Name</label><input aria-labelledby={labelId} />`. Con `useId`, cada instancia del componente obtiene un ID único, incluso si el componente se renderiza múltiples veces en la misma página. Esto es mejor que IDs hardcodeados (colisiones) o `Math.random()` (no estable entre renders — cambia en cada render causando problemas de SSR hydration).

**Por qué**: Antes de `useId`, la práctica común era usar un contador global o `useRef` con un ID generado una vez: `const idRef = useRef(randomId())`. `useId` simplifica esto y garantiza estabilidad en SSR (el servidor y el cliente generan el mismo ID para la misma posición en el árbol). No está directamente relacionado con refs, pero trabaja junto con ellos: la ref apunta al elemento DOM, el ID lo identifica para atributos ARIA. Fuente: React docs sobre `useId`, "Why useId is important for accessibility" en el blog de React, y "useId and SSR" en react.dev.

---

### 8. [Cuestionar] `useImperativeHandle` es controversial: algunos lo consideran un anti-patrón que rompe el flujo unidireccional de React. ¿Cuándo es genuinamente necesario y cuándo es un smell de diseño que debería resolverse con props?

**Respuesta**: Es genuinamente necesario para: (1) integración con librerías non-React que requieren API imperativa (Google Maps, Chart.js, Monaco Editor — necesitás llamar `map.panTo()`, `chart.update()`, `editor.focus()`), (2) componentes que encapsulan comportamiento nativo que no puede expresarse declarativamente (`videoRef.play()`, `inputRef.select()`). Es un smell cuando: (1) estás exponiendo `setState` o `dispatch` del hijo al padre (eso debería ser props), (2) estás creando una API imperativa para componentes puramente React (pasá props en lugar de crear `ref.current.doSomething()`).

**Por qué**: React está diseñado con flujo unidireccional: padre → hijo via props. `useImperativeHandle` crea un canal hijo → padre (imperativo) que invierte este flujo. El equipo de React lo describe como "escape hatch". La regla: si el comportamiento puede lograrse con props y estado (como toggle, abrir/cerrar, cambiar tema), usá props. Si necesitás acceso imperativo real (focus, scroll, play, métodos de librerías externas), `useImperativeHandle` es la herramienta correcta. Fuente: React docs "useImperativeHandle", "When to use imperative handle" por Kent C. Dodds, y discusión en github.com/facebook/react.

---

### 9. [Cuestionar] ¿Es `createPortal` la solución correcta para TODOS los casos de elementos que "escapan" del overflow del padre? Algunos argumentan que CSS moderno (`position: fixed`, `popover`, `dialog`, `top-layer`) hace que los Portals sean innecesarios. ¿Qué casos requieren Portal sí o sí?

**Respuesta**: Los Portals son necesarios cuando: (1) necesitás renderizar React components (con estado, hooks, contexto) fuera de la jerarquía DOM del padre pero DENTRO del mismo árbol de React (porque el árbol lógico y el físico son diferentes), (2) el padre tiene `overflow: hidden` y necesitás que el hijo sea visible fuera (CSS `position: fixed` resuelve esto), (3) necesitás que el elemento viva en un contenedor específico del DOM (como `#modal-root` al final de `<body>`). CSS moderno (`popover`, `dialog`, `position: fixed`) resuelve muchos casos visuales, pero NO resuelve el caso donde el contenido es React y necesita acceso al contexto/estado de la app. Si tu modal es un `<div>` con estilos CSS (sin estado React), no necesitás Portal. Si tu modal es un componente React con hooks, estado, y contexto, Portal es necesario para separar la posición física del DOM manteniendo la conexión lógica con React.

**Por qué**: La API `popover` + `dialog` nativa del navegador maneja el posicionamiento y la capa superior, pero el contenido dentro del popover no es React. Podés usar `createPortal` para renderizar React DENTRO de un elemento `dialog` nativo, combinando ambas APIs. La clave: Portal no es sobre CSS, es sobre la conexión entre el árbol de React y el árbol del DOM. Mientras necesites que un componente React acceda a su contexto padre pero viva en otro lugar del DOM, Portal es necesario. Fuente: React docs sobre Portals, "Portals vs CSS positioning" en múltiples artículos, y la charla "Rethinking Modals" en React Conf.

---

### 10. [Cuestionar] ¿Es `useRef` para todo tipo de valor mutable (no solo DOM)? La clase menciona usarlo para interval IDs. Pero la comunidad debate si `useRef` para valores que no son nodos DOM (como `isMounted`, previos valores, flags) es un anti-patrón. ¿Qué dice el equipo de React?

**Respuesta**: El equipo de React (Dan Abramov, Andrew Clark) confirma que `useRef` para valores mutables no-DOM es perfectamente válido y es el uso recomendado. `useRef` es el hook para "cualquier valor mutable que debe persistir entre renders sin causar re-renders". Casos legítimos: interval IDs, timeout IDs, previous values, flags (`isMounted` — aunque este patrón es desaconsejado), referencias a WebSocket connections, instancias de librerías externas. El único "anti-patrón" es usar `useRef` para valores que DEBERÍAN causar re-renders (si la UI depende de ese valor, usá `useState`).

**Por qué**: `useRef` es el equivalente funcional de `this.someField` en componentes de clase. En clases, podías tener `this.interval` que persistía entre renders pero no causaba re-renders. En componentes funcionales, las variables locales se recrean en cada render, por lo que necesitás `useRef` para valores que deben sobrevivir entre renders. El equipo de React documenta: "useRef is like a box that can hold a mutable value in its .current property." No hay controversia real — `useRef` para no-DOM es estándar y recomendado. Fuente: React docs "useRef", "Hooks FAQ: Is there something like instance variables?" en react.dev, y tweets de Dan Abramov confirmando el uso de refs para valores mutables.
