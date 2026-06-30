---
sidebar_label: "Cuestionario"
---

# Cuestionario M13 — Render Props, HOC y Composición

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué son Radix UI Primitives y cómo implementan el patrón de Compound Components? Investigá el código fuente de `@radix-ui/react-dialog` o `@radix-ui/react-tabs` y compará su enfoque con los Tabs compuestos que hicimos en clase. ¿Qué patrones adicionales usan que nosotros no implementamos?

**Respuesta**: Radix UI Primitives (creado por el equipo de WorkOS, liderado por JJ Kasper y Benoît Grélard) son componentes headless, accesibles y no estilizados. Usan Compound Components extensivamente con patrones que no implementamos: (1) `asChild` para composición con cualquier elemento, (2) `RovingFocusGroup` para navegación por teclado entre tabs con flechas, (3) `Presence` para animar montaje/desmontaje, (4) `Portal` integrado para contenido que debe escapar del contenedor, (5) `Collection` para que el padre conozca sus items hijos sin props explícitas, (6) `DismissableLayer` para cerrar con clic fuera o Escape.

**Por qué**: Los Compound Components de Radix usan Context, pero agregan capas de comportamiento complejo que van más allá de simplemente compartir estado. Por ejemplo, `Tabs` implementa `RovingFocusGroup` (WAI-ARIA pattern para tabs) que maneja focus via teclado, `Tabs.List` implementa `role="tablist"`, y `Tabs.Trigger` implementa `role="tab"` + `aria-selected`. Nuestros Tabs en clase son una versión simplificada — funcional pero sin la accesibilidad completa. Radix es el gold standard de Compound Components en React. Fuente: radix-ui.com/primitives, código fuente en github.com/radix-ui/primitives, y la charla "Building a Design System with Radix" por JJ Kasper.

---

### 2. [Investigar] ¿Qué es Ark UI y cómo se diferencia de Radix UI? Investigá esta librería de componentes headless (del creador de Chakra UI, Segun Adebayo) que usa máquinas de estado (state machines) de Zag.js como base en lugar de useState/useReducer manual.

**Respuesta**: Ark UI es una librería de componentes headless que usa Zag.js internamente: cada componente (Dialog, Tabs, Accordion) está implementado como una state machine (usando el patrón state machine de Zag, no XState). Las state machines definen explícitamente todos los estados posibles, transiciones, y guardias. Esto garantiza que componentes complejos como Combobox o Select tengan comportamiento predecible en todos los edge cases. La diferencia con Radix: Radix usa hooks + useState manual, Ark/Zag usa máquinas de estado formales que son más verbosas pero más robustas y portables (el mismo Zag.js funciona en React, Vue, Solid).

**Por qué**: Segun Adebayo (creador de Chakra UI) diseñó Zag.js + Ark UI para resolver el problema de "componentes headless que funcionan igual en todos los frameworks". Las state machines de Zag definen el comportamiento una vez, y los adaptadores de framework (React, Vue, Solid) solo conectan la máquina con los hooks del framework. Esto es diferente de Radix (React-only) y Headless UI (React + Vue, con implementaciones separadas). Para TaskFlow, Radix o Ark serían opciones para reemplazar nuestros componentes custom (Tabs, Accordion, Modal) con versiones battle-tested y accesibles. Fuente: ark-ui.com, zagjs.com, "Introducing Ark UI" en el blog de Segun Adebayo, y la comparación Ark vs Radix en la comunidad.

---

### 3. [Investigar] ¿Cómo funciona `React.Children` internamente y por qué los métodos `Children.map`, `Children.toArray`, `Children.count` son necesarios? En React 19, ¿hay cambios en cómo se maneja `children` que afecten a los patrones de composición?

**Respuesta**: `React.Children` es un conjunto de utilidades para manipular la prop `children` de forma segura, porque `children` puede ser cualquier tipo (undefined, null, string, number, ReactElement, array, Fragment). Internamente, `Children.map` aplana fragments recursivamente (un Fragment se transparenta — sus hijos se tratan como hijos directos), mientras que el `.map()` nativo no aplana ni maneja tipos no-array. En React 19, `children` sigue siendo una prop normal (sin tipo especial), y `React.Children` sigue siendo la forma recomendada de iterar sobre children desconocidos. No hay cambios significativos en esta API en React 19.

