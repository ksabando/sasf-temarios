---
sidebar_label: "Cuestionario"
---

# Cuestionario M04 — Eventos y Renderizado Condicional

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] En React 19, el sistema de event delegation cambió: los eventos ya no se delegan a `document`, sino al nodo root de React. ¿Qué implicaciones prácticas tiene este cambio para `e.stopPropagation()`, `e.nativeEvent`, y la interoperabilidad con librerías no-React en la misma página?

**Respuesta**: En React 17, los eventos sintéticos se delegaban a `document`, lo que significaba que un `e.stopPropagation()` en un componente React no impedía que el evento llegara a listeners nativos en `document`. En React 19, los eventos se delegan al nodo root donde React está montado (`#root`). Esto hace que `stopPropagation()` dentro de React sea más predecible y compatible con listeners nativos en `document`, y mejora la coexistencia de múltiples versiones de React en la misma página (micro-frontends).

**Por qué**: El cambio se introdujo en React 17 (2020) y es el comportamiento por defecto en React 19. La razón: delegar a `document` era problemático para micro-frontends (diferentes versiones de React en la misma página competían por el mismo listener en `document`) y para integración con jQuery/librerías externas que esperaban que `stopPropagation()` en React detuviera el burbujeo. Ahora cada root de React maneja sus propios eventos. Una implicación práctica: si tenés un modal renderizado con Portal en `document.body`, los eventos dentro del modal siguen siendo manejados por el root de React (porque el Portal mantiene la conexión lógica). Sin embargo, listeners nativos agregados al `document` (no al root) NO son interceptados por React. Fuente: "React 17: Gradual Upgrades" en react.dev/blog, "Changes to Event Delegation" en github.com/facebook/react/issues/19629, y la documentación de `createRoot` en React 19.

---

### 2. [Investigar] ¿Qué son los "eventos sintéticos" de React a nivel de implementación? Investigá cómo React normaliza las diferencias entre navegadores, el sistema de pooling (que fue removido en React 17), y cómo afecta esto al tipado `React.MouseEvent` vs el `MouseEvent` nativo.

**Respuesta**: Los SyntheticEvent son wrappers de React alrededor de los eventos nativos del DOM. React crea un objeto SyntheticEvent que envuelve el evento nativo (`nativeEvent`) y normaliza propiedades como `target`, `currentTarget`, `preventDefault()`, y `stopPropagation()` para que se comporten idénticamente en todos los navegadores. React 17 eliminó el "event pooling" (que reutilizaba objetos SyntheticEvent para ahorrar memoria y los invalidaba después del callback), lo que significa que ahora los eventos son persistentes y se pueden acceder asíncronamente sin llamar a `e.persist()`.

**Por qué**: Antes de React 17, el event pooling era una optimización de rendimiento: React creaba un pool de objetos SyntheticEvent y los reutilizaba. Esto requería que los accesos al evento fueran sincrónicos (o llamar a `e.persist()` para uso asíncrono). React eliminó el pooling porque: (1) los navegadores modernos son más rápidos creando objetos, (2) el pooling era fuente común de bugs (acceder a `e.target.value` en un callback async devolvía null). Ahora `React.MouseEvent` extiende `React.SyntheticEvent` que envuelve `MouseEvent` nativo, y podés acceder a `e.nativeEvent` para obtener el evento nativo subyacente (útil para integraciones con librerías que esperan eventos nativos). Fuente: "React 17 changelog" en react.dev, el código fuente de SyntheticEvent en github.com/facebook/react/packages/react-dom/src/events, y "Event Pooling removal" en el React RFC.

---

### 3. [Investigar] `useEffectEvent` (antes `useEvent`) fue propuesto como RFC pero no llegó a React 19 en su forma original. ¿Qué problema resuelve este hook en relación a los event handlers y los closures stale? ¿Por qué el equipo de React lo consideró y luego lo pausó?

**Respuesta**: `useEffectEvent` resuelve el problema de "stale closure" en efectos: cuando un `useEffect` necesita llamar a una función que depende de props/estado, pero no querés que el efecto se re-ejecute cada vez que esas dependencias cambian. El hook extrae la función del flujo reactivo — la función siempre ve los valores más recientes, pero el efecto solo se re-ejecuta cuando sus dependencias "reales" cambian. El equipo de React pausó el RFC porque encontró edge cases complejos con Concurrent Rendering y necesitaba más tiempo para refinarlo.

**Por qué**: El escenario típico: un `useEffect` que se suscribe a un WebSocket y necesita llamar a `sendMessage` que usa el `user.id` actual. Sin `useEffectEvent`, tenés que incluir `user.id` en las dependencias del efecto, lo que causa re-suscripción cada vez que el usuario cambia. Con `useEffectEvent`, la función `sendMessage` siempre ve el `user.id` actual pero el efecto no se re-ejecuta. Esto es similar a como `useRef` se usa a veces como workaround, pero con mejor integración con el scheduler. El hook está disponible en el paquete experimental `react@experimental`. Fuente: RFC "useEvent" en github.com/reactjs/rfcs/pull/220, discusión en el React Working Group, y ejemplos en el blog de Dan Abramov "The Missing useEffect Guide".

---

### 4. [Investigar] ¿Qué es `useOptimistic` (React 19) y cómo extiende el concepto de renderizado condicional para manejar estados "pendientes de confirmación"? ¿Cómo se relaciona con el patrón de "objeto literal para estados" que vimos en clase?

**Respuesta**: `useOptimistic` es un hook de React 19 que permite mostrar un estado "optimista" inmediatamente mientras una operación asíncrona está en curso, y automáticamente revierte al estado real si la operación falla. Extiende el renderizado condicional porque agrega un cuarto estado a los tres tradicionales (pending, success, error): "optimistic" — donde la UI muestra el resultado esperado antes de que el servidor confirme. Se relaciona con el patrón de objeto literal porque podés usarlo para agregar el estado optimistic a tu mapa de estados.

**Por qué**: `useOptimistic` recibe el estado real y retorna `[optimisticState, addOptimistic]`. Cuando el usuario realiza una acción (ej: marcar tarea como completada), llamás a `addOptimistic(newValue)` y React inmediatamente renderiza con el nuevo valor, mientras la promesa de la mutación se resuelve. Si la mutación falla, React revierte automáticamente al estado real. Es como tener un `if (isOptimistic) return <OptimisticUI />` pero manejado por el framework. Este hook es parte de la visión de React 19 de integrar patrones asíncronos en el renderizado. Fuente: React 19 release notes, RFC "useOptimistic" en github.com/reactjs/rfcs, y ejemplos en react.dev/blog.

---

### 5. [Conectar] La clase muestra `e.preventDefault()` y `e.stopPropagation()` como mecanismos separados. Investigá la relación entre el event system de React y el event system nativo del DOM en detalle: ¿cómo maneja React internamente la delegación de eventos y qué rol juegan `SyntheticEvent.nativeEvent` y las fases de captura/burbujeo?

**Respuesta**: React NO adjunta event listeners a cada elemento JSX individual. En su lugar, adjunta listeners al nodo root (o `document` en React <17) para cada tipo de evento. Cuando un evento nativo ocurre, React determina qué componentes de React están involucrados recorriendo las fibras desde la fibra correspondiente al `target` nativo hacia arriba (usando la propiedad interna `_reactFiber` de los nodos DOM). Luego dispara los handlers en orden (captura → target → burbujeo) usando el árbol de React, no el árbol DOM nativo.

**Por qué**: Esta arquitectura permite que React "vea" eventos que ocurren en nodos DOM creados fuera de React (como Portals en `document.body`) y los propague según el árbol lógico de componentes, no según el árbol físico del DOM. `e.nativeEvent` expone el evento DOM subyacente, y `e.nativeEvent.stopPropagation()` afecta la propagación NATIVA (entre nodos DOM), mientras que `e.stopPropagation()` afecta la propagación en el árbol de React. Esto significa que podés tener un portal renderizado en `document.body` cuyo evento de clic burbujea lógicamente a su padre React, aunque físicamente estén en ramas separadas del DOM. La fase de captura (`onClickCapture`) funciona de manera análoga en el árbol de React. Fuente: Código fuente de `react-dom` en `packages/react-dom/src/events`, "React Event System Deep Dive" en el blog de React, y la documentación de SyntheticEvent.