**Por qué**: `Children.toArray` es particularmente importante: aplana fragments y convierte cualquier tipo de children en un array plano. Esto es necesario para patrones como injectar props (usando `cloneElement`) donde necesitás iterar sobre cada hijo individual. Sin `Children.toArray`, un `<Fragment>` anidado causaría que `children.map` falle (porque no itera sobre fragments). La implementación interna usa `traverseAllChildren` que recorre el árbol de React Elements y ejecuta un callback por cada elemento "hoja", transparentando fragments. Fuente: Código fuente de React en `ReactChildren.js`, React docs sobre `Children`, y discusiones en el repo de React sobre el futuro de `Children`.

---

### 4. [Investigar] ¿Qué son "Slots" en el contexto de React y cómo librerías como `@radix-ui/react-slot` implementan el patrón `asChild`? ¿Cómo se compara esto con `React.cloneElement` y el patrón de Render Props?

**Respuesta**: `Slot` (de Radix UI) es un componente que clona su hijo y le mergea sus propias props. `asChild` es un prop booleano que activa este comportamiento: `<Button asChild><a href="/">Link</a></Button>` renderiza solo el `<a>` con las props y comportamiento del `Button` (estilos, event handlers) mergeados. Internamente, `Slot` usa `React.cloneElement` pero con una lógica de merge más sofisticada: mergea `className`, `style`, event handlers (ejecuta ambos), y props. A diferencia de `cloneElement` básico que sobrescribe props, `Slot` los combina:

```ts
// Simplificado
function Slot({ children, ...props }: { children: React.ReactElement }) {
  return React.cloneElement(children, {
    ...props,
    ...children.props,
    // Merge especial para className, style, event handlers
    className: [props.className, children.props.className].filter(Boolean).join(' '),
    onClick: (...args) => { props.onClick?.(...args); children.props.onClick?.(...args) },
  })
}
```

**Por qué**: `Slot` resuelve el problema de "quiero que mi componente se comporte como un button, pero visualmente quiero que sea un link". Render Props pasarían la responsabilidad al usuario (`<Button render={(props) => <a {...props} />} />`). `Slot`/`asChild` es más declarativo. La diferencia con `cloneElement` simple: `cloneElement` sobrescribe props del hijo con las del padre; `Slot` las mergea inteligentemente (especialmente importante para event handlers donde querés que ambos se ejecuten). Fuente: radix-ui.com/primitives/docs/utilities/slot, código fuente de `@radix-ui/react-slot`, y "The asChild pattern" en el blog de Radix UI.

---

### 5. [Conectar] La clase implementa Tabs con Compound Components usando Context. Conectá esto con el patrón "State Reducer" de Kent C. Dodds. ¿Cómo modificarías nuestros `Tabs` para que el consumidor pueda interceptar y modificar el cambio de tab (ej: prevenir cambiar a un tab específico)?

**Respuesta**: Agregando un `stateReducer` prop al componente `Tabs` que permita al consumidor interceptar las transiciones:

```tsx
type TabsAction = { type: 'SET_ACTIVE'; index: number }
type TabsStateReducer = (state: { activeIndex: number }, action: TabsAction) => { activeIndex: number }

function Tabs({ children, defaultIndex = 0, stateReducer }: TabsProps & { stateReducer?: TabsStateReducer }) {
  const [activeIndex, dispatch] = useReducer((state, action: TabsAction) => {
    if (stateReducer) return stateReducer(state, action) // el consumidor puede modificar
    return { activeIndex: action.index }
  }, { activeIndex: defaultIndex })
  // ...
}
```

El consumidor puede usarlo para validar: `<Tabs stateReducer={(state, action) => { if (action.index === 3 && !canAccess) return state; return { activeIndex: action.index } }}>`.

**Por qué**: El State Reducer Pattern es una forma de "inversion of control" — el componente interno delega la decisión de cómo actualizar el estado al consumidor. Esto es más poderoso que `onChange` (que solo notifica del cambio pero no puede prevenirlo). Kent C. Dodds lo popularizó en Downshift (autocomplete) porque diferentes aplicaciones necesitan diferentes comportamientos (una app quiere cerrar el menú al seleccionar, otra no). Con State Reducer, ambas pueden usar el mismo componente sin forks. Fuente: "The State Reducer Pattern with React Hooks" por Kent C. Dodds, código de Downshift, y aplicación en Headless UI.