---

### 6. [Conectar] La clase menciona el patrón de objeto literal para múltiples estados de UI. Investigá cómo librerías como `cva` (Class Variance Authority) y `tailwind-variants` extienden este concepto para manejar variantes de componentes con TypeScript, ofreciendo type safety y autocompletado. ¿Cómo se integra esto con eventos como `onClick` que cambian la variante?

**Respuesta**: `cva` (creada por shadcn/ui) permite definir variantes de un componente como un objeto tipado, y genera automáticamente las clases CSS correspondientes (típicamente Tailwind). TypeScript infiere las combinaciones válidas. Se integra con eventos porque el estado de la variante (ej: `variant: 'primary' | 'secondary'`) es un prop o estado, y el `onClick` puede cambiar ese estado:

```ts
import { cva, type VariantProps } from 'class-variance-authority'
const button = cva('base-classes', {
  variants: { variant: { primary: 'bg-blue-500', secondary: 'bg-gray-500' },
              size: { sm: 'text-sm', lg: 'text-lg' } }
})
type ButtonProps = VariantProps<typeof button> & { onClick?: () => void }
function Button({ variant, size, onClick }: ButtonProps) {
  return <button className={button({ variant, size })} onClick={onClick} />
}
```

**Por qué**: `cva` extiende el patrón de objeto literal que vimos en clase agregando: (1) type safety automática via `VariantProps<typeof schema>`, (2) soporte para `defaultVariants`, (3) combinación de múltiples ejes de variantes, (4) compound variants (combinaciones específicas). Esto es una evolución del simple `badgeConfig` de la clase a un sistema de variantes tipado y documentado. Fuente: github.com/joe-bell/cva, documentación de shadcn/ui, y "Building a Design System with CVA" por shadcn.

---

### 7. [Conectar] El formulario inline de la clase resetea `title` y `description` después de submit. Investigá el patrón "uncontrolled form with key" como alternativa: ¿cómo resetear un formulario React cambiando su `key` en lugar de limpiar cada campo manualmente? ¿Qué ventajas y desventajas tiene?

**Respuesta**: El patrón "key-based reset" consiste en usar `key={submitCounter}` en el formulario. Cada vez que se hace submit, incrementás `submitCounter`, React desmonta el formulario anterior y monta uno nuevo con los valores iniciales (vacíos). Ventajas: código más simple (no necesitás `setTitle('')` ni `setDescription('')` para cada campo), garantiza que todo el estado interno del formulario se limpie. Desventajas: pierde el foco del input, pierde animaciones de transición, y si el formulario tiene estado en un store externo (Zustand), la key no lo limpia.

**Por qué**: Este patrón es útil cuando el formulario tiene muchos campos y el reset manual es propenso a errores (olvidar limpiar un campo). Internamente, React trata el cambio de `key` como "componente diferente" — desmonta el viejo (ejecutando cleanup de efectos) y monta uno nuevo (ejecutando efectos de mount). Esto es más drástico que un reset via `setState` pero también más predecible. Para TaskFlow, con solo 2 campos, el reset manual es mejor (no perdemos el foco). Pero en formularios con 20+ campos, el key-reset es más mantenible. Fuente: React docs sobre "Resetting State with a Key", "React Key Prop" en react.dev, y discusiones en el blog de Kent C. Dodds sobre formularios.

---

### 8. [Cuestionar] La clase muestra `{tasks.length && <TaskList />}` y advierte del problema de renderizar `0`. ¿Es realmente este un "bug" de React o es comportamiento correcto de JavaScript? ¿Debería React filtrar `0` y otros falsy values como filtra `null` y `undefined`?

**Respuesta**: Es comportamiento correcto de JavaScript, no un bug de React. JavaScript evalúa `0 && <Component />` y retorna `0` (el valor falsy). React intencionalmente renderiza `0` porque es un valor válido para mostrar (contadores, precios, etc.) y filtrarlo automáticamente sería incorrecto para muchos casos de uso legítimos. La comunidad ha debatido si React debería tener un "safe conditional render" que solo acepte `boolean | null | undefined`, pero esto rompería el modelo de que cualquier expresión JS es válida en JSX.

**Por qué**: React renderiza `0`, `NaN`, y strings vacíos `''` porque son valores que pueden ser intencionales. Si React filtrara `0`, no podrías mostrar `{count}` cuando count es 0. El equipo de React ha considerado agregar un warning en desarrollo para `{something.length && <List />}` cuando `something.length` es `0`, pero no lo han implementado porque: (1) hay casos legítimos donde `0` es intencional, (2) el linter ya puede detectarlo con la regla `react/jsx-no-leaked-render`. La solución idiomática es `{tasks.length > 0 && <TaskList />}` o `{!!tasks.length && <TaskList />}`. Fuente: React docs sobre "Conditional Rendering Pitfalls", "JSX Gotchas" en react.dev, y discusión en github.com/facebook/react/issues.

---

### 9. [Cuestionar] Hay un debate sobre inputs controlados vs no controlados. La clase muestra inputs controlados (`value={title} + onChange`). ¿Es realmente superior el enfoque controlado, o el enfoque no controlado con `useRef` + `FormData` es más performante y simple para formularios que no necesitan validación en tiempo real?

**Respuesta**: El enfoque controlado es superior cuando necesitás reactividad: validación en tiempo real, formateo de input (ej: tarjeta de crédito), deshabilitar botón según campos, o sincronizar con otros estados. El enfoque no controlado es superior cuando solo necesitás los valores al submit (como un formulario de búsqueda simple) porque evita re-renders en cada tecla. No hay un ganador universal — depende del caso de uso. React Hook Form precisamente existe para ofrecer lo mejor de ambos mundos: inputs no controlados (via ref) con validación reactiva.

**Por qué**: La documentación de React dice que los inputs controlados son la "fuente de verdad recomendada", pero también reconoce que los inputs no controlados son válidos para casos simples. El debate se intensificó cuando React Hook Form mostró que inputs no controlados pueden ser más performantes en formularios grandes (más de 30 campos). Bill Luo (creador de RHF) argumenta que el DOM ya mantiene el estado del input — duplicarlo en React con `useState` es redundante cuando no necesitás reactividad. La postura pragmática: controlado para formularios con validación reactiva, no controlado para formularios simples de submit, RHF como puente. Fuente: React docs "Controlled vs Uncontrolled Components", "The Case for Uncontrolled Components" en el blog de Bill Luo, y la documentación de React Hook Form.

---

### 10. [Cuestionar] Existe una controversia sobre si los ternarios anidados en JSX son un antipatrón o una herramienta legítima. La clase muestra el objeto literal como alternativa. ¿Dónde traza la comunidad la línea entre "ternario aceptable" y "necesitás refactorizar"? ¿Qué dicen guías de estilo como Airbnb o las recomendaciones de Dan Abramov?

**Respuesta**: La regla general de la comunidad: ternario simple (`cond ? A : B`) es aceptable y preferido sobre `&&` para condiciones con else. Ternario anidado (`cond1 ? A : cond2 ? B : C`) es aceptable si es claro y lineal, pero si hay más de 2 niveles o condiciones complejas, se debe refactorizar a un objeto literal, un componente separado, o early returns. Dan Abramov tuiteó: "Ternaries are fine. Nested ternaries are fine if they read like a table. If they read like spaghetti, use if/else or a lookup object."

**Por qué**: El debate es sobre legibilidad. Airbnb style guide (uno de los más estrictos) permite ternarios anidados con indentación clara. La guía de React no toma posición. Kent C. Dodds prefiere el objeto literal porque es más declarativo y TypeScript-friendly. La realidad: un ternario anidado con buena indentación puede ser más legible que un objeto literal con 5 entradas (porque toda la lógica está junta). La línea pragmática: si necesitás comentarios para explicar la lógica, refactorizá. Si se entiende de un vistazo, el ternario está bien. Fuente: Tweet de Dan Abramov sobre ternaries, Airbnb JavaScript Style Guide sección "Conditionals", y "Stop using nested ternaries? No." en el blog de Kent C. Dodds.