---

### 6. [Conectar] La clase menciona `React.cloneElement` para inyectar props. Conectá esto con el patrón "Injector" de React Aria y Radix UI donde los hooks retornan props que se spread sobre elementos. ¿Por qué este enfoque es preferido sobre `cloneElement` en librerías modernas?

**Respuesta**: El enfoque de "props spreading" de React Aria/Radix (hooks retornan `{ role: 'tab', 'aria-selected': true, onClick: ..., onKeyDown: ... }` y el desarrollador los spread sobre elementos) es preferido sobre `cloneElement` porque: (1) es explícito — el desarrollador ve qué props se aplican, (2) es más flexible — puede agregar más props, modificar las retornadas, o aplicarlas selectivamente, (3) no requiere iterar sobre children con `Children.map`, (4) es más performante — no crea nuevos React Elements en cada render. `cloneElement` es frágil: presupone la estructura de children, es más lento (crea nuevos elementos), y es menos transparente.

**Por qué**: Las librerías modernas (Radix UI, React Aria, TanStack Table) migraron al patrón de "hooks que retornan props" porque da más control al desarrollador. En lugar de `<Tabs><Tab index={0}>Pendientes</Tab></Tabs>` donde `Tabs` inyecta props via `cloneElement`, el patrón moderno es: `const tabProps = useTab({ index: 0 }); return <button {...tabProps}>Pendientes</button>`. Esto hace que cada componente sea responsable de su propio render, sin "magia". La desventaja es más boilerplate (necesitás llamar al hook y spread props manualmente). Fuente: "Why we moved from cloneElement to hooks" en el blog de Radix UI, documentación de React Aria, y el patrón "Props Getters" de Kent C. Dodds.

---

### 7. [Conectar] El Accordion de la clase comparte estado entre headers y paneles. Investigá cómo implementarías un Accordion "multi-expand" (múltiples paneles abiertos simultáneamente) usando el mismo patrón de Context en lugar de un solo `activeIndex`. ¿Cómo cambia el tipo de estado?

**Respuesta**: Cambia de `activeIndex: number | null` a `openIndices: Set<number>`:

```tsx
const AccordionContext = createContext<{
  openIndices: Set<number>
  toggle: (index: number) => void
}>(...)

function Accordion({ children, defaultOpen = [] }: AccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set(defaultOpen))
  const toggle = (index: number) => {
    setOpenIndices(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }
  return <AccordionContext.Provider value={{ openIndices, toggle }}>{children}</AccordionContext.Provider>
}

function AccordionPanel({ index, children }: AccordionPanelProps) {
  const { openIndices } = useContext(AccordionContext)
  return openIndices.has(index) ? <div>{children}</div> : null
}
```

**Por qué**: Usar `Set` en lugar de array simplifica las operaciones de toggle (no necesitás buscar y filtrar). La diferencia con single-expand: el estado es un conjunto de índices en lugar de un solo índice, y `toggle` agrega o remueve del conjunto en lugar de reemplazar. La clave es crear un nuevo `Set` en cada actualización (inmutabilidad): `new Set(prev)` crea una copia superficial, luego mutamos la copia, y la seteamos. Fuente: React docs sobre `useState` con objetos complejos, "Building an Accordion Component" en múltiples tutoriales, y el código de Radix UI Accordion.

---

### 8. [Cuestionar] ¿Son los HOCs (Higher-Order Components) obsoletos en la era de hooks? La clase no los cubre en profundidad. ¿Hay casos donde un HOC es superior a un hook, o los hooks reemplazaron completamente a los HOCs?

**Respuesta**: Los hooks reemplazaron a los HOCs para la mayoría de casos, pero los HOCs siguen siendo útiles para: (1) inyectar props a componentes sin modificar su código (ej: `withRouter` de React Router v5), (2) envolver componentes con Providers/Context de forma transparente (`withAuth(Component)`), (3) modificar el comportamiento de renderizado (como `React.memo` que es un HOC). Sin embargo, en React moderno (2026), la mayoría de estos casos se resuelven mejor con hooks + composición. El equipo de React recomienda hooks sobre HOCs para código nuevo.

**Por qué**: Los HOCs tienen desventajas que los hooks resuelven: (1) "wrapper hell" — múltiples HOCs anidados son difíciles de debugear, (2) props colisiones — los HOCs pueden pisar props sin que TypeScript lo detecte, (3) dificultad de tipado — tipar HOCs genéricos con TypeScript es complejo, (4) los HOCs se ejecutan en tiempo de creación del componente, no en render (menos flexible). Los hooks permiten componer lógica directamente en el componente. El único HOC que todo proyecto React moderno usa es `React.memo` (y posiblemente `forwardRef` en React <19). Fuente: "Hooks vs Render Props vs HOCs" por Kent C. Dodds, "Mixins, HOCs, and Hooks" en react.dev, y la charla "Goodbye HOCs" en React Conf.

---

### 9. [Cuestionar] ¿Es `React.cloneElement` un anti-patrón en 2026? Algunas guías de estilo (como la de airbnb) lo desaconsejan porque rompe la transparencia y la type safety. ¿Deberían nuestros Tabs y Accordion usar Context en lugar de `cloneElement`?

**Respuesta**: `cloneElement` no es inherentemente un antipatrón, pero tiene trade-offs que lo hacen menos deseable que alternativas modernas: (1) rompe la type safety (TypeScript no sabe qué props inyectaste), (2) crea nuevos elementos en cada render (costo de performance), (3) es "mágico" — el desarrollador no ve qué props recibe el hijo. Nuestros Tabs usan Context (no `cloneElement`) para compartir estado — `cloneElement` en clase solo se usa para el `RadioGroup`. Para `RadioGroup`, una alternativa con Context sería: `RadioGroup` provee `name` via Context, y `Radio` lo consume. Esto elimina la necesidad de `cloneElement`.

**Por qué**: La tendencia de la industria es hacia Context + hooks y lejos de `cloneElement`. React Aria, Radix UI, Headless UI, y TanStack evitan `cloneElement` en favor de Context y hooks que retornan props. La única excepción es `Slot` (que internamente usa `cloneElement` pero con merge inteligente) para el patrón `asChild`. La recomendación: preferí Context + hooks para comunicación padre-hijo, y reservá `cloneElement` para casos muy específicos donde necesitás modificar props de hijos que no controlás (como `asChild`/`Slot`). Fuente: "Avoid cloneElement" en el style guide de airbnb, "Patterns for Composing React Components" en el blog de React, y discusiones en el repo de Radix UI.

---

### 10. [Cuestionar] ¿Son los Compound Components siempre la mejor solución para componentes de UI? Algunos argumentan que la API de "props object" es más simple y TypeScript-friendly. Compará `<Tabs><Tab>...</Tab></Tabs>` vs `<Tabs items={[{ label: 'Tab1', content: <Panel1 /> }]} />`.

**Respuesta**: La API de "props object" (configuración) es más simple para casos predecibles y estáticos — el tipo de TypeScript es claro, no hay "magia" de Context. La API de Compound Components es superior cuando: (1) el contenido de cada subcomponente es JSX complejo (no solo strings), (2) el orden y la presencia de subcomponentes es variable, (3) necesitás intercalar elementos entre subcomponentes, (4) la personalización de cada parte es extrema (diferentes wrappers, diferentes estilos, diferentes comportamientos). Para un Tabs simple con 3 tabs de texto, la API de props es mejor. Para un Tabs donde cada panel tiene formularios, gráficos, y componentes complejos, Compound Components es mejor.

**Por qué**: El debate es sobre flexibilidad vs simplicidad. La API de props es más restringida pero más predecible y fácil de tipar. Compound Components permiten cualquier estructura de JSX pero son más complejos de implementar y tipar. La tendencia: para componentes de aplicación (específicos de TaskFlow), preferí props simples. Para componentes de UI reutilizables (que usarás en muchos lugares), considerá Compound Components si la flexibilidad lo justifica. Fuente: "Compound Components vs Configuration" en el blog de Kent C. Dodds, "The Spectrum of Component APIs" por Tanner Linsley, y discusiones en el repo de Radix UI.
